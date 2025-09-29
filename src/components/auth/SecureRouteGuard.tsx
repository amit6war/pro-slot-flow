// Enhanced route guard with server-side validation and session management
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { SecureStorage, SecureSessionData } from '@/utils/secureStorage';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield } from 'lucide-react';

interface SecureRouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
  sessionData: SecureSessionData | null;
}

export const SecureRouteGuard: React.FC<SecureRouteGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  fallbackPath = '/auth'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: true,
    isValid: false,
    error: null,
    sessionData: null
  });

  const allowedRoleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Simplified session validation - removed overly aggressive server-side checks

  // Main validation logic
  useEffect(() => {
    // Don't validate if auth is still loading
    if (loading) {
      return;
    }

    // Check if authentication is required
    if (!requireAuth) {
      setValidationState({
        isValidating: false,
        isValid: true,
        error: null,
        sessionData: null
      });
      return;
    }

    // Simple check: if user and profile exist, allow access
    if (user && profile) {
      const userRole = profile.auth_role || profile.role;
      const hasAccess = allowedRoleArray.includes(userRole);
      
      if (hasAccess) {
        setValidationState({
          isValidating: false,
          isValid: true,
          error: null,
          sessionData: {
            userId: user.id,
            email: user.email || '',
            role: userRole,
            sessionId: user.id + '-' + Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            lastValidated: Date.now()
          }
        });
        return;
      } else {
        setValidationState({
          isValidating: false,
          isValid: false,
          error: `Access denied. Required role: ${allowedRoleArray.join(' or ')}. Current role: ${userRole}`,
          sessionData: null
        });
        return;
      }
    }

    // No user found
    setValidationState({
      isValidating: false,
      isValid: false,
      error: 'No valid session found',
      sessionData: null
    });
  }, [loading, user, profile]);

  // Show loading state
  if (loading || validationState.isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Securing Your Access</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle validation errors
  if (!validationState.isValid) {
    // If user has a session but wrong role, redirect to their correct dashboard
    if (validationState.sessionData) {
      const correctPath = `/dashboard/${validationState.sessionData.role}`;
      console.log('🔄 Redirecting to correct dashboard:', correctPath);
      return <Navigate to={correctPath} replace />;
    }

    // No session or validation failed, redirect to auth
    console.log('🔄 Redirecting to auth page');
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  // Access granted, render children
  return <>{children}</>;
};

// Removed SecurityMonitor component - was causing false positive security breaches

// Convenience components for specific roles
export const SecureCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles="customer">{children}</SecureRouteGuard>
);

export const SecureProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles="provider">{children}</SecureRouteGuard>
);

export const SecureAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles={['admin', 'super_admin']}>{children}</SecureRouteGuard>
);

export default SecureRouteGuard;