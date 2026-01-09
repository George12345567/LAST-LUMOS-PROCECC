import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary, LoadingFallback } from "@/components/shared";
import LeadCapturePopup from "@/features/lead-capture";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const MobileDemoPage = lazy(() => import("./pages/MobileDemoPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const CreativeStudioPage = lazy(() => import("./pages/CreativeStudioPage"));
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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/demo" element={<MobileDemoPage />} />
                <Route path="/client-login" element={<ClientLogin />} />

                {/* Dashboard - Public (No Authentication) */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Client Portal */}
                <Route path="/clients/dashboard" element={<ClientDashboard />} />

                {/* Creative Studio - Design Tools */}
                <Route path="/creative-studio" element={<CreativeStudioPage />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <Sonner />
          <Analytics />
          <SpeedInsights />
          <LeadCapturePopup />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
