import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary, LoadingFallback } from "@/components/shared";
import FloatingBrandButton from "@/components/shared/FloatingBrandButton";
import LeadCapturePopup from "@/features/lead-capture";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import GlobalLanguageToggle from "@/components/shared/GlobalLanguageToggle";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const MobileDemoPage = lazy(() => import("./pages/MobileDemoPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientSignUp = lazy(() => import("./pages/ClientSignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const MagicLinkVerify = lazy(() => import("./pages/MagicLinkVerify"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create QueryClient outside component to avoid recreating on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    const clearQueryRuntime = () => {
      queryClient.cancelQueries();
      queryClient.clear();
    };

    const onAuthChanged = () => clearQueryRuntime();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "lumos_auth_event_v1") clearQueryRuntime();
    };

    window.addEventListener("lumos:auth:changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("lumos:auth:changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AuthProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/demo" element={<MobileDemoPage />} />
                    <Route path="/client-login" element={<ClientLogin />} />
                    <Route path="/admin/login" element={<ClientLogin />} />
                    <Route path="/client-signup" element={<ClientSignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/magic-login/:token" element={<MagicLinkVerify />} />
                    <Route path="/services/:slug" element={<ServicePage />} />

                    {/* Admin Dashboard - Protected (Admin Only) */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute requireAdmin>
                        <Dashboard />
                      </ProtectedRoute>
                    } />

                    {/* Client Portal - Protected */}
                    <Route path="/clients/profile" element={
                      <ProtectedRoute>
                        <ClientProfile />
                      </ProtectedRoute>
                    } />

                    {/* Admin Profile */}
                    <Route path="/admin/profile" element={
                      <ProtectedRoute requireAdmin>
                        <AdminProfile />
                      </ProtectedRoute>
                    } />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <FloatingBrandButton />
                <GlobalLanguageToggle />
                <LeadCapturePopup />
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
          <Toaster />
          <Sonner />
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
