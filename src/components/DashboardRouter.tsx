
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const DashboardRouter = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect based on user role
  switch (profile?.role) {
    case 'customer':
      return <Navigate to="/customer" replace />;
    case 'provider':
      return <Navigate to="/provider" replace />;
    case 'admin':
    case 'super_admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/auth" replace />;
  }
};
