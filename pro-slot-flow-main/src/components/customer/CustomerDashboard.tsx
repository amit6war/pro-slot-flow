import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Mock component for `Button` from shadcn/ui to make the app self-contained.
const Button = ({ variant, size, onClick, className, children }) => {
  const baseClasses = "rounded-lg font-medium transition-colors";
  const variants = {
    ghost: "text-gray-600 hover:bg-gray-100",
    default: "bg-blue-600 text-white hover:bg-blue-700",
  };
  const sizes = {
    sm: "p-2",
    default: "px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
    >
      {children}
    </button>
  );
};

// Mock `useAuth` hook to simulate authentication and user data
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch user and profile data
    const fetchAuthData = () => {
      setLoading(true);
      setTimeout(() => {
        const mockUser = {
          uid: 'user-123',
          name: 'Amit Sukla',
          email: 'amit.sukla@example.com',
        };
        const mockProfile = {
          auth_role: 'customer',
          status: 'active',
        };
        setUser(mockUser);
        setProfile(mockProfile);
        setLoading(false);
      }, 1500); // Simulate network latency
    };
    fetchAuthData();
  }, []);

  return { user, loading, profile };
};

// --- Mock Components for the Dashboard Sections ---

const CustomerSidebar = ({ isOpen, onClose, user, profile }) => {
  const location = useLocation();

  // Function to determine if a link is active based on the current URL
  const isActive = (path) => location.pathname === path;

  // Render a "brand" component or the user's details
  const renderProfile = () => {
    if (user) {
      return (
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{user.name}</span>
            <span className="text-sm text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">Pro Slot Flow</h1>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 lg:hidden">
        <h2 className="text-lg font-bold text-gray-900">Pro Slot Flow</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>

      {renderProfile()}

      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link
          to="/customer"
          onClick={onClose}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${isActive('/customer') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          to="/customer/bookings"
          onClick={onClose}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${isActive('/customer/bookings') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="font-medium">My Bookings</span>
        </Link>
        <Link
          to="/customer/favorites"
          onClick={onClose}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${isActive('/customer/favorites') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="font-medium">Favorites</span>
        </Link>
        <Link
          to="/customer/profile"
          onClick={onClose}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${isActive('/customer/profile') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

const CustomerOverview = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
      <p className="text-gray-600">Welcome back, get ready for your next booking!</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">Active Bookings</h3>
        <p className="mt-2 text-gray-600">You have 2 active bookings.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">Completed</h3>
        <p className="mt-2 text-gray-600">You have completed 10 bookings.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">Favorites</h3>
        <p className="mt-2 text-gray-600">You have 5 favorite providers.</p>
      </div>
    </div>
  </div>
);

const CustomerBookings = () => (
  <div className="p-8 bg-white rounded-2xl shadow-sm">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
    <p className="text-gray-600">This is where your booking history will be displayed.</p>
  </div>
);

const CustomerFavorites = () => (
  <div className="p-8 bg-white rounded-2xl shadow-sm">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Favorites</h1>
    <p className="text-gray-600">This is where your favorite providers will be displayed.</p>
  </div>
);

const CustomerProfile = () => (
  <div className="p-8 bg-white rounded-2xl shadow-sm">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
    <p className="text-gray-600">Here you can manage your profile settings.</p>
  </div>
);


// The main component that ties everything together
export default function App() {
  const { user, loading, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle the loading state and show a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-6 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Loading Pro Slot Flow</h2>
            <p className="text-gray-600 max-w-md">Setting up your personalized dashboard experience...</p>
            <p className="text-sm text-gray-500 mt-4">
              If this takes too long, there might be a connection issue.
              <br />
              <Button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 underline mt-3 font-medium transition-colors"
                variant="ghost"
                size="sm"
              >
                Click here to refresh
              </Button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle the case where the user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access the customer dashboard.</p>
          <Button
            onClick={() => (window.location.href = '/auth')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            variant="default"
            size="lg"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Core dashboard layout
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay, only visible when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - This container is responsible for the responsive behavior */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Pass user and profile as props for a professional look */}
          <CustomerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
            profile={profile}
          />
        </div>

        {/* Main Content Area - Use flex-1 to make it take the remaining space */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header with Menu Button */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-lg font-semibold text-gray-900">Customer Dashboard</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          {/* Main content with padding and max-width for professional look */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/customer" element={<CustomerOverview />} />
                <Route path="/customer/bookings" element={<CustomerBookings />} />
                <Route path="/customer/favorites" element={<CustomerFavorites />} />
                <Route path="/customer/profile" element={<CustomerProfile />} />
                {/* Redirect from root to customer dashboard */}
                <Route path="/" element={<Navigate to="/customer" replace />} />
                <Route path="*" element={<Navigate to="/customer" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}