// ═══════════════════════════════════════════════════════════════════
// supabase/functions/verify-otp/index.ts
// Supabase Edge Function: Verify the OTP submitted by the user
//
// DEPLOY WITH:
//   npx supabase functions deploy verify-otp
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json() as { phone: string; otp: string };

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "Phone and OTP are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = phone.replace(/[\s()-]/g, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the current verification record
    const { data, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone_number", normalized)
      .maybeSingle();

    if (fetchError || !data) {
      return new Response(JSON.stringify({ error: "No pending verification for this number." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already verified
    if (data.is_verified) {
      return new Response(JSON.stringify({ success: true, message: "Phone is already verified." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (data.otp_expires_at && new Date(data.otp_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "OTP has expired. Please request a new one." }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify OTP match
    if (data.current_otp !== otp.trim()) {
      return new Response(JSON.stringify({ error: "Incorrect code. Please try again." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mark as verified ──────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("phone_verifications")
      .update({
        is_verified: true,
        current_otp: null, // Clear OTP after use for security
        otp_expires_at: null,
      })
      .eq("phone_number", normalized);

    if (updateError) {
      throw new Error(`DB update error: ${updateError.message}`);
    }

    // ── Also update `clients` table if a matching client exists ───
    // This ensures logged-in users get their `is_phone_verified` flag set
    const { error: clientUpdateError } = await supabase
      .from("clients")
      .update({ is_phone_verified: true })
      .eq("phone_number", normalized);

    // clientUpdateError is intentionally silent — the user may not be a client yet (guest flow)
    if (clientUpdateError) {
      console.warn("Could not update clients table:", clientUpdateError.message);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Phone number verified successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
