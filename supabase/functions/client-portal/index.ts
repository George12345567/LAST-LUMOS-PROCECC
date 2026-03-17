/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultOrigin = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",")[0]?.trim() || "*";

const corsHeaders = {
    "Access-Control-Allow-Origin": defaultOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        const data = `${header}.${body}`;
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(sig), new TextEncoder().encode(data));
        if (!ok) return null;
        const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Record<string, unknown>;
        const exp = Number(payload.exp || 0);
        if (!exp || Date.now() / 1000 > exp) return null;
        return payload;
    } catch {
        return null;
    }
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

    try {
        const sessionToken = req.headers.get("x-session-token") || "";
        const secret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
        if (!sessionToken || !secret) return json({ success: false, error: "Unauthorized" }, 401);
        const session = await verifySessionToken(sessionToken, secret);
        if (!session) return json({ success: false, error: "Unauthorized" }, 401);

        const role = String(session.role || "");
        const tokenClientId = String(session.sub || "");
        if (role !== "client" && role !== "admin") return json({ success: false, error: "Forbidden" }, 403);

        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const body = await req.json();
        const action = String(body?.action || "snapshot");

        if (action === "snapshot") {
            const clientId = String(body?.clientId || "");
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);
            if (role === "client" && clientId !== tokenClientId) return json({ success: false, error: "Forbidden" }, 403);

            const [cr, ur, mr, ar, pr, or] = await Promise.all([
                supabase.from("clients").select("*").eq("id", clientId).single(),
                supabase.from("client_updates").select("*").eq("client_id", clientId).order("update_date", { ascending: false }),
                supabase.from("client_messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true }),
                supabase.from("client_assets").select("*").eq("client_id", clientId).order("uploaded_at", { ascending: false }),
                supabase.from("pricing_requests").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
                supabase.from("orders").select("id,status,total_price,created_at,package_type").eq("client_id", clientId).order("created_at", { ascending: false }),
            ]);

            if (cr.error) return json({ success: false, error: cr.error.message }, 500);

            return json({
                success: true,
                data: {
                    client: cr.data,
                    updates: ur.data || [],
                    messages: mr.data || [],
                    assets: ar.data || [],
                    pricingRequests: pr.data || [],
                    orders: or.data || [],
                },
            });
        }

        if (action === "sendMessage") {
            const clientId = String(body?.clientId || "");
            const message = String(body?.message || "").trim();
            if (!clientId || !message) return json({ success: false, error: "clientId and message are required" }, 400);
            if (role === "client" && clientId !== tokenClientId) return json({ success: false, error: "Forbidden" }, 403);

            const { error } = await supabase.from("client_messages").insert([{ client_id: clientId, sender: "client", message, is_read: false }]);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "recordAsset") {
            const payload = body?.payload || {};
            if (role === "client") {
                const payloadClientId = String(payload?.client_id || "");
                if (!payloadClientId || payloadClientId !== tokenClientId) return json({ success: false, error: "Forbidden" }, 403);
            }
            const { error } = await supabase.from("client_assets").insert(payload);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        return json({ success: false, error: "Unsupported action" }, 400);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return json({ success: false, error: message }, 500);
    }
});
