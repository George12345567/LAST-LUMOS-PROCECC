/**
 * ═══════════════════════════════════════════════════════════════════
 * Protected Route - Route Guard Component
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Wraps routes that require authentication.
 * 
 * Props:
 *  - requireAdmin: Only allow GEORGE (admin)
 *  - children: Protected page component
 * 
 * Behavior:
 *  - While loading: show spinner
 *  - Not authenticated: redirect to /client-login
 *  - requireAdmin but not admin: redirect to /clients/profile
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060a14]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#64ffda]/30 border-t-[#64ffda] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/client-login" state={{ from: location }} replace />;
    }

    // Admin-only route, but user is not admin → redirect to client dashboard
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/clients/profile" replace />;
    }

    return <>{children}</>;
}

