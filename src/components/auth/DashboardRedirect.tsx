import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users back to their original page after authentication
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
        
        // Get the stored redirect URL from localStorage
        const storedRedirectUrl = localStorage.getItem('redirectAfterLogin');
        
        let redirectPath = '/';
        
        if (storedRedirectUrl) {
          redirectPath = storedRedirectUrl;
          // Clear the stored URL after using it
          localStorage.removeItem('redirectAfterLogin');
          console.log('✅ Found stored redirect URL:', redirectPath);
        } else {
          console.log('ℹ️ No stored redirect URL, redirecting to home page');
        }
        
        console.log('🎯 Redirecting to:', redirectPath);
        
        // Use window.location.href for immediate redirect
        window.location.href = redirectPath;
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
        console.log('🚨 EMERGENCY REDIRECT: Forcing home page');
        window.location.href = '/';
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
    if (isRedirecting) return "Redirecting you back...";
    return "Loading...";
  };

  // Manual redirect functions
  const goToHomePage = () => {
    console.log('🔧 Manual redirect to home page');
    navigate('/', { replace: true });
  };

  const goToServices = () => {
    console.log('🔧 Manual redirect to services');
    navigate('/services', { replace: true });
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
            <p className="text-sm text-gray-600">Taking too long? Choose where to go:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={goToHomePage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Home Page
              </button>
              <button
                onClick={goToServices}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Services
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You'll be redirected to where you were before login
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