import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { EnhancedAdminDashboard } from "./components/admin/EnhancedAdminDashboard";
import StableCustomerDashboard from "./components/StableCustomerDashboard";
import DatabaseCustomerDashboard from "./components/customer/DatabaseCustomerDashboard";
import ProfessionalCustomerDashboard from "./components/customer/ProfessionalCustomerDashboard";
import { ProviderDashboard } from "./components/provider/ProviderDashboard";
import { EnhancedAuthPage } from "./components/auth/EnhancedAuthPage";
import { DevAdminAccess } from "./components/dev/DevAdminAccess";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./hooks/useAuth";
import "./utils/errorHandler"; // Initialize production error handling

const queryClient = new QueryClient();

// Removed AppContent component - direct routing for production stability

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Direct dashboard access - PROFESSIONAL UI */}
              <Route path="/dashboard" element={<ProfessionalCustomerDashboard />} />
              <Route path="/dashboard/*" element={<ProfessionalCustomerDashboard />} />
              <Route path="/dashboard/customer/*" element={<ProfessionalCustomerDashboard />} />
              <Route path="/customer/*" element={<ProfessionalCustomerDashboard />} />
              
              {/* Provider and Admin with minimal auth */}
              <Route path="/dashboard/provider/*" element={<ProviderDashboard />} />
              <Route path="/provider/*" element={<ProviderDashboard />} />
              <Route path="/dashboard/admin/*" element={<EnhancedAdminDashboard />} />
              <Route path="/admin/*" element={<EnhancedAdminDashboard />} />
              
              {/* Auth page */}
              <Route path="/auth" element={<EnhancedAuthPage onAuthSuccess={() => window.location.href = '/dashboard'} />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              
              {/* Dev access */}
              <Route path="/dev-admin" element={<DevAdminAccess />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
