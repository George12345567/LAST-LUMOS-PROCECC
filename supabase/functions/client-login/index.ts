/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { compareSync as bcryptCompareSync, hashSync as bcryptHashSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

const isSha256Hex = (value: string): boolean => /^[a-f0-9]{64}$/i.test(value || "");
const isBcryptHash = (value: string): boolean => /^\$2[aby]\$\d{2}\$/.test(value || "");
const normalizeAnswer = (value: string): string => value.toLowerCase().trim();

const sanitizeClient = (client: Record<string, unknown>) => {
    const { password, password_hash, security_answer, two_factor_secret, login_attempts, locked_until, ...safe } = client;
    return safe;
};

const roleForClient = (client: Record<string, unknown>): "admin" | "client" => {
    const explicitRole = String(client.role || "").toLowerCase();
    if (explicitRole === "admin") return "admin";
    return "client";
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        const action = String(body?.action || "login");

        if (action !== "login" && action !== "verifySecurity" && action !== "logAttempt" && action !== "refreshProfile" && action !== "checkPhone") {
            return json({ success: false, error: "Unsupported action" }, 400);
        }

        if (action === "logAttempt") {
            const username = String(body?.username || "").trim();
            const success = Boolean(body?.success);
            const reason = body?.reason ? String(body.reason) : null;
            const userAgent = body?.userAgent ? String(body.userAgent) : null;
            const deviceInfo = (body?.deviceInfo && typeof body.deviceInfo === "object") ? body.deviceInfo : null;
            if (!username) return json({ success: false, error: "username is required" }, 400);
            const { error } = await supabase.from("login_attempts").insert({
                username,
                success,
                failure_reason: reason,
                user_agent: userAgent,
                device_info: deviceInfo,
            });
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "refreshProfile") {
            const clientId = String(body?.clientId || "");
            if (!clientId) return json({ success: false, error: "clientId is required" }, 400);
            const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).single();
            if (error || !data) return json({ success: false, error: "Client not found" }, 404);
            const role = roleForClient(data);
            const tokenSecret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
            if (!tokenSecret) return json({ success: false, error: "Session token secret is not configured" }, 500);
            const sessionToken = await createSessionToken({
                sub: data.id,
                role,
                username: data.username,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
            }, tokenSecret);
            return json({ success: true, client: { ...sanitizeClient(data), role }, sessionToken });
        }

        if (action === "checkPhone") {
            const phone = String(body?.phone || "").trim();
            if (!phone) return json({ success: true, exists: false });
            const { data, error } = await supabase
                .from("clients")
                .select("id")
                .eq("username", phone)
                .maybeSingle();
            if (error && error.code !== "PGRST116") return json({ success: false, error: error.message }, 500);
            return json({ success: true, exists: !!data });
        }

        if (action === "login") {
            const username = String(body?.username || "").trim();
            const password = String(body?.password || "");

            if (!username || !password) {
                return json({ success: false, error: "Please enter your username and password" }, 400);
            }

            const { data: client, error } = await supabase
                .from("clients")
                .select("*")
                .eq("username", username)
                .single();

            if (error || !client) {
                return json({ success: false, error: "Invalid username or password" }, 200);
            }

            if (client.locked_until) {
                const lockedUntil = new Date(client.locked_until);
                if (lockedUntil > new Date()) {
                    const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
                    return json({
                        success: false,
                        locked: true,
                        lockedUntil: client.locked_until,
                        error: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}`,
                    });
                }

                await supabase.from("clients").update({ locked_until: null, login_attempts: 0 }).eq("id", client.id);
            }

            const incomingHash = await sha256(password);
            const storedPassword = String(client.password || "");
            const storedHash = String(client.password_hash || "");

            let passwordMatch = false;
            let matchedLegacy = false;

            if (storedHash && isBcryptHash(storedHash)) {
                passwordMatch = bcryptCompareSync(password, storedHash);
            } else if (storedPassword && isBcryptHash(storedPassword)) {
                passwordMatch = bcryptCompareSync(password, storedPassword);
            } else if (storedHash && isSha256Hex(storedHash)) {
                passwordMatch = incomingHash === storedHash;
            } else if (storedPassword && isSha256Hex(storedPassword)) {
                passwordMatch = incomingHash === storedPassword;
            } else {
                passwordMatch = password === storedPassword;
                matchedLegacy = passwordMatch;
            }

            if (!passwordMatch) {
                const newAttempts = (client.login_attempts || 0) + 1;
                const updateData: Record<string, unknown> = { login_attempts: newAttempts };
                if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                    updateData.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
                    updateData.login_attempts = 0;
                }

                await supabase.from("clients").update(updateData).eq("id", client.id);

                if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                    return json({ success: false, locked: true, error: `Account locked for ${LOCKOUT_MINUTES} minutes due to multiple failed attempts` });
                }

                const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
                return json({
                    success: false,
                    remainingAttempts: remaining > 0 ? remaining : 0,
                    error: remaining > 0
                        ? `Incorrect password. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining`
                        : "Invalid username or password",
                });
            }

            if (matchedLegacy) {
                const bcryptValue = bcryptHashSync(password);
                await supabase.from("clients").update({ password: bcryptValue, password_hash: bcryptValue }).eq("id", client.id);
            } else if ((storedHash && isSha256Hex(storedHash)) || (storedPassword && isSha256Hex(storedPassword))) {
                const bcryptValue = bcryptHashSync(password);
                await supabase.from("clients").update({ password: bcryptValue, password_hash: bcryptValue }).eq("id", client.id);
            }

            if (client.security_question) {
                return json({
                    success: false,
                    requiresSecurity: true,
                    securityQuestion: client.security_question,
                    client: sanitizeClient(client),
                });
            }

            await supabase
                .from("clients")
                .update({ login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
                .eq("id", client.id);

            const role = roleForClient(client);
            const tokenSecret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
            if (!tokenSecret) return json({ success: false, error: "Session token secret is not configured" }, 500);
            const sessionToken = await createSessionToken({
                sub: client.id,
                role,
                username: client.username,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
            }, tokenSecret);

            return json({ success: true, client: { ...sanitizeClient(client), role }, sessionToken });
        }

        const clientId = String(body?.clientId || "");
        const answer = String(body?.answer || "");

        if (!clientId || !answer.trim()) {
            return json({ success: false, error: "Please enter your answer" }, 400);
        }

        const { data: client, error } = await supabase.from("clients").select("*").eq("id", clientId).single();
        if (error || !client) return json({ success: false, error: "Something went wrong. Please log in again" }, 400);

        const storedAnswer = String(client.security_answer || "");
        const incomingAnswerHash = await sha256(normalizeAnswer(answer));
        const incomingLegacy = normalizeAnswer(answer);

        let answerMatches = false;
        let legacyAnswer = false;
        if (storedAnswer && isSha256Hex(storedAnswer)) {
            answerMatches = storedAnswer === incomingAnswerHash;
        } else {
            answerMatches = storedAnswer === incomingLegacy;
            legacyAnswer = answerMatches;
        }

        if (!answerMatches) {
            return json({ success: false, error: "Incorrect security answer" });
        }

        if (legacyAnswer) {
            await supabase.from("clients").update({ security_answer: incomingAnswerHash }).eq("id", client.id);
        }

        await supabase
            .from("clients")
            .update({ login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
            .eq("id", client.id);

        const role = roleForClient(client);
        const tokenSecret = Deno.env.get("SESSION_TOKEN_SECRET") || "";
        if (!tokenSecret) return json({ success: false, error: "Session token secret is not configured" }, 500);
        const sessionToken = await createSessionToken({
            sub: client.id,
            role,
            username: client.username,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
        }, tokenSecret);

        return json({ success: true, client: { ...sanitizeClient(client), role }, sessionToken });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return json({ success: false, error: message }, 500);
    }
});
