// ═══════════════════════════════════════════════════════════════════
// supabase/functions/send-otp/index.ts
// Supabase Edge Function: Generate and send an OTP via SMS
//
// DEPLOY WITH:
//   npx supabase functions deploy send-otp
//
// ENVIRONMENT VARIABLES REQUIRED (set in Supabase Dashboard > Project Settings > Edge Functions):
//   TWILIO_ACCOUNT_SID   — Your Twilio Account SID
//   TWILIO_AUTH_TOKEN    — Your Twilio Auth Token
//   TWILIO_FROM_NUMBER   — Your Twilio verified phone number (e.g. +15551234567)
// ═══════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultOrigin = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",")[0]?.trim() || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": defaultOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json() as { phone: string };

    if (!phone || typeof phone !== "string") {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize phone number: strip spaces / dashes, ensure it starts with +
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^\+\d{7,15}$/.test(normalized)) {
      return new Response(JSON.stringify({ error: "Invalid phone format. Use E.164 format, e.g. +201234567890" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase admin client (service role key is injected automatically in Edge Functions)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Rate Limit Check ──────────────────────────────────────────
    // Allow max 3 OTP requests per phone number per 15 minutes.
    const { data: existing } = await supabase
      .from("phone_verifications")
      .select("attempts_count, locked_until, updated_at")
      .eq("phone_number", normalized)
      .maybeSingle();

    const now = new Date();

    if (existing) {
      // Check if currently locked
      if (existing.locked_until && new Date(existing.locked_until) > now) {
        const remainingMs = new Date(existing.locked_until).getTime() - now.getTime();
        const remainingMins = Math.ceil(remainingMs / 60000);
        return new Response(
          JSON.stringify({ error: `Too many attempts. Please wait ${remainingMins} minutes.` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if 15-minute window has reset
      const windowStart = new Date(now.getTime() - 15 * 60 * 1000);
      const lastUpdated = new Date(existing.updated_at);

      if (lastUpdated > windowStart && existing.attempts_count >= 3) {
        // Lock for 15 minutes
        const lockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
        await supabase
          .from("phone_verifications")
          .update({ locked_until: lockedUntil.toISOString() })
          .eq("phone_number", normalized);

        return new Response(
          JSON.stringify({ error: "Too many verification attempts. Please wait 15 minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Generate OTP ───────────────────────────────────────────────
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // Expires in 10 minutes

    // ── Upsert into phone_verifications ───────────────────────────
    const { error: upsertError } = await supabase
      .from("phone_verifications")
      .upsert(
        {
          phone_number: normalized,
          current_otp: otp,
          is_verified: false,
          otp_expires_at: expiresAt.toISOString(),
          locked_until: null,
          attempts_count: existing ? existing.attempts_count + 1 : 1,
        },
        { onConflict: "phone_number" }
      );

    if (upsertError) {
      throw new Error(`DB error: ${upsertError.message}`);
    }

    // ── Send SMS via Twilio ────────────────────────────────────────
    // Try env vars first (set in Supabase Dashboard), then fall back to Vault
    let twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    let twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    let twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");

    // If not in env, read from app_config table (stored via DATABASE_TWILIO_SECRETS.sql)
    if (!twilioSid || !twilioToken || !twilioFrom) {
      const { data: sidData } = await supabase.rpc('get_app_config', { config_key: 'TWILIO_ACCOUNT_SID' });
      const { data: tokenData } = await supabase.rpc('get_app_config', { config_key: 'TWILIO_AUTH_TOKEN' });
      const { data: fromData } = await supabase.rpc('get_app_config', { config_key: 'TWILIO_FROM_NUMBER' });
      twilioSid = twilioSid ?? sidData;
      twilioToken = twilioToken ?? tokenData;
      twilioFrom = twilioFrom ?? fromData;
    }

    if (!twilioSid || !twilioToken || !twilioFrom) {
      // Twilio is not configured — return OTP in dev mode only
      console.warn("[DEV MODE] Twilio not configured. OTP:", otp, "for", normalized);
      return new Response(
        JSON.stringify({ success: true, dev_otp: otp, message: "Twilio not configured — OTP logged to console." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const messageBody = `Your Lumos verification code is: ${otp}. Valid for 10 minutes. Do not share it with anyone.`;

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
      },
      body: new URLSearchParams({
        To: normalized,
        From: twilioFrom,
        Body: messageBody,
      }),
    });

    if (!twilioResponse.ok) {
      const errBody = await twilioResponse.text();
      throw new Error(`Twilio error: ${errBody}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-otp error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
