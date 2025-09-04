
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Shield } from 'lucide-react';
import { useAuthAdmin } from '@/hooks/useAuthAdmin';
import { Button } from '@/components/ui/button';
import { EnhancedAdminDashboard } from './EnhancedAdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SecureStorage } from '@/utils/secureStorage';

export const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuthAdmin();
  const { isRole, profile, secureSignOut, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isSuperAdmin = isRole('super_admin');

  const handleSecureSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Set logging out flag to immediately stop all session monitoring
      localStorage.setItem('isLoggingOut', 'true');
      
      // Close mobile menu if open
      setMobileMenuOpen(false);
      
      // Clear secure storage immediately to stop all monitoring
      SecureStorage.clearSession();
      
      // Clear all browser storage (but preserve logout flag temporarily)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key !== 'isLoggingOut') {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Try secure sign out first, fallback to regular sign out if it fails
      try {
        await secureSignOut();
      } catch (secureError) {
        console.warn('Secure sign out failed, using regular sign out:', secureError);
        try {
          await signOut();
        } catch (regularError) {
          console.warn('Regular sign out also failed:', regularError);
          // Continue with force logout
        }
      }
      
      // Show success message
      toast({
        title: "Signed Out Successfully",
        description: "You have been securely signed out.",
      });
      
      // Clear logout flag and redirect
      localStorage.removeItem('isLoggingOut');
      
      // Add small delay to ensure all cleanup is complete
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Force clear everything and redirect even if sign out fails
      SecureStorage.clearSession();
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
      
      window.location.href = '/auth';
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-6 p-8">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Loading Admin Dashboard</h2>
            <p className="text-gray-600 max-w-md">Setting up your administrative controls...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin area.</p>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            variant="default"
            size="lg"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Use EnhancedAdminDashboard for both super admin and regular admin
  return (
    <div className="min-h-screen">
      <EnhancedAdminDashboard />
    </div>
  );
};
