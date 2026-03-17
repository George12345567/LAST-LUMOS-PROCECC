/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashSync as bcryptHashSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const defaultOrigin = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",")[0]?.trim() || "*";

const corsHeaders = {
    "Access-Control-Allow-Origin": defaultOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-api-key",
};

const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const fromBase64Url = (value: string): Uint8Array => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
    const raw = atob(base64);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

const verifySessionToken = async (token: string, secret: string): Promise<Record<string, unknown> | null> => {
    try {
        const [header, body, sig] = token.split(".");
        if (!header || !body || !sig) return null;
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(sig), new TextEncoder().encode(`${header}.${body}`));
        if (!ok) return null;
        const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Record<string, unknown>;
        const exp = Number(payload.exp || 0);
        if (!exp || Date.now() / 1000 > exp) return null;
        return payload;
    } catch {
        return null;
    }
};

const secureHash = (value: string): string => bcryptHashSync(value);

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const sessionToken = req.headers.get("x-session-token") || "";
        const secret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
        if (!sessionToken || !secret) {
            return json({ success: false, error: "Unauthorized" }, 401);
        }
        const session = await verifySessionToken(sessionToken, secret);
        if (!session || String(session.role || "") !== "admin") return json({ success: false, error: "Unauthorized" }, 401);

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        const action = String(body?.action || "");

        if (action === "create") {
            const payload = body?.payload || {};
            const username = String(payload.username || "").trim();
            const rawPassword = String(payload.password || "").trim();
            if (!username || !rawPassword) return json({ success: false, error: "username and password are required" }, 400);

            const passwordHash = secureHash(rawPassword);
            const insertPayload = {
                username,
                company_name: String(payload.company_name || ""),
                status: String(payload.status || "active"),
                package_name: String(payload.package_name || ""),
                role: String(payload.role || "client"),
                password: passwordHash,
                password_hash: passwordHash,
                created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase.from("clients").insert(insertPayload).select("id, username").single();
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true, data });
        }

        if (action === "update") {
            const clientId = String(body?.clientId || "");
            const payload = body?.payload || {};
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);

            const updatePayload = { ...payload };
            if (typeof updatePayload.password === "string" && updatePayload.password.trim()) {
                const passwordHash = secureHash(updatePayload.password.trim());
                updatePayload.password = passwordHash;
                updatePayload.password_hash = passwordHash;
            }

            const { error } = await supabase.from("clients").update(updatePayload).eq("id", clientId);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "delete") {
            const clientId = String(body?.clientId || "");
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);
            const { error } = await supabase.from("clients").delete().eq("id", clientId);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        return json({ success: false, error: "Unsupported action" }, 400);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return json({ success: false, error: message }, 500);
    }
});
