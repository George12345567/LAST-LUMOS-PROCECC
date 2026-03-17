/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashSync as bcryptHashSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const defaultOrigin = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",")[0]?.trim() || "*";

const corsHeaders = {
    "Access-Control-Allow-Origin": defaultOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256 = async (value: string): Promise<string> => {
    const encoded = new TextEncoder().encode(value);
    return toHex(await crypto.subtle.digest("SHA-256", encoded));
};

const isSha256Hex = (value: string): boolean => /^[a-f0-9]{64}$/i.test(value || "");
const normalizeAnswer = (value: string): string => value.toLowerCase().trim();

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        const action = String(body?.action || "reset");

        if (action === "identify") {
            const normalizedUsername = String(body?.username || "").trim();
            const normalizedEmail = String(body?.email || "").trim().toLowerCase();
            if (!normalizedUsername || !normalizedEmail) {
                return json({ success: false, error: "username and email are required" }, 400);
            }

            const { data: client, error } = await supabase
                .from("clients")
                .select("id, email, security_question")
                .eq("username", normalizedUsername)
                .maybeSingle();

            if (error || !client) return json({ success: false, error: "No account found with that username" }, 404);
            if (String(client.email || "").toLowerCase() !== normalizedEmail) {
                return json({ success: false, error: "Email does not match our records" }, 400);
            }

            return json({
                success: true,
                data: {
                    clientId: client.id,
                    securityQuestion: client.security_question || null,
                },
            });
        }

        if (action === "verifySecurity") {
            const clientId = String(body?.clientId || "");
            const answer = String(body?.securityAnswer || "");
            if (!clientId || !answer.trim()) {
                return json({ success: false, error: "clientId and securityAnswer are required" }, 400);
            }

            const { data: client, error } = await supabase
                .from("clients")
                .select("id, security_answer")
                .eq("id", clientId)
                .single();

            if (error || !client) return json({ success: false, error: "Session expired. Please start over." }, 404);

            const storedAnswer = String(client.security_answer || "");
            const incomingHash = await sha256(normalizeAnswer(answer));
            const incomingLegacy = normalizeAnswer(answer);
            const answerMatch = isSha256Hex(storedAnswer) ? storedAnswer === incomingHash : storedAnswer === incomingLegacy;

            if (!answerMatch) {
                return json({ success: false, error: "Incorrect security answer" }, 400);
            }

            if (!isSha256Hex(storedAnswer)) {
                await supabase.from("clients").update({ security_answer: incomingHash }).eq("id", client.id);
            }

            return json({ success: true });
        }

        const { username, email, securityAnswer, newPassword } = body;

        const normalizedUsername = String(username || "").trim();
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const answer = String(securityAnswer || "");
        const password = String(newPassword || "");

        if (!normalizedUsername || !normalizedEmail || !answer.trim() || !password) {
            return json({ success: false, error: "Missing required fields" }, 400);
        }

        if (password.length < 6) {
            return json({ success: false, error: "Password must be at least 6 characters" }, 400);
        }

        const { data: client, error } = await supabase
            .from("clients")
            .select("id, email, username, security_answer")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (error || !client) return json({ success: false, error: "No account found with that username" }, 404);
        if (String(client.email || "").toLowerCase() !== normalizedEmail) {
            return json({ success: false, error: "Email does not match our records" }, 400);
        }

        const storedAnswer = String(client.security_answer || "");
        const incomingHash = await sha256(normalizeAnswer(answer));
        const incomingLegacy = normalizeAnswer(answer);
        const answerMatch = isSha256Hex(storedAnswer) ? storedAnswer === incomingHash : storedAnswer === incomingLegacy;

        if (!answerMatch) {
            return json({ success: false, error: "Incorrect security answer" }, 400);
        }

        const passwordHash = bcryptHashSync(password);

        const { error: updateError } = await supabase
            .from("clients")
            .update({
                password: passwordHash,
                password_hash: passwordHash,
                security_answer: incomingHash,
                login_attempts: 0,
                locked_until: null,
            })
            .eq("id", client.id);

        if (updateError) return json({ success: false, error: "Failed to reset password" }, 500);

        return json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return json({ success: false, error: message }, 500);
    }
});
