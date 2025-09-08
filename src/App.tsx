import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ModernIndex from "./pages/ModernIndex";
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
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { LoadingScreen } from "./components/LoadingScreen";
import "./utils/errorHandler"; // Initialize production error handling
import { initializeCSRFProtection, clearCSRFToken } from "./utils/csrfProtection";
import { applySecurityHeaders, initializeSecurityMonitoring } from "./utils/securityHeaders";
import { useEffect, useState } from "react";
import { redirectToLogin } from '@/utils/loginRedirect';
import { Loader2 } from 'lucide-react';
import ProviderSelection from './pages/ProviderSelection';
import Scheduling from './pages/Scheduling';
import ServiceCategory from './pages/ServiceCategory';
import ProviderSelectionNew from './pages/ProviderSelectionNew';
import DateSelection from './pages/DateSelection';
import TimeSelection from './pages/TimeSelection';
import Payment from './pages/Payment';

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

// Protected Route Component for Payment Pages Only
const PaymentProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store current page and redirect to login
      redirectToLogin(location.pathname + location.search);
    }
  }, [user, loading, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  <Routes>
                    {/* Public routes - no authentication required */}
                    <Route path="/" element={<ModernIndex />} />
                    <Route path="/services" element={<ModernIndex />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Payment routes - require authentication */}
                    <Route path="/payment" element={
                      <PaymentProtectedRoute>
                        <Payment />
                      </PaymentProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <PaymentProtectedRoute>
                        <Payment />
                      </PaymentProtectedRoute>
                    } />
                    
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
                    <Route path="/auth" element={<EnhancedAuthPage onAuthSuccess={() => window.location.href = '/'} />} />
                    <Route path="/login" element={<EnhancedAuthPage onAuthSuccess={() => window.location.href = '/'} />} />
                    
                    {/* Admin login - dedicated route for admin authentication */}
                    <Route path="/admin-login" element={<AdminLogin />} />
                    
                    {/* Dev access */}
                    <Route path="/dev-admin" element={<DevAdminAccess />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                    
                    {/* Service booking flow routes */}
                    <Route path="/services/:category" element={<ServiceCategory />} />
                    <Route path="/provider-selection" element={<ProviderSelectionNew />} />
                    <Route path="/date-selection" element={<DateSelection />} />
                    <Route path="/time-selection" element={<TimeSelection />} />
                    
                    {/* Legacy routes */}
                    <Route path="/provider-selection/:serviceId" element={<ProviderSelection />} />
                    <Route path="/scheduling/:serviceId/:providerId" element={<Scheduling />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
};

export default App;
