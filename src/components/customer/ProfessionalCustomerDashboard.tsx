import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerOverview } from './CustomerOverview';
import { CustomerBookings } from './CustomerBookings';
import { CustomerFavorites } from './CustomerFavorites';
import { CustomerProfile } from './CustomerProfile';
import { AddressManagement } from './AddressManagement';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfessionalCustomerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get active section from URL params
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get('section') || 'overview';

  const handleSectionChange = (section: string) => {
    navigate(`/customer?section=${section}`);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'bookings':
        return <CustomerBookings />;
      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-elegant border border-border p-8">
              <AddressManagement />
            </div>
          </div>
        );
      case 'favorites':
        return <CustomerFavorites />;
      case 'profile':
        return <CustomerProfile />;
      default:
        return <CustomerOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <CustomerSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCustomerDashboard;