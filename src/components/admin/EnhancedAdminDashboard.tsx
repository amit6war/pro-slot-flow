import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { AdminPermissionsPanel } from './AdminPermissionsPanel';
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
  Loader2
} from 'lucide-react';

// Import existing admin components
import { CategoryManager } from './CategoryManager';
import { ServiceApprovalManager } from './ServiceApprovalManager';
import { ProviderServiceManager } from './ProviderServiceManager';
import { LocationManagement } from './LocationManagement';

// Section components mapping
const sectionComponents: Record<string, React.ComponentType> = {
  users: () => <UserManagementSection />,
  providers: () => <ProviderManagementSection />,
  services: ServiceApprovalManager,
  bookings: () => <BookingManagementSection />,
  categories: CategoryManager,
  locations: LocationManagement,
  reports: () => <ReportsSection />,
  payments: () => <PaymentManagementSection />,
  notifications: () => <NotificationCenterSection />,
  settings: () => <SystemSettingsSection />,
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
};

export const EnhancedAdminDashboard: React.FC = () => {
  const { profile, isRole } = useAuth();
  const { permissions, loading, getEnabledSections } = useAdminPermissions();

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

      {/* Super Admin Permissions Panel */}
      {isSuperAdmin && (
        <div className="mb-8">
          <AdminPermissionsPanel />
        </div>
      )}

      {/* Admin Dashboard Sections */}
      {availableSections.length > 0 ? (
        <Tabs defaultValue={availableSections[0]?.section} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            {availableSections.map((section) => (
              <TabsTrigger
                key={section.section}
                value={section.section}
                className="flex items-center space-x-2"
              >
                {sectionIcons[section.section]}
                <span className="hidden sm:inline">{section.display_name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {availableSections.map((section) => {
            const SectionComponent = sectionComponents[section.section];
            
            return (
              <TabsContent key={section.section} value={section.section}>
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
                      <ComingSoonSection sectionName={section.display_name} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
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
  );
};

// Placeholder components for sections not yet implemented
const ComingSoonSection: React.FC<{ sectionName: string }> = ({ sectionName }) => (
  <div className="text-center py-12">
    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
    <h3 className="text-lg font-semibold mb-2">{sectionName}</h3>
    <p className="text-muted-foreground">This section is coming soon!</p>
  </div>
);

const UserManagementSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">User Management</h3>
    <p className="text-muted-foreground">Manage customer accounts and profiles.</p>
    <ComingSoonSection sectionName="User Management" />
  </div>
);

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
    <ComingSoonSection sectionName="Booking Management" />
  </div>
);

const ReportsSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Reports & Analytics</h3>
    <p className="text-muted-foreground">View system reports and analytics.</p>
    <ComingSoonSection sectionName="Reports & Analytics" />
  </div>
);

const PaymentManagementSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Payment Management</h3>
    <p className="text-muted-foreground">Manage payments and transactions.</p>
    <ComingSoonSection sectionName="Payment Management" />
  </div>
);

const NotificationCenterSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Notification Center</h3>
    <p className="text-muted-foreground">Send and manage system notifications.</p>
    <ComingSoonSection sectionName="Notification Center" />
  </div>
);

const SystemSettingsSection: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">System Settings</h3>
    <p className="text-muted-foreground">Configure system-wide settings.</p>
    <ComingSoonSection sectionName="System Settings" />
  </div>
);