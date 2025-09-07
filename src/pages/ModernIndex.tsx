import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, MapPin, Bell, User, Menu, X } from 'lucide-react';
import { CategorySidebar } from '@/components/CategorySidebar';
import { ServiceGrid } from '@/components/ServiceGrid';
import { ProviderSelectionModal } from '@/components/ProviderSelectionModal';
import { SlotBookingModal } from '@/components/SlotBookingModal';
import { EnhancedCartSidebar } from '@/components/EnhancedCartSidebar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  image_url?: string;
  duration_minutes: number;
  rating: number;
  total_bookings: number;
  provider_id: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
    years_of_experience: number;
    profile_image_url?: string;
    total_reviews: number;
  };
  subcategories?: {
    name: string;
  };
}

interface Provider {
  id: string;
  business_name: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url?: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
}

interface TimeSlot {
  id: number;
  time: string;
  price: number;
  available: boolean;
  date: string;
}

const ModernIndex: React.FC = () => {
  const { itemCount } = useCart();
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Select Location');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modal states
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  // Mock time slots
  const mockTimeSlots: TimeSlot[] = [
    { id: 1, time: '09:00', price: 100, available: true, date: '2025-09-07' },
    { id: 2, time: '10:30', price: 120, available: true, date: '2025-09-07' },
    { id: 3, time: '12:00', price: 150, available: false, date: '2025-09-07' },
    { id: 4, time: '14:00', price: 130, available: true, date: '2025-09-07' },
    { id: 5, time: '16:30', price: 140, available: true, date: '2025-09-07' },
    { id: 6, time: '18:00', price: 160, available: true, date: '2025-09-07' }
  ];

  // Redirect authenticated admin/provider users to their dashboards
  useEffect(() => {
    if (isAuthenticated && profile?.auth_role) {
      if (profile.auth_role === 'admin' || profile.auth_role === 'super_admin') {
        navigate('/dashboard/admin');
        return;
      }
      if (profile.auth_role === 'provider') {
        navigate('/dashboard/provider');
        return;
      }
    }
  }, [isAuthenticated, profile, navigate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowProviderModal(true);
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(false);
    setShowSlotModal(true);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    setShowSlotModal(false);
    setSelectedService(null);
    setSelectedProvider(null);
    setSelectedSlot(null);
  };

  const handleProceedToPayment = () => {
    // This will be handled by the cart sidebar
    console.log('Proceeding to payment...');
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Show user profile menu or navigate to profile
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ServiceHub
                </div>
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCartSidebar(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant={isAuthenticated ? "secondary" : "default"}
                size="sm"
                onClick={handleAuthAction}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">
                  {isAuthenticated ? (profile?.full_name || 'Profile') : 'Sign In'}
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className={`transition-all duration-300 ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'} fixed lg:relative z-30 h-full`}>
            <CategorySidebar
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={setSelectedCategory}
              onSubcategorySelect={setSelectedSubcategory}
            />
          </div>

          {/* Overlay for mobile */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <ServiceGrid
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onServiceSelect={handleServiceSelect}
            />
          </div>
        </div>

        {/* Modals */}
        <ProviderSelectionModal
          isOpen={showProviderModal}
          onClose={() => setShowProviderModal(false)}
          serviceId={selectedService?.id || ''}
          serviceName={selectedService?.service_name || ''}
          onProviderSelect={handleProviderSelect}
        />

        <SlotBookingModal
          isOpen={showSlotModal}
          onClose={() => {
            setShowSlotModal(false);
            setSelectedService(null);
            setSelectedProvider(null);
            setSelectedSlot(null);
          }}
          provider={selectedProvider ? {
            id: parseInt(selectedProvider.id),
            name: selectedProvider.business_name,
            services: selectedService ? [selectedService.service_name] : [],
            price: selectedService?.price || 0
          } : null}
          timeSlots={mockTimeSlots}
          selectedSlot={selectedSlot}
          onSlotSelect={handleSlotSelect}
          slotTimer={null}
          formatTime={(seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`}
        />

        <EnhancedCartSidebar
          isOpen={showCartSidebar}
          onClose={() => setShowCartSidebar(false)}
          onProceedToPayment={handleProceedToPayment}
        />
      </div>
    </Layout>
  );
};

export default ModernIndex;