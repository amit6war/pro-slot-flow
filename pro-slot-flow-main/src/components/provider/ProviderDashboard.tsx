import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProviderSidebar } from './ProviderSidebar';
import { ProviderOverview } from './ProviderOverview';
import { ProviderServices } from './ProviderServices';
import { ProviderBookings } from './ProviderBookings';
import { ProviderProfile } from './ProviderProfile';
import { ProviderEarnings } from './ProviderEarnings';
import { ProviderSchedule } from './ProviderSchedule';
import { DevModeIndicator } from '../dev/DevModeIndicator';
import { DatabaseStatus } from '../dev/DatabaseStatus';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const ProviderDashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has provider access
  const hasProviderAccess = profile && (profile.auth_role === 'provider' || profile.role === 'provider');
  
  if (!hasProviderAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have provider access to this area.</p>
        </div>
      </div>
    );
  }

  // Check if provider profile is pending approval
  const isPending = profile?.registration_status === 'pending';
  const isApproved = profile?.registration_status === 'approved';

  // If provider is pending, show limited dashboard with only profile section
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DevModeIndicator />
        <DatabaseStatus />
        
        {/* Pending Approval Header */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-800">Profile Under Review</h2>
              <p className="text-sm text-yellow-700">
                Your provider profile is being reviewed by our admin team. You can update your profile information below.
              </p>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Limited Sidebar for Pending Providers */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col pt-20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-bold text-gray-800">Provider Portal</span>
              </div>
              <div className="mt-2 text-sm text-yellow-600 font-medium">Pending Approval</div>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Profile Setup</span>
                </div>
                
                {/* Disabled menu items */}
                <div className="space-y-1 mt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                    Available After Approval
                  </div>
                  {['Dashboard', 'Services', 'Bookings', 'Schedule', 'Earnings'].map((item) => (
                    <div key={item} className="flex items-center space-x-3 px-3 py-2 text-gray-400 cursor-not-allowed">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content - Only Profile */}
          <div className="flex-1 ml-64 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="text-gray-600">
                      Please provide all required information. Our admin team will review your profile and approve it within 24-48 hours.
                    </p>
                  </div>
                </div>
                
                <ProviderProfile isPendingApproval={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full dashboard for approved providers
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DevModeIndicator />
      <DatabaseStatus />
      
      {/* Approved Status Header */}
      {isApproved && (
        <div className="fixed top-0 left-0 right-0 bg-green-50 border-b border-green-200 px-6 py-2 z-50">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Profile Approved - Full Access Enabled</span>
          </div>
        </div>
      )}
      
      <ProviderSidebar />
      <div className={`flex-1 ml-64 ${isApproved ? 'pt-12' : ''}`}>
        <div className="p-8">
          <Routes>
            <Route path="/" element={<ProviderOverview />} />
            <Route path="/services" element={<ProviderServices />} />
            <Route path="/bookings" element={<ProviderBookings />} />
            <Route path="/schedule" element={<ProviderSchedule />} />
            <Route path="/earnings" element={<ProviderEarnings />} />
            <Route path="/profile" element={<ProviderProfile isPendingApproval={false} />} />
            <Route path="*" element={<Navigate to="/provider" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};