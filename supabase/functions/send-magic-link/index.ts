/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultOrigin = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",")[0]?.trim() || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": defaultOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const createToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const toBase64Url = (value: Uint8Array): string =>
  btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const createSessionToken = async (payload: Record<string, unknown>, secret: string): Promise<string> => {
  const header = toBase64Url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  return `${data}.${toBase64Url(sig)}`;
};

const isBaseUrlAllowed = (baseUrl: string): boolean => {
  try {
    const parsed = new URL(baseUrl);
    const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (allowed.length === 0) return false;
    return allowed.includes(parsed.origin);
  } catch {
    return false;
  }
};

const roleForClient = (client: Record<string, unknown>): "admin" | "client" => {
  const explicitRole = String(client.role || "").toLowerCase();
  if (explicitRole === "admin") return "admin";
  return "client";
};

const isRedirectAllowed = (redirectPath: string): boolean => {
  if (!redirectPath || !redirectPath.startsWith("/")) return false;
  const allowed = (Deno.env.get("MAGIC_LINK_ALLOWED_PATHS") || "/magic-login,/client-login")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return allowed.some((prefix) => redirectPath.startsWith(prefix));
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const action = String(body?.action || "request");

    if (action === "request") {
      const email = String(body?.email || "").trim().toLowerCase();
      const baseUrl = String(body?.baseUrl || "").trim();
      const redirectPath = String(body?.redirectPath || "/magic-login");
      const userAgent = String(body?.userAgent || "");

      if (!email || !baseUrl || !isBaseUrlAllowed(baseUrl) || !isRedirectAllowed(redirectPath)) {
        return json({ success: false, error: "Invalid magic link request payload" }, 400);
      }

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, email, username, status")
        .eq("email", email)
        .maybeSingle();

      if (clientError || !client || client.status === "suspended" || client.status === "blocked") {
        return json({ success: true, email });
      }

      const { count } = await supabase
        .from("magic_links")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

      if ((count || 0) >= 5) {
        return json({ success: false, error: "Too many requests. Please try again later." }, 429);
      }

      const token = createToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await supabase.from("magic_links").delete().eq("client_id", client.id).eq("is_used", false);

      const { error: insertError } = await supabase
        .from("magic_links")
        .insert({
          token,
          client_id: client.id,
          email,
          expires_at: expiresAt,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        });

      if (insertError) return json({ success: false, error: "Failed to generate magic link" }, 500);

      const magicUrl = `${baseUrl.replace(/\/$/, "")}${redirectPath}/${token}`;

      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const fromEmail = Deno.env.get("MAGIC_LINK_FROM_EMAIL") || "Lumos <no-reply@getlumos.studio>";
      if (!resendApiKey) return json({ success: false, error: "Email provider is not configured" }, 500);

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
          <h2 style="margin:0 0 12px;color:#0f172a;">Your secure Lumos sign-in link</h2>
          <p style="margin:0 0 16px;line-height:1.6;">Hi ${client.username}, click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
          <a href="${magicUrl}" style="display:inline-block;background:#0ea5e9;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Sign in to Lumos</a>
          <p style="margin:18px 0 0;line-height:1.6;color:#334155;">If you did not request this, you can safely ignore this message.</p>
        </div>
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Your Lumos Login Link",
          html,
        }),
      });

      if (!resendResponse.ok) {
        const providerError = await resendResponse.text();
        return json({ success: false, error: "Failed to send email", providerError }, 502);
      }

      return json({ success: true, email });
    }

    if (action === "verify") {
      const token = String(body?.token || "").trim();
      if (!token) return json({ success: false, error: "Invalid magic link" }, 400);

      const { data: magicLink, error: linkError } = await supabase
        .from("magic_links")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (linkError || !magicLink) return json({ success: false, error: "This link is invalid or has already been used." }, 404);
      if (magicLink.is_used) return json({ success: false, error: "This link has already been used. Please request a new one." }, 400);
      if (new Date(magicLink.expires_at) < new Date()) return json({ success: false, expired: true, error: "This link has expired. Please request a new one." }, 400);

      await supabase.from("magic_links").update({ is_used: true, used_at: new Date().toISOString() }).eq("id", magicLink.id);

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", magicLink.client_id)
        .single();

      if (clientError || !client) return json({ success: false, error: "Account not found." }, 404);

      await supabase
        .from("clients")
        .update({ login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
        .eq("id", client.id);

      const { password, password_hash, security_answer, two_factor_secret, login_attempts, locked_until, ...safeClient } = client;
      const role = roleForClient(client);
      const tokenSecret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
      if (!tokenSecret) return json({ success: false, error: "Session token secret is not configured" }, 500);
      const sessionToken = await createSessionToken({
        sub: client.id,
        role,
        username: client.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      }, tokenSecret);
      return json({ success: true, client: { ...safeClient, role }, sessionToken });
    }

    return json({ success: false, error: "Unsupported action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ success: false, error: message }, 500);
  }
});
