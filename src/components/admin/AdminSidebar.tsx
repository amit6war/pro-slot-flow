
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  Wrench, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings,
  MapPin,
  LogOut,
  ClipboardCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Provider Services', href: '/admin/provider-services', icon: ClipboardCheck },
  { name: 'Locations', href: '/admin/locations', icon: MapPin },
  { name: 'Providers', href: '/admin/providers', icon: UserCheck },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
