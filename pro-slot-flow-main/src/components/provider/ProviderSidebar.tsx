import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Briefcase,
  Calendar,
  DollarSign,
  User,
  Clock,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ProviderSidebar = () => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

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

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col lg:relative lg:shadow-none">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Provider Panel</h1>
            <p className="text-xs lg:text-sm text-gray-500 truncate">Service Management</p>
          </div>
        </div>
      </div>

      {/* Provider Info */}
      <div className="p-3 lg:p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || profile?.business_name || 'Provider'}
            </p>
            <p className="text-xs text-blue-600 capitalize truncate">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-4 lg:mt-6 px-3 lg:px-4">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
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

        {/* Quick Actions */}
        <div className="mt-4 lg:mt-8 px-3 lg:px-4 pb-3 lg:pb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 lg:p-4 text-white">
            <div className="flex items-center space-x-2 mb-2 lg:mb-3">
              <Bell className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium truncate">Quick Actions</span>
            </div>
            <div className="space-y-2 lg:space-y-3">
              <Link 
                to="/provider/services?action=add" 
                className="flex items-center space-x-2 text-xs hover:bg-white/10 rounded px-2 py-1 transition-colors"
              >
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Add New Service</span>
              </Link>
              <Link 
                to="/provider/schedule" 
                className="flex items-center space-x-2 text-xs hover:bg-white/10 rounded px-2 py-1 transition-colors"
              >
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Update Availability</span>
              </Link>
              <Link 
                to="/provider/profile" 
                className="flex items-center space-x-2 text-xs hover:bg-white/10 rounded px-2 py-1 transition-colors"
              >
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Complete Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed sign out button at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
        <button
          onClick={signOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors w-full justify-start"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};