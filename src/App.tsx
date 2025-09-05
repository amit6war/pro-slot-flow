import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
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
import { DashboardRedirect } from "./components/auth/DashboardRedirect";
import { SecureCustomerRoute, SecureProviderRoute, SecureAdminRoute } from "./components/auth/SecureRouteGuard";
import { DevAdminAccess } from "./components/dev/DevAdminAccess";
import { AdminLogin } from "./components/auth/AdminLogin";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import "./utils/errorHandler"; // Initialize production error handling
import { initializeCSRFProtection, clearCSRFToken } from "./utils/csrfProtection";
import { applySecurityHeaders, initializeSecurityMonitoring } from "./utils/securityHeaders";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Security initialization component
const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.log('🔐 Initializing production security features...');
    
    // Initialize CSRF protection
    initializeCSRFProtection();
    
    // Apply security headers
    applySecurityHeaders();
    
    // Initialize security monitoring
    initializeSecurityMonitoring();
    
    // Clear CSRF token on page unload for security
    const handleBeforeUnload = () => {
      clearCSRFToken();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    console.log('✅ Security features initialized successfully');
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <SecurityProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
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
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Role-based dashboard routing */}
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  
                  {/* Specific role-based dashboard routes with enhanced security */}
                  <Route path="/dashboard/customer/*" element={
                    <SecureCustomerRoute>
                      <ProfessionalCustomerDashboard />
                    </SecureCustomerRoute>
                  } />
                  <Route path="/dashboard/provider/*" element={
                    <SecureProviderRoute>
                      <ProviderDashboard />
                    </SecureProviderRoute>
                  } />
                  <Route path="/dashboard/admin/*" element={
                    <SecureAdminRoute>
                      <EnhancedAdminDashboard />
                    </SecureAdminRoute>
                  } />
                  <Route path="/dashboard/super_admin/*" element={
                    <SecureAdminRoute>
                      <EnhancedAdminDashboard />
                    </SecureAdminRoute>
                  } />
                  
                  {/* Legacy routes for backward compatibility with enhanced security */}
                  <Route path="/customer/*" element={
                    <SecureCustomerRoute>
                      <ProfessionalCustomerDashboard />
                    </SecureCustomerRoute>
                  } />
                  <Route path="/provider/*" element={
                    <SecureProviderRoute>
                      <ProviderDashboard />
                    </SecureProviderRoute>
                  } />
                  <Route path="/admin/*" element={
                    <SecureAdminRoute>
                      <EnhancedAdminDashboard />
                    </SecureAdminRoute>
                  } />
                  
                  {/* Auth page */}
                  <Route path="/auth" element={<EnhancedAuthPage onAuthSuccess={() => window.location.href = '/dashboard'} />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  
                  {/* Admin login - dedicated route for admin authentication */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  
                  {/* Dev access */}
                  <Route path="/dev-admin" element={<DevAdminAccess />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SecurityProvider>
  </ErrorBoundary>
);

export default App;
