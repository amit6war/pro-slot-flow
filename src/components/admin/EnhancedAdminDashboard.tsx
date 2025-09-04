import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { AdminPermissionsPanel } from './AdminPermissionsPanel';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  MapPin, 
  CreditCard, 
  Bell,
  UserCheck,
  Calendar,
  Crown,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Import existing admin components
import { CategoryManager } from './CategoryManager';
import { ServiceApprovalManager } from './ServiceApprovalManager';
import { ProviderServiceManager } from './ProviderServiceManager';
import { LocationManagement } from './LocationManagement';
import { UserManager } from './UserManager';

// Section components mapping
const sectionComponents: Record<string, React.ComponentType> = {
  users: UserManager,
  providers: () => <ProviderManagementSection />,
  services: ServiceApprovalManager,
  bookings: () => <BookingManagementSection />,
  categories: CategoryManager,
  locations: LocationManagement,
  reports: () => <ReportsSection />,
  payments: () => <PaymentManagementSection />,
  notifications: () => <NotificationCenterSection />,
  settings: () => <SystemSettingsSection />,
  permissions: () => <AdminPermissionsSection />,
};

// Section icons
const sectionIcons: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  providers: <UserCheck className="h-4 w-4" />,
  services: <Package className="h-4 w-4" />,
  bookings: <Calendar className="h-4 w-4" />,
  categories: <Package className="h-4 w-4" />,
  locations: <MapPin className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  permissions: <Shield className="h-4 w-4" />,
};

export const EnhancedAdminDashboard: React.FC = () => {
  const { profile, isRole } = useAuth();
  const { permissions, loading, getEnabledSections } = useAdminPermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get section from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const sectionFromUrl = queryParams.get('section');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  const enabledSections = getEnabledSections();
  const isSuperAdmin = isRole('super_admin');
  const isAdmin = isRole('admin');

  // Get available sections based on role
  const availableSections = isSuperAdmin 
    ? permissions // Super admin sees all sections
    : permissions.filter(p => p.is_enabled); // Admin only sees enabled sections

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        size="icon"
        variant="default"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main layout with sidebar and content */}
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on mobile, static on desktop */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 
          bg-white shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 lg:pl-0">
          <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            {isSuperAdmin ? (
              <Crown className="h-8 w-8 mr-3 text-yellow-500" />
            ) : (
              <Shield className="h-8 w-8 mr-3 text-blue-500" />
            )}
            {isSuperAdmin ? 'Super Admin' : 'Admin'} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile?.full_name || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSuperAdmin ? "default" : "secondary"}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </Badge>
          <Badge variant="outline">
            {enabledSections.length} Sections Available
          </Badge>
        </div>
      </div>

      {/* Super Admin message - Permissions moved to dedicated section */}
      {isSuperAdmin && sectionFromUrl !== 'permissions' && (
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-blue-600">
                <Shield className="h-5 w-5" />
                <p>Admin permissions can now be managed in the <Link to="/dashboard/admin?section=permissions" className="font-medium underline">Admin Permissions</Link> section.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Dashboard Content */}
      {availableSections.length > 0 ? (
        <div className="space-y-6">
          {/* Display the current section based on URL parameter */}
          {(() => {
            const currentSection = sectionFromUrl || availableSections[0]?.section;
            const section = availableSections.find(s => s.section === currentSection);
            
            if (!section) return null;
            
            const SectionComponent = sectionComponents[section.section];
            
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {sectionIcons[section.section]}
                    <span className="ml-2">{section.display_name}</span>
                    {!section.is_enabled && isAdmin && (
                      <Badge variant="secondary" className="ml-2">
                        Disabled
                      </Badge>
                    )}
                  </CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {SectionComponent ? (
                    <SectionComponent />
                  ) : (
                    <ComingSoonSection title={section.display_name} />
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Sections Available</h3>
              <p className="text-muted-foreground">
                {isAdmin 
                  ? "No admin sections have been enabled for your account. Contact your Super Admin."
                  : "No admin sections are configured."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for sections not yet implemented
const ComingSoonSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-12">
    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">This section is coming soon!</p>
  </div>
);

// Add AdminPermissionsSection component
const AdminPermissionsSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Admin Permissions Management</h3>
    <p className="text-muted-foreground">Control which dashboard sections are accessible to Admin users.</p>
    <AdminPermissionsPanel />
  </div>
);

// UserManagementSection is now replaced by the imported UserManager component

const ProviderManagementSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Provider Management</h3>
    <p className="text-muted-foreground">Manage service providers and their approvals.</p>
    <ProviderServiceManager />
  </div>
);

const BookingManagementSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Booking Management</h3>
    <p className="text-muted-foreground">View and manage all system bookings.</p>
    <ComingSoonSection title="Booking Management" />
  </div>
);

const ReportsSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Reports & Analytics</h3>
    <p className="text-muted-foreground">View system reports and analytics.</p>
    <ComingSoonSection title="Reports & Analytics" />
  </div>
);

const PaymentManagementSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Payment Management</h3>
    <p className="text-muted-foreground">Manage payments and transactions.</p>
    <ComingSoonSection title="Payment Management" />
  </div>
);

const NotificationCenterSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Notification Center</h3>
    <p className="text-muted-foreground">Send and manage system notifications.</p>
    <ComingSoonSection title="Notification Center" />
  </div>
);

const SystemSettingsSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">System Settings</h3>
    <p className="text-muted-foreground">Configure system-wide settings.</p>
    <ComingSoonSection title="System Settings" />
  </div>
);