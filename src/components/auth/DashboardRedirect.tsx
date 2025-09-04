import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users to their appropriate dashboard based on role
 */
export const DashboardRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasTriedRedirect, setHasTriedRedirect] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('🔍 DashboardRedirect - State:', { 
        loading, 
        user: !!user, 
        userEmail: user?.email,
        profile: !!profile, 
        profileRole: profile?.auth_role || profile?.role,
        redirectAttempts,
        isRedirecting,
        hasTriedRedirect
      });
      
      // If still loading, wait
      if (loading) {
        console.log('⏳ Still loading auth state...');
        return;
      }

      // If no user, redirect to auth
      if (!user) {
        console.log('❌ No user found, redirecting to auth');
        navigate('/auth', { replace: true });
        return;
      }

      // If we have a user and haven't tried redirecting yet
      if (user && !hasTriedRedirect) {
        console.log('🚀 User found, attempting redirect...');
        setHasTriedRedirect(true);
        setIsRedirecting(true);
        
        // Determine role - prefer profile role, fallback to customer
        let targetRole = 'customer'; // Default fallback
        
        if (profile) {
          targetRole = profile.auth_role || profile.role || 'customer';
          console.log('✅ Profile found, role:', targetRole);
        } else {
          console.log('⚠️ No profile found, using default role: customer');
        }
        
        // Force redirect using window.location for more reliable navigation
        // Handle super_admin role by redirecting to admin dashboard
        let dashboardPath;
        if (targetRole === 'super_admin') {
          dashboardPath = '/dashboard/admin';
          console.log('🎯 Super admin detected, redirecting to admin dashboard');
        } else {
          dashboardPath = `/dashboard/${targetRole}`;
        }
        console.log('🎯 Force redirecting to:', dashboardPath);
        
        // Use window.location.href for immediate redirect
        window.location.href = dashboardPath;
      }
    };

    handleRedirect();
    
    // Increment redirect attempts every 2 seconds to show manual buttons
    const attemptInterval = setInterval(() => {
      if (!hasTriedRedirect) {
        setRedirectAttempts(prev => prev + 1);
      }
    }, 2000);
    
    // Emergency timeout - force redirect after 3 seconds regardless
    const emergencyTimeout = setTimeout(() => {
      if (user && !hasTriedRedirect) {
        console.log('🚨 EMERGENCY REDIRECT: Forcing customer dashboard');
        window.location.href = '/dashboard/customer';
      }
    }, 3000);

    return () => {
      clearInterval(attemptInterval);
      clearTimeout(emergencyTimeout);
    };
  }, [user, profile, loading, navigate, hasTriedRedirect]);

  const getLoadingMessage = () => {
    if (loading) return "Loading your account...";
    if (!profile && redirectAttempts > 0) return "Setting up your profile...";
    if (isRedirecting) return "Redirecting to your dashboard...";
    return "Loading dashboard...";
  };

  // Manual redirect functions
  const goToCustomerDashboard = () => {
    console.log('🔧 Manual redirect to customer dashboard');
    navigate('/dashboard/customer', { replace: true });
  };

  const goToProviderDashboard = () => {
    console.log('🔧 Manual redirect to provider dashboard');
    navigate('/dashboard/provider', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Pro Slot Flow</h2>
          <p className="text-gray-600">{getLoadingMessage()}</p>
          {redirectAttempts > 1 && (
            <p className="text-sm text-gray-500">This is taking longer than usual...</p>
          )}
        </div>
        
        {/* Manual redirect buttons after 3 seconds */}
        {redirectAttempts > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">Taking too long? Choose your dashboard:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={goToCustomerDashboard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Customer Dashboard
              </button>
              <button
                onClick={goToProviderDashboard}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Provider Dashboard
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Don't worry, you can switch between dashboards later
            </p>
          </div>
        )}
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Loading: {loading.toString()}</p>
            <p>User: {user ? user.email : 'None'}</p>
            <p>Profile: {profile ? `${profile.auth_role || profile.role}` : 'None'}</p>
            <p>Attempts: {redirectAttempts}</p>
            <p>Redirecting: {isRedirecting.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};