import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Briefcase,
  Calendar,
  DollarSign,
  User,
  Clock,
  Shield,
  Loader2,
  Menu,
  X,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProviderSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { secureSignOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close notification dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotificationDetails) {
        const target = event.target as Element;
        if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
          setShowNotificationDetails(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationDetails]);

  const handleSecureSignOut = async () => {
    console.log('🔐 ProviderSidebar handleSecureSignOut function called');
    setIsSigningOut(true);
    try {
      console.log('🔐 Calling secureSignOut from useAuth...');
      await secureSignOut();
      console.log('🔐 secureSignOut completed successfully');
      toast({
        title: "Signed Out Successfully",
        description: "You have been securely signed out.",
      });
      console.log('🔐 Navigating to /auth...');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('🔐 Sign out error in ProviderSidebar:', error);
      toast({
        title: "Sign Out Error",
        description: "There was an issue signing out.",
        variant: "destructive",
      });
    } finally {
      console.log('🔐 Cleaning up sign out states...');
      setIsSigningOut(false);
    }
  };

  const menuItems = [
    { path: '/provider', icon: LayoutDashboard, label: 'Overview' },
    { path: '/provider/services', icon: Briefcase, label: 'My Services' },
    { path: '/provider/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/provider/schedule', icon: Clock, label: 'Schedule' },
    { path: '/provider/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/provider/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/provider') {
      return location.pathname === '/provider' || location.pathname === '/provider/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavLinks = () => (
    <nav className="mt-4 lg:mt-6 px-3 lg:px-4">
      <ul className="space-y-1 lg:space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const renderSignOutButton = (isMobile = false) => (
    <div className={`flex-shrink-0 p-4 border-t border-gray-200 bg-white ${isMobile ? '' : ''}`}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🔘 ${isMobile ? 'Mobile' : 'Desktop'} ProviderSidebar Sign Out button clicked`);
          console.log('🔘 Calling handleSecureSignOut directly');
          if (isMobile) {
            setMobileMenuOpen(false);
          }
          handleSecureSignOut();
        }}
        disabled={isSigningOut}
        className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full justify-start disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
      >
        {isSigningOut ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
        <span className="font-semibold">
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </span>
        <Shield className="h-4 w-4 ml-auto text-green-600" />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- Desktop Sidebar --- */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 flex-col hidden md:flex overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Provider Panel</h1>
                  <p className="text-sm text-gray-500">Service Management</p>
                </div>
              </div>
              
              {/* Notification Button */}
              <div className="relative">
                <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowNotificationDetails(!showNotificationDetails)}
                   className="p-2 h-8 w-8 notification-button"
                 >
                  <Bell className="h-4 w-4" />
                </Button>
                
                {/* Notification Details Dropdown */}
                 {showNotificationDetails && (
                   <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 notification-dropdown">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Notification System</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotificationDetails(false)}
                        className="p-1 h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">System Active</p>
                          <p className="text-sm text-green-600">Automatic availability reminders are running in the background</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>• You'll receive reminders every 15 days to update your availability</p>
                        <p>• Notifications help maintain your service schedule</p>
                        <p>• Configure settings in Schedule → Settings tab</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {renderNavLinks()}
          </div>

          {/* Sign Out Button */}
          {renderSignOutButton()}
        </div>
      </div>

      {/* --- Mobile Sidebar --- */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Provider Panel</h1>
                  <p className="text-xs text-gray-500">Service Management</p>
                </div>
              </div>
              
              {/* Mobile Notification Button */}
              <div className="relative">
                <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowNotificationDetails(!showNotificationDetails)}
                   className="p-1.5 h-7 w-7 notification-button"
                 >
                  <Bell className="h-3 w-3" />
                </Button>
                
                {/* Mobile Notification Details Dropdown */}
                 {showNotificationDetails && (
                   <div className="absolute right-0 top-8 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 notification-dropdown">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">Notification System</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotificationDetails(false)}
                        className="p-1 h-5 w-5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 text-sm">System Active</p>
                          <p className="text-xs text-green-600">Automatic availability reminders are running</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>• Reminders every 15 days</p>
                        <p>• Configure in Schedule → Settings</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {renderNavLinks()}
          </div>

          {/* Sign Out Button */}
          {renderSignOutButton(true)}
        </div>
      </div>

      {/* Remove the dialog completely */}
    </>
  );
};
