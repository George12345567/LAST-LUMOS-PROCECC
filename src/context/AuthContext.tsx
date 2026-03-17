/* eslint-disable react-refresh/only-export-components */

/**
 * ═══════════════════════════════════════════════════════════════════
 * Auth Context - Global Authentication State
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Provides:
 * - client: Current authenticated client (or null)
 * - isAuthenticated: Whether a client is logged in
 * - isAdmin: Whether current user is GEORGE (admin)
 * - loading: Auth state initialization in progress
 * - login / verifySecurity / logout methods
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, type AuthClient, type LoginResult, type SecurityVerifyResult, type MagicLinkResult, type MagicLinkVerifyResult } from '@/services/authService';
import { toast } from 'sonner';

// ─── Context Shape ───────────────────────────────────────────────

interface AuthContextType {
    client: AuthClient | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    verifySecurity: (clientId: string, answer: string) => Promise<SecurityVerifyResult>;
    requestMagicLink: (email: string) => Promise<MagicLinkResult>;
    verifyMagicLink: (token: string) => Promise<MagicLinkVerifyResult>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [client, setClient] = useState<AuthClient | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize from stored session
    useEffect(() => {
        const stored = authService.getSession();
        if (stored) {
            setClient(stored);
        }
        setLoading(false);
    }, []);

    // Periodic session validity check (every 60s)
    // Catches expired sessions without requiring page reload
    useEffect(() => {
        if (!client) return;

        const interval = setInterval(() => {
            const session = authService.getSession();
            if (!session) {
                setClient(null);
                toast.info('Your session has expired. Please log in again.', { duration: 5000 });
            }
        }, 60000); // Check every 60 seconds

        return () => clearInterval(interval);
    }, [client]);

    // Re-check session when tab becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && client) {
                const session = authService.getSession();
                if (!session) {
                    setClient(null);
                    toast.info('Your session has expired. Please log in again.', { duration: 5000 });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [client]);

    // Keep auth state synchronized across tabs and runtime events.
    useEffect(() => {
        const syncFromStorage = () => {
            const session = authService.getSession();
            setClient(session);
        };

        const onStorage = (event: StorageEvent) => {
            if (
                event.key === 'lumos_auth_event_v1' ||
                event.key === 'lumos_client_v2' ||
                event.key === 'lumos_authenticated_v2' ||
                event.key === 'lumos_session_expiry_v2'
            ) {
                syncFromStorage();
            }
        };

        const onAuthChanged = () => {
            syncFromStorage();
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('lumos:auth:changed', onAuthChanged as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('lumos:auth:changed', onAuthChanged as EventListener);
        };
    }, []);

    // Login
    const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
        const result = await authService.login(username, password);

        if (result.success && result.client) {
            setClient(result.client);
        }

        return result;
    }, []);

    // Security verification (step 2)
    const verifySecurity = useCallback(async (clientId: string, answer: string): Promise<SecurityVerifyResult> => {
        const result = await authService.verifySecurity(clientId, answer);

        if (result.success && result.client) {
            setClient(result.client);
        }

        return result;
    }, []);

    // Magic link: request
    const requestMagicLink = useCallback(async (email: string): Promise<MagicLinkResult> => {
        return authService.requestMagicLink(email);
    }, []);

    // Magic link: verify
    const verifyMagicLink = useCallback(async (token: string): Promise<MagicLinkVerifyResult> => {
        const result = await authService.verifyMagicLink(token);
        if (result.success && result.client) {
            setClient(result.client);
        }
        return result;
    }, []);

    // Logout — wrapped in try-catch so callers never crash
    const logout = useCallback(() => {
        try {
            authService.logout();
        } catch (e) {
            console.error('Logout cleanup error:', e);
        } finally {
            setClient(null);
        }
    }, []);

    // Refresh profile from DB
    const refreshProfile = useCallback(async () => {
        const fresh = await authService.refreshProfile();
        if (fresh) {
            setClient(fresh);
        }
    }, []);

    // Derived values
    const isAuthenticated = client !== null;
    const isAdmin = client?.role === 'admin';

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<AuthContextType>(() => ({
        client,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        verifySecurity,
        requestMagicLink,
        verifyMagicLink,
        logout,
        refreshProfile,
    }), [client, isAuthenticated, isAdmin, loading, login, verifySecurity, requestMagicLink, verifyMagicLink, logout, refreshProfile]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        console.error('useAuth was called outside AuthProvider. Returning safe fallback context.');
        return {
            client: null,
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            login: async () => ({ success: false, error: 'Auth provider is unavailable' }),
            verifySecurity: async () => ({ success: false, error: 'Auth provider is unavailable' }),
            requestMagicLink: async () => ({ success: false, error: 'Auth provider is unavailable' }),
            verifyMagicLink: async () => ({ success: false, error: 'Auth provider is unavailable' }),
            logout: () => undefined,
            refreshProfile: async () => undefined,
        };
    }
    return context;
}

export default AuthContext;
