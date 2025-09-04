
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { CategoryManager } from './CategoryManager';

import { LocationManagement } from './LocationManagement';
import { ProviderManager } from './ProviderManager';
import { ProviderServiceManager } from './ProviderServiceManager';
import { BookingManager } from './BookingManager';
import { UserManager } from './UserManager';
import { SettingsManager } from './SettingsManager';
import { DevModeIndicator } from '../dev/DevModeIndicator';
import { DatabaseStatus } from '../dev/DatabaseStatus';
import { useAuthAdmin } from '@/hooks/useAuthAdmin';

export const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuthAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DevModeIndicator />
      <DatabaseStatus />
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/categories" element={<CategoryManager />} />

            <Route path="/provider-services" element={<ProviderServiceManager />} />
            <Route path="/locations" element={<LocationManagement />} />
            <Route path="/providers" element={<ProviderManager />} />
            <Route path="/bookings" element={<BookingManager />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/settings" element={<SettingsManager />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
