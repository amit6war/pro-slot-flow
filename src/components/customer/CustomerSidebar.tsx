
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  User, 
  LogOut,
  Home,
  X,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const CustomerSidebar: FC<CustomerSidebarProps> = ({ 
  isOpen = false, 
  onClose,
  activeSection = 'overview',
  onSectionChange 
}) => {
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', to: '/customer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { id: 'bookings', to: '/customer/bookings', icon: Calendar, label: 'My Bookings' },
    { id: 'addresses', to: '/customer/addresses', icon: MapPin, label: 'My Addresses' },
    { id: 'favorites', to: '/customer/favorites', icon: Heart, label: 'Favorites' },
    { id: 'profile', to: '/customer/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">PS</span>
          </div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-gray-900">Pro Slot</h2>
            <p className="text-xs text-gray-500 -mt-1">Customer Portal</p>
          </div>
        </div>
        
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden p-2"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile?.full_name || user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Button
          onClick={() => {
            navigate('/');
            onClose?.();
          }}
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-12 px-4 font-medium"
        >
          <Home className="h-5 w-5 mr-3" />
          Browse Services
        </Button>
        
        <div className="border-t border-gray-100 my-4"></div>
        
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange?.(item.id);
              onClose?.();
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-left ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12 px-4 font-medium"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
