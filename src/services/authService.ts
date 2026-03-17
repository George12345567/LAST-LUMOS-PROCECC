/**
 * ═══════════════════════════════════════════════════════════════════
 * Auth Service - Centralized Authentication Logic
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Handles:
 * - Client login (custom clients table)
 * - Login attempt tracking
 * - Account lockout protection
 * - Session management
 * - Logout
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { collectBrowserData } from '@/lib/collectBrowserData';

const EDGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const EDGE_HEADERS = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

// ─── Types ───────────────────────────────────────────────────────

export interface AuthClient {
    id: string;
    username: string;
    company_name?: string;
    package_name?: string;
    status?: string;
    progress?: number;
    next_steps?: string;
    package_details?: Record<string, unknown>;
    subscription_config?: Record<string, unknown>;
    active_offer?: string;
    active_offer_link?: string;
    admin_notes?: string;
    security_question?: string;
    created_at: string;
    // Profile fields
    avatar_style?: string;
    avatar_seed?: string;
    avatar_config?: Record<string, unknown>;
    display_name?: string;
    theme_accent?: string;
    role?: 'admin' | 'client';
    session_token?: string;
}

export interface LoginResult {
    success: boolean;
    requiresSecurity?: boolean;
    securityQuestion?: string;
    client?: AuthClient;
    error?: string;
    locked?: boolean;
    lockedUntil?: string;
    remainingAttempts?: number;
}

export interface SecurityVerifyResult {
    success: boolean;
    client?: AuthClient;
    error?: string;
}

export interface MagicLinkResult {
    success: boolean;
    error?: string;
    email?: string;
}

export interface MagicLinkVerifyResult {
    success: boolean;
    client?: AuthClient;
    error?: string;
    expired?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;
const SESSION_KEY = 'lumos_client_v2';
const AUTH_KEY = 'lumos_authenticated_v2';
const SESSION_EXPIRY_KEY = 'lumos_session_expiry_v2';
const AUTH_EVENT_KEY = 'lumos_auth_event_v1';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Legacy keys to clean up from older versions
const LEGACY_KEYS = [
    'lumos_client', 'lumos_authenticated', 'lumos_session_expiry',
    'client', 'isAuthenticated'
];

const AUTH_COOKIES = [
    'sidebar:state',
    'lumos_client',
    'lumos_client_v2',
    'lumos_authenticated',
    'lumos_authenticated_v2',
    'lumos_session_expiry',
    'lumos_session_expiry_v2'
];

// ─── Helper: Strip sensitive fields from client data ─────────────

interface RawClientRow extends Record<string, unknown> {
    id: string;
    username: string;
    password?: string;
    password_hash?: string;
    security_question?: string;
    security_answer?: string;
    two_factor_secret?: string;
    login_attempts?: number;
    locked_until?: string | null;
    locked_until_value?: string;
    company_name?: string;
    package_name?: string;
    status?: string;
    progress?: number;
    next_steps?: string;
    package_details?: Record<string, unknown>;
    subscription_config?: Record<string, unknown>;
    active_offer?: string;
    active_offer_link?: string;
    admin_notes?: string;
    created_at: string;
    last_login_at?: string;
    email_verified?: boolean;
}

function sanitizeClient(client: RawClientRow): AuthClient {
    const {
        password,
        password_hash,
        security_answer,
        two_factor_secret,
        login_attempts,
        locked_until,
        ...safeData
    } = client;
    return safeData as AuthClient;
}

// ─── Auth Service ────────────────────────────────────────────────

export const authService = {

    emitAuthChanged(type: 'login' | 'logout') {
        try {
            const payload = JSON.stringify({ type, ts: Date.now() });
            localStorage.setItem(AUTH_EVENT_KEY, payload);
            localStorage.removeItem(AUTH_EVENT_KEY);
            window.dispatchEvent(new CustomEvent('lumos:auth:changed', { detail: { type } }));
        } catch {
            // Non-critical; auth must continue even if sync broadcast fails.
        }
    },

    // ─── Step 1: Credentials Login ──────────────────────────────
    async login(username: string, password: string): Promise<LoginResult> {
        try {
            // Ensure no stale previous-session state before a new login attempt.
            this.clearSession();

            if (!username?.trim() || !password?.trim()) {
                return { success: false, error: 'Please enter your username and password' };
            }
            const response = await fetch(`${EDGE_BASE_URL}/client-login`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({
                    action: 'login',
                    username: username.trim(),
                    password,
                    browserData: collectBrowserData(),
                    userAgent: navigator.userAgent,
                }),
            });

            const payload = await response.json().catch(() => ({ success: false, error: 'Login service unavailable' }));
            if (!response.ok) {
                return { success: false, error: payload.error || 'Login failed. Please try again.' };
            }

            if (payload.success && payload.client) {
                const safeClient = { ...(payload.client as AuthClient), session_token: String(payload.sessionToken || '') };
                this.saveSession(safeClient);
                return { success: true, client: safeClient };
            }

            return {
                success: false,
                requiresSecurity: payload.requiresSecurity,
                securityQuestion: payload.securityQuestion,
                client: payload.client,
                locked: payload.locked,
                lockedUntil: payload.lockedUntil,
                remainingAttempts: payload.remainingAttempts,
                error: payload.error || 'Invalid username or password',
            };

        } catch (error: unknown) {
            console.error('Login error:', error);
            return { success: false, error: 'An unexpected error occurred. Please try again later' };
        }
    },

    // ─── Step 2: Security Question Verification ─────────────────
    async verifySecurity(clientId: string, answer: string): Promise<SecurityVerifyResult> {
        try {
            if (!answer?.trim()) {
                return { success: false, error: 'Please enter your answer' };
            }
            const response = await fetch(`${EDGE_BASE_URL}/client-login`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({ action: 'verifySecurity', clientId, answer }),
            });

            const payload = await response.json().catch(() => ({ success: false, error: 'Verification service unavailable' }));
            if (!response.ok) {
                return { success: false, error: payload.error || 'Verification failed. Please try again.' };
            }

            if (payload.success && payload.client) {
                const safeClient = { ...(payload.client as AuthClient), session_token: String(payload.sessionToken || '') };
                this.saveSession(safeClient);
                return { success: true, client: safeClient };
            }

            return { success: false, error: payload.error || 'Incorrect security answer' };

        } catch (error: unknown) {
            console.error('Security verify error:', error);
            return { success: false, error: 'Verification failed. Please try again' };
        }
    },

    // ─── Complete Login (shared) ─────────────────────────────────
    async completeLogin(client: RawClientRow): Promise<LoginResult> {
        try {
            // Fire-and-forget — do not block login completion
            this.logAttempt(client.username, true);

            // Sanitize & save session
            const safeClient = sanitizeClient(client);
            this.saveSession(safeClient);

            return { success: true, client: safeClient };
        } catch (error: unknown) {
            console.error('Complete login error:', error);
            return { success: false, error: 'Login failed. Please try again' };
        }
    },

    // ─── Log Login Attempt ───────────────────────────────────────
    async logAttempt(username: string, success: boolean, reason?: string) {
        try {
            const browser = collectBrowserData();
            await fetch(`${EDGE_BASE_URL}/client-login`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({
                    action: 'logAttempt',
                    username,
                    success,
                    reason: reason || null,
                    userAgent: navigator.userAgent,
                    deviceInfo: {
                        browser: browser.browser,
                        os: browser.os,
                        device: browser.deviceType,
                        screen: browser.screenResolution,
                    },
                }),
            });
        } catch (err) {
            // Non-critical — don't break login flow
            console.warn('Failed to log login attempt:', err);
        }
    },

    // ─── Session Management ──────────────────────────────────────

    saveSession(client: AuthClient) {
        const expiry = Date.now() + SESSION_DURATION_MS;
        try {
            this.clearSession();
            localStorage.setItem(SESSION_KEY, JSON.stringify(client));
            localStorage.setItem(AUTH_KEY, 'true');
            localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
            // Clean up any legacy keys from older versions
            this.cleanupLegacyKeys();
            this.emitAuthChanged('login');
        } catch (e) {
            console.warn('Failed to save session to localStorage:', e);
            // Fallback to sessionStorage
            this.clearSession();
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(client));
            sessionStorage.setItem(AUTH_KEY, 'true');
            sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
            this.emitAuthChanged('login');
        }
    },

    getSession(): AuthClient | null {
        try {
            // Try localStorage first, then fallback to sessionStorage
            let isAuth = localStorage.getItem(AUTH_KEY);
            let expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
            let raw = localStorage.getItem(SESSION_KEY);

            // Fallback to sessionStorage for migration
            if (!isAuth) {
                isAuth = sessionStorage.getItem(AUTH_KEY) || sessionStorage.getItem('lumos_authenticated');
                expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY) || sessionStorage.getItem('lumos_session_expiry');
                raw = sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem('lumos_client') || sessionStorage.getItem('client');

                // Migrate to localStorage if found in sessionStorage
                if (isAuth && raw) {
                    localStorage.setItem(SESSION_KEY, raw);
                    localStorage.setItem(AUTH_KEY, isAuth);
                    if (expiry) localStorage.setItem(SESSION_EXPIRY_KEY, expiry);
                    this.cleanupLegacyKeys();
                }
            }

            if (!isAuth || isAuth !== 'true') return null;

            // Check expiry
            if (expiry && Date.now() > parseInt(expiry, 10)) {
                this.clearSession();
                return null;
            }

            if (!raw) return null;

            return JSON.parse(raw) as AuthClient;
        } catch {
            this.clearSession();
            return null;
        }
    },

    isAuthenticated(): boolean {
        return this.getSession() !== null;
    },

    isAdmin(): boolean {
        const client = this.getSession();
        return client?.role === 'admin';
    },

    clearSession() {
        // Clear current keys from both storages
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(SESSION_EXPIRY_KEY);
        localStorage.removeItem(AUTH_EVENT_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(SESSION_EXPIRY_KEY);

        // Remove volatile per-user portal caches so accounts never bleed into each other.
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith('lumos_profile_queue_') || key.startsWith('lumos_design_favorites_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch {
            // ignore storage cleanup errors
        }

        this.clearAuthCookies();
        // Clean up legacy keys
        this.cleanupLegacyKeys();
    },

    clearAuthCookies() {
        if (typeof document === 'undefined') return;
        try {
            const cookieNames = new Set<string>(AUTH_COOKIES);
            const existing = document.cookie
                .split(';')
                .map(c => c.trim().split('=')[0])
                .filter(Boolean);

            for (const name of existing) {
                if (name.startsWith('lumos_')) cookieNames.add(name);
            }

            for (const name of cookieNames) {
                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            }
        } catch {
            // best effort only
        }
    },

    async clearRuntimeCaches() {
        if (typeof window === 'undefined' || !('caches' in window)) return;
        try {
            const cacheKeys = await caches.keys();
            const authRelated = cacheKeys.filter(key => /lumos|auth|client|session/i.test(key));
            await Promise.all(authRelated.map(key => caches.delete(key)));
        } catch {
            // best effort only
        }
    },

    cleanupLegacyKeys() {
        for (const key of LEGACY_KEYS) {
            try {
                sessionStorage.removeItem(key);
                localStorage.removeItem(key);
            } catch { /* ignore */ }
        }
    },

    logout() {
        this.clearSession();
        void this.clearRuntimeCaches();
        this.emitAuthChanged('logout');
    },

    // ─── Refresh client profile from DB ──────────────────────────
    async refreshProfile(): Promise<AuthClient | null> {
        const current = this.getSession();
        if (!current) return null;

        try {
            const response = await fetch(`${EDGE_BASE_URL}/client-login`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({ action: 'refreshProfile', clientId: current.id }),
            });
            const payload = await response.json().catch(() => ({ success: false }));
            if (!response.ok || !payload.success || !payload.client) return current;

            const fresh = {
                ...(payload.client as AuthClient),
                session_token: String(payload.sessionToken || current.session_token || ''),
            };
            this.saveSession(fresh);
            return fresh;
        } catch {
            return current;
        }
    },

    // ─── Magic Link: Request ─────────────────────────────────────
    async requestMagicLink(email: string): Promise<MagicLinkResult> {
        try {
            if (!email?.trim()) {
                return { success: false, error: 'Please enter your email address' };
            }

            const normalizedEmail = email.trim().toLowerCase();
            const edgeResponse = await fetch(`${EDGE_BASE_URL}/send-magic-link`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({
                    action: 'request',
                    email: normalizedEmail,
                    baseUrl: window.location.origin,
                    redirectPath: '/magic-login',
                    userAgent: navigator.userAgent,
                }),
            });

            const payload = await edgeResponse.json().catch(() => ({ success: false, error: 'Failed to send login email' }));
            if (!edgeResponse.ok || !payload.success) {
                return { success: false, error: payload.error || 'Failed to send login email. Please try again.' };
            }

            return { success: true, email: normalizedEmail };
        } catch (error: unknown) {
            console.error('Magic link request error:', error);
            return { success: false, error: 'Something went wrong. Please try again.' };
        }
    },

    // ─── Magic Link: Verify Token ────────────────────────────────
    async verifyMagicLink(token: string): Promise<MagicLinkVerifyResult> {
        try {
            if (!token?.trim()) {
                return { success: false, error: 'Invalid magic link' };
            }

            const edgeResponse = await fetch(`${EDGE_BASE_URL}/send-magic-link`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({ action: 'verify', token: token.trim() }),
            });

            const payload = await edgeResponse.json().catch(() => ({ success: false, error: 'Verification failed' }));
            if (!edgeResponse.ok || !payload.success) {
                return {
                    success: false,
                    expired: payload.expired,
                    error: payload.error || 'Verification failed. Please try again.',
                };
            }

            if (payload.client) {
                const safeClient = { ...(payload.client as AuthClient), session_token: String(payload.sessionToken || '') };
                this.saveSession(safeClient);
                return { success: true, client: safeClient };
            }

            return { success: false, error: 'Account not found.' };
        } catch (error: unknown) {
            console.error('Magic link verify error:', error);
            return { success: false, error: 'Verification failed. Please try again.' };
        }
    },

    // ─── Check Check If Phone is Registered ──────────────────────────
    async checkIfPhoneIsRegistered(phone: string): Promise<boolean> {
        try {
            if (!phone?.trim()) return false;
            const normalizedPhone = phone.trim();
            const response = await fetch(`${EDGE_BASE_URL}/client-login`, {
                method: 'POST',
                headers: EDGE_HEADERS,
                body: JSON.stringify({ action: 'checkPhone', phone: normalizedPhone }),
            });
            const payload = await response.json().catch(() => ({ success: false, exists: false }));
            if (!response.ok || !payload.success) {
                console.error('Error checking if phone is registered:', payload.error);
                return false;
            }
            return Boolean(payload.exists);
        } catch (error) {
            console.error('Check phone registration error:', error);
            return false;
        }
    }
};
