/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

    try {
        const sessionToken = req.headers.get("x-session-token") || "";
        const secret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
        if (!sessionToken || !secret) return json({ success: false, error: "Unauthorized" }, 401);
        const session = await verifySessionToken(sessionToken, secret);
        if (!session || String(session.role || "") !== "admin") return json({ success: false, error: "Unauthorized" }, 401);

        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const body = await req.json();
        const action = String(body?.action || "snapshot");

        if (action === "snapshot") {
            const clientId = String(body?.clientId || "");
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);

            const [subscription, packages, messages, projects, pricing, updates, profile, assets, orders] = await Promise.all([
                supabase.from("clients").select("subscription_config, active_offer, active_offer_link, package_name, package_details, status, progress, next_steps, admin_notes, company_name, username, created_at").eq("id", clientId).single(),
                supabase.from("packages").select("id,name,price").order("price"),
                supabase.from("client_messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true }),
                supabase.from("saved_designs").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
                supabase.from("pricing_requests").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
                supabase.from("client_updates").select("id,title,type,update_date").eq("client_id", clientId).order("update_date", { ascending: false }).limit(6),
                supabase.from("clients").select("avatar_style, avatar_seed, avatar_config, avatar_url, display_name, bio, tagline, website, location, timezone, social_links, brand_colors, logo_url, cover_gradient, theme_accent, profile_visible").eq("id", clientId).single(),
                supabase.from("client_assets").select("id,file_name,uploaded_at,file_type").eq("client_id", clientId).order("uploaded_at", { ascending: false }).limit(6),
                supabase.from("orders").select("id,total_price,status,created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
            ]);

            return json({
                success: true,
                data: {
                    subscription: subscription.data || null,
                    packages: packages.data || [],
                    messages: messages.data || [],
                    projects: projects.data || [],
                    pricingRequests: pricing.data || [],
                    updates: updates.data || [],
                    profile: profile.data || null,
                    assets: assets.data || [],
                    orders: orders.data || [],
                },
            });
        }

        if (action === "updateClient") {
            const clientId = String(body?.clientId || "");
            const payload = body?.payload || {};
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);
            const { error } = await supabase.from("clients").update(payload).eq("id", clientId);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "updatePricingRequest") {
            const requestId = String(body?.requestId || "");
            const payload = body?.payload || {};
            if (!requestId) return json({ success: false, error: "requestId is required" }, 400);
            const { error } = await supabase.from("pricing_requests").update(payload).eq("id", requestId);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "insertClientUpdate") {
            const payload = body?.payload || {};
            const { error } = await supabase.from("client_updates").insert(payload);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "sendAdminMessage") {
            const payload = body?.payload || {};
            const { error } = await supabase.from("client_messages").insert(payload);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "markMessagesRead") {
            const clientId = String(body?.clientId || "");
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);
            const { error } = await supabase
                .from("client_messages")
                .update({ is_read: true })
                .eq("client_id", clientId)
                .eq("sender", "client");
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "recordAsset") {
            const payload = body?.payload || {};
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
