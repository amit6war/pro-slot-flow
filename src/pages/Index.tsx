import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { LocationModal } from '@/components/LocationModal';
import { ProviderDetailsModal } from '@/components/ProviderDetailsModal';
import { SlotBookingModal } from '@/components/SlotBookingModal';
import { AddToCartButton } from '@/components/AddToCartButton';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  Shield, 
  Award, 
  TrendingUp, 
  Heart, 
  Clock 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';

// Types (matching existing interfaces)
interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
  price: number;
  date: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  rating: number;
  category: string;
  description: string;
  isPopular: boolean;
}

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  responseTime: string;
  verified: boolean;
  completedJobs: number;
  description: string;
  phone: string;
  email: string;
  services: string[];
  price: number;
  originalPrice?: number;
  address?: string;
  availability?: any;
}

// Mock data for demonstration
const mockServices: Service[] = [
  { id: 1, name: 'House Cleaning', price: 120, duration: 120, rating: 4.8, category: 'cleaning', description: 'Professional deep cleaning', isPopular: true },
  { id: 2, name: 'Plumbing Repair', price: 85, duration: 60, rating: 4.6, category: 'home-repair', description: 'Emergency plumbing services', isPopular: false },
  { id: 3, name: 'Hair Styling', price: 45, duration: 90, rating: 4.9, category: 'beauty', description: 'Professional hair styling', isPopular: true },
];

const mockProviders: Provider[] = [
  {
    id: 1,
    name: 'Elite Cleaning Services',
    rating: 4.8,
    reviews: 156,
    location: 'Downtown',
    distance: '1.2 km',
    responseTime: '15min',
    verified: true,
    completedJobs: 200,
    description: 'Professional cleaning services',
    phone: '+1234567890',
    email: 'elite@cleaning.com',
    services: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning'],
    price: 120,
    originalPrice: 150
  },
  {
    id: 2,
    name: 'Pro Handyman Services',
    rating: 4.6,
    reviews: 89,
    location: 'Midtown',
    distance: '2.1 km',
    responseTime: '30min',
    verified: true,
    completedJobs: 120,
    description: 'Expert handyman services',
    phone: '+1234567891',
    email: 'pro@handyman.com',
    services: ['Plumbing', 'Electrical', 'Carpentry'],
    price: 85
  },
  {
    id: 3,
    name: 'Beauty Experts Salon',
    rating: 4.9,
    reviews: 234,
    location: 'Uptown',
    distance: '1.8 km',
    responseTime: '20min',
    verified: true,
    completedJobs: 400,
    description: 'Professional beauty services',
    phone: '+1234567892',
    email: 'beauty@experts.com',
    services: ['Hair Styling', 'Manicure', 'Facial'],
    price: 45,
    originalPrice: 60
  }
];

const mockTimeSlots: TimeSlot[] = [
  { id: 1, time: '09:00', available: true, price: 120, date: '2024-03-15' },
  { id: 2, time: '10:30', available: true, price: 120, date: '2024-03-15' },
  { id: 3, time: '14:00', available: false, price: 120, date: '2024-03-15' },
  { id: 4, time: '16:30', available: true, price: 150, date: '2024-03-15' },
];

const mockFavorites = new Set([1, 3]);

// Icon mapping for categories
const categoryIconMap: { [key: string]: string } = {
  '🏠': '🏠',
  '🔧': '🔧',
  '💄': '💄',
  '🚗': '🚗',
  '💻': '💻',
  '🏃': '🏃',
  'home': '🏠',
  'repair': '🔧',
  'beauty': '💄',
  'automotive': '🚗',
  'technology': '💻',
  'fitness': '🏃',
};

// Utility function
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function Index() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Select your location');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotTimer, setSlotTimer] = useState(0);
  const [favorites, setFavorites] = useState(mockFavorites);
  const [locationLoading, setLocationLoading] = useState(false);

  // Hooks
  const { isAuthenticated } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { subcategories } = useSubcategories(selectedCategory);

  // Query for services based on selected subcategory
  const { data: categoryServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['provider-services', selectedSubcategory],
    queryFn: async () => {
      if (!selectedSubcategory) return [];
      
      // Get provider services for the selected subcategory
      const { data: providerServices, error } = await supabase
        .from('provider_services')
        .select(`
          *,
          subcategories!inner (
            id,
            name,
            description,
            min_price,
            max_price
          )
        `)
        .eq('subcategory_id', selectedSubcategory)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }

      if (!providerServices || providerServices.length === 0) {
        return [];
      }

      // Get provider details for these services
      const providerIds = providerServices.map(ps => ps.provider_id).filter(Boolean);
      
      // First get user_profiles to get the user_id
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, business_name')
        .in('id', providerIds);

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
        return providerServices.map(ps => ({ ...ps, service_providers: null }));
      }

      // Then get service_providers using the user_id
      const userIds = userProfiles?.map(up => up.user_id).filter(Boolean) || [];
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'approved');

      if (providersError) {
        console.error('Error fetching providers:', providersError);
        return providerServices.map(ps => ({ ...ps, service_providers: null }));
      }

      // Combine the data
      return providerServices.map(ps => {
        const userProfile = userProfiles?.find(up => up.id === ps.provider_id);
        const provider = providers?.find(p => p.user_id === userProfile?.user_id);
        return {
          ...ps,
          service_providers: provider,
          user_profile: userProfile
        };
      });
    },
    enabled: !!selectedSubcategory,
  });

  // Query for popular services with their providers
  const { data: popularServices, isLoading: popularServicesLoading } = useQuery({
    queryKey: ['popular-services'],
    queryFn: async () => {
      // First get services marked as popular
      const { data: popularServiceData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_popular', true)
        .eq('is_active', true);

      if (servicesError) {
        console.error('Error fetching popular services:', servicesError);
        return [];
      }

      if (!popularServiceData || popularServiceData.length === 0) {
        return [];
      }

      // Get subcategories for these services
      const subcategoryIds = popularServiceData.map(service => service.subcategory_id).filter(Boolean);
      
      if (subcategoryIds.length === 0) {
        return [];
      }

      // Get provider services for these subcategories
      const { data: providerServices, error: providerError } = await supabase
        .from('provider_services')
        .select(`
          *,
          subcategories!inner (
            id,
            name,
            description
          )
        `)
        .in('subcategory_id', subcategoryIds)
        .eq('status', 'approved')
        .eq('is_active', true)
        .limit(6);

      if (providerError) {
        console.error('Error fetching provider services:', providerError);
        return [];
      }

      // Get provider details for these services
      if (providerServices && providerServices.length > 0) {
        const providerIds = providerServices.map(ps => ps.provider_id).filter(Boolean);
        
        // First get user_profiles to get the user_id
        const { data: userProfiles, error: userProfilesError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, business_name')
          .in('id', providerIds);

        if (userProfilesError) {
          console.error('Error fetching user profiles:', userProfilesError);
          return providerServices.map(ps => ({ ...ps, service_providers: null }));
        }

        // Then get service_providers using the user_id
        const userIds = userProfiles?.map(up => up.user_id).filter(Boolean) || [];
        const { data: providers, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', userIds)
          .eq('status', 'approved');

        if (providersError) {
          console.error('Error fetching providers:', providersError);
          return providerServices.map(ps => ({ ...ps, service_providers: null }));
        }

        // Combine the data
        return providerServices.map(ps => {
          const userProfile = userProfiles?.find(up => up.id === ps.provider_id);
          const provider = providers?.find(p => p.user_id === userProfile?.user_id);
          return {
            ...ps,
            service_providers: provider,
            user_profile: userProfile
          };
        });
      }

      return [];
    }
  });

  // Query for all available services with providers count
  const { data: allAvailableServices, isLoading: allServicesLoading } = useQuery({
    queryKey: ['all-available-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          subcategory_id,
          provider_id,
          subcategories!inner (
            id,
            name,
            description,
            category_id,
            categories!inner (
              id,
              name,
              icon
            )
          )
        `)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching available services:', error);
        return [];
      }

      // Group by subcategory and count unique providers
      const serviceMap = new Map();
      data?.forEach(service => {
        const key = service.subcategory_id;
        if (!serviceMap.has(key)) {
          serviceMap.set(key, {
            ...service.subcategories,
            providerCount: 0,
            providerIds: new Set()
          });
        }
        serviceMap.get(key).providerIds.add(service.provider_id);
      });

      // Convert Set to count
      return Array.from(serviceMap.values()).map(service => ({
        ...service,
        providerCount: service.providerIds.size,
        providerIds: undefined // Remove the Set
      }));
    }
  });

  // Event handlers
  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleBookService = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowSlotModal(true);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSlotTimer(300); // 5 minutes
  };

  const toggleFavorite = (providerId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId);
      } else {
        newFavorites.add(providerId);
      }
      return newFavorites;
    });
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  // Timer effect for slot booking
  useEffect(() => {
    if (slotTimer > 0) {
      const timer = setInterval(() => {
        setSlotTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [slotTimer]);

  // Loading state
  if (categoriesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 lg:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                Book Premium 
                <span className="gradient-text block sm:inline"> Services</span>
                <br className="hidden sm:block" />Near You
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Connect with verified professionals for all your service needs. Quality guaranteed, convenience delivered.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="card-elevated p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto mb-12">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4">
                <div className="lg:col-span-6 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-primary w-full pl-12 pr-4 py-3 lg:py-4 text-base lg:text-lg"
                  />
                </div>
                <div className="lg:col-span-4 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="input-primary w-full pl-12 pr-4 py-3 lg:py-4 text-left hover:bg-gray-50 transition-colors text-gray-700 text-base lg:text-lg"
                  >
                    {selectedLocation}
                  </button>
                </div>
                <div className="lg:col-span-2">
                  <Button className="btn-primary w-full py-3 lg:py-4 text-base lg:text-lg font-semibold">
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                  <Shield className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">500+</div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Verified Providers</div>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                  <Award className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">50+</div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Service Categories</div>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                  <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">10k+</div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-amber-500 to-amber-600 text-white mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">4.8★</div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Explore Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional services tailored to your needs, delivered by trusted experts who care about quality
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid-responsive mb-12 lg:mb-16">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading categories...</p>
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((category: any, index: number) => (
                <Card 
                  key={category.id} 
                  className={`card-premium group border-0 bg-gradient-to-br from-white via-gray-50/30 to-white animate-fade-in animate-stagger-${index + 1} hover:shadow-premium cursor-pointer ${selectedCategory === category.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category.id ? null : category.id);
                    setSelectedSubcategory(null); // Reset subcategory selection
                  }}
                >
                  <CardContent className="p-6 lg:p-10 text-center">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center mx-auto mb-6 lg:mb-8 group-hover:scale-110 transition-all duration-300 shadow-medium">
                      <span className="text-2xl lg:text-4xl">{categoryIconMap[category.icon] || category.icon || '🔧'}</span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">{category.name}</h3>
                    <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">{category.description || 'Professional services for all your needs'}</p>
                    <Button 
                      variant="outline" 
                      className={`btn-secondary group-hover:btn-primary group-hover:text-white transition-all duration-300 w-full sm:w-auto ${selectedCategory === category.id ? 'btn-primary text-white' : ''}`}
                    >
                      {selectedCategory === category.id ? 'Selected' : 'Explore Services'}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No service categories available yet.</p>
                <p className="text-gray-400 text-sm mt-2">Categories will appear here once they are added by administrators.</p>
              </div>
            )}
          </div>

          {/* Subcategories Section */}
          {selectedCategory && (
            <div className="mt-12 animate-fade-in">
              <div className="bg-gradient-secondary rounded-3xl p-10 shadow-medium">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {categories?.find(c => c.id === selectedCategory)?.name} Services
                </h3>
                <div className="grid-responsive">
                  {subcategories?.map((subcategory: any, index: number) => (
                    <Card 
                      key={subcategory.id} 
                      className={`card-floating group animate-slide-up animate-stagger-${index + 1} hover:shadow-floating cursor-pointer ${selectedSubcategory === subcategory.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                    >
                      <CardContent className="p-8 text-center">
                        <div className="text-5xl mb-6">⚡</div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">{subcategory.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{subcategory.description}</p>
                        <div className="text-sm text-gray-500 mb-6">
                          Price range: ${subcategory.min_price} - ${subcategory.max_price}
                        </div>
                        
                        <Button 
                          variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                          className="w-full"
                        >
                          {selectedSubcategory === subcategory.id ? 'View Providers' : 'Select Category'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {(!subcategories || subcategories.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No services available in this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Providers Section */}
          {selectedSubcategory && (
            <div className="mt-12 animate-fade-in">
              <div className="bg-white rounded-3xl p-10 shadow-medium border">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Available Providers for {subcategories?.find(sc => sc.id === selectedSubcategory)?.name}
                </h3>
                <div className="grid-responsive">
                  {servicesLoading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading providers...</p>
                    </div>
                  ) : categoryServices && categoryServices.length > 0 ? (
                    categoryServices.map((service: any, index: number) => (
                      <Card key={service.id} className="card-floating group animate-slide-up hover:shadow-floating">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-primary text-white rounded-2xl flex items-center justify-center shadow-medium">
                                <span className="text-lg font-bold">{service.service_providers?.business_name?.charAt(0) || 'P'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{service.service_providers?.business_name || 'Professional Provider'}</h4>
                                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{service.service_providers?.rating || 4.5}</span>
                                  <span>({service.service_providers?.total_reviews || 0} reviews)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{service.service_name}</h5>
                                <span className="text-xl font-bold text-primary">${service.price}</span>
                              </div>
                              <p className="text-sm text-gray-600">{service.description || 'Professional service'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                // Set provider for details modal
                                const mockProvider: Provider = {
                                  id: parseInt(service.service_providers?.id || service.id) || 1,
                                  name: service.service_providers?.business_name || 'Professional Provider',
                                  rating: service.service_providers?.rating || 4.5,
                                  reviews: service.service_providers?.total_reviews || 0,
                                  location: service.service_providers?.address || 'Location',
                                  distance: '2.1 km',
                                  responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                                  verified: service.service_providers?.status === 'approved',
                                  completedJobs: 50,
                                  description: service.description || 'Professional service',
                                  phone: '+1234567890',
                                  email: 'provider@example.com',
                                  services: [service.service_name],
                                  price: service.price,
                                  originalPrice: null
                                };
                                setSelectedProvider(mockProvider);
                                setShowProviderModal(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                // Create mock provider for booking
                                const mockProvider: Provider = {
                                  id: parseInt(service.service_providers?.id || service.id) || 1,
                                  name: service.service_providers?.business_name || 'Professional Provider',
                                  rating: service.service_providers?.rating || 4.5,
                                  reviews: service.service_providers?.total_reviews || 0,
                                  location: service.service_providers?.address || 'Location',
                                  distance: '2.1 km',
                                  responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                                  verified: service.service_providers?.status === 'approved',
                                  completedJobs: 50,
                                  description: service.description || 'Professional service',
                                  phone: '+1234567890',
                                  email: 'provider@example.com',
                                  services: [service.service_name],
                                  price: service.price,
                                  originalPrice: null
                                };
                                setSelectedProvider(mockProvider);
                                setShowSlotModal(true);
                              }}
                            >
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No providers available for this service yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Available Services Section */}
      {!selectedSubcategory && allAvailableServices && allAvailableServices.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Available Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore all services with registered providers ready to serve you
              </p>
            </div>

            <div className="grid-responsive">
              {allAvailableServices.slice(0, 6).map((service: any, index: number) => (
                <Card key={service.id} className="card-floating group animate-slide-up hover:shadow-floating cursor-pointer" onClick={() => setSelectedSubcategory(service.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-primary text-white rounded-2xl flex items-center justify-center shadow-medium">
                        <span className="text-lg font-bold">{service.categories?.icon || '🔧'}</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        {service.providerCount} provider{service.providerCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description || 'Professional service available'}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Providers
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {allAvailableServices.length > 6 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  View All Services ({allAvailableServices.length})
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Services Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50/50 to-white">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 lg:mb-12 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">Popular Services</h2>
              <p className="text-lg lg:text-xl text-gray-600">Most booked services this week</p>
            </div>
            <Button className="btn-secondary hover-lift self-start sm:self-auto">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid-responsive">
            {popularServicesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading popular services...</p>
              </div>
            ) : popularServices && popularServices.length > 0 ? (
              popularServices.map((service: any, index: number) => (
                <Card key={service.id} className={`card-neon group animate-fade-in animate-stagger-${index + 1} hover:shadow-neon`}>
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-primary text-white group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                          <span className="text-lg lg:text-xl font-bold">{service.service_providers?.business_name?.charAt(0) || 'P'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2 truncate">{service.service_providers?.business_name || 'Professional Provider'}</h4>
                          <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600 text-sm lg:text-base">
                            <MapPin className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                            <span className="truncate">{service.service_providers?.address || 'Location'}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(parseInt(service.service_providers?.id) || service.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 flex-shrink-0"
                      >
                        <Heart className={`h-4 w-4 lg:h-5 lg:w-5 ${favorites.has(parseInt(service.service_providers?.id) || service.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-4 lg:mb-6">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <Star className="h-4 w-4 lg:h-5 lg:w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 text-sm lg:text-base">{service.service_providers?.rating || 4.5}</span>
                        <span className="text-gray-500 text-sm lg:text-base">({service.service_providers?.total_reviews || 0})</span>
                      </div>
                      <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="text-xs lg:text-sm">Responds in {service.service_providers?.response_time_minutes || 15}min</span>
                      </div>
                      {service.service_providers?.status === 'approved' && (
                        <div className="status-success text-xs lg:text-sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service.service_name}</p>
                          <p className="text-sm text-gray-600">{service.description || 'Professional service'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${service.price}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular Service
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const mockProvider: Provider = {
                            id: parseInt(service.service_providers?.id || service.id) || 1,
                            name: service.service_providers?.business_name || 'Professional Provider',
                            rating: service.service_providers?.rating || 4.5,
                            reviews: service.service_providers?.total_reviews || 0,
                            location: service.service_providers?.address || 'Location',
                            distance: '2.1 km',
                            responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                            verified: service.service_providers?.status === 'approved',
                            completedJobs: service.service_providers?.total_completed_jobs || 0,
                            description: service.description || 'Professional service',
                            phone: '+1234567890',
                            email: 'provider@example.com',
                            services: [service.service_name],
                            price: service.price,
                            originalPrice: null
                          };
                          setSelectedProvider(mockProvider);
                          setShowProviderModal(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const mockProvider: Provider = {
                            id: parseInt(service.service_providers?.id || service.id) || 1,
                            name: service.service_providers?.business_name || 'Professional Provider',
                            rating: service.service_providers?.rating || 4.5,
                            reviews: service.service_providers?.total_reviews || 0,
                            location: service.service_providers?.address || 'Location',
                            distance: '2.1 km',
                            responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                            verified: service.service_providers?.status === 'approved',
                            completedJobs: service.service_providers?.total_completed_jobs || 0,
                            description: service.description || 'Professional service',
                            phone: '+1234567890',
                            email: 'provider@example.com',
                            services: [service.service_name],
                            price: service.price,
                            originalPrice: null
                          };
                          setSelectedProvider(mockProvider);
                          setShowSlotModal(true);
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Popular Services Yet</h3>
                  <p className="text-gray-500">
                    Popular services will appear here once admins mark services as popular and providers register for them.
                  </p>
                </div>
              </div>
              )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="section-padding bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-hover/90"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose ServicePlatform?</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              We're committed to providing you with the best service experience through trust, quality, and value
            </p>
          </div>

          <div className="grid-responsive">
            <div className="text-center group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Shield className="h-8 w-8 lg:h-10 lg:w-10" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Verified Professionals</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                All service providers are background checked and verified for your safety and peace of mind
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Award className="h-8 w-8 lg:h-10 lg:w-10" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Quality Guaranteed</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                100% satisfaction guaranteed or your money back, no questions asked. Your happiness is our priority
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <TrendingUp className="h-8 w-8 lg:h-10 lg:w-10" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Best Prices</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                Competitive pricing with transparent costs and no hidden fees. Get the best value for your money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        loading={locationLoading}
      />

      <ProviderDetailsModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        provider={selectedProvider as any}
        onBookNow={() => {
          setShowProviderModal(false);
          if (selectedProvider) {
            handleBookService(selectedProvider);
          }
        }}
        onToggleFavorite={(id) => toggleFavorite(parseInt(id.toString()))}
        isFavorite={selectedProvider ? favorites.has(selectedProvider.id) : false}
      />

      <SlotBookingModal
        isOpen={showSlotModal}
        onClose={() => setShowSlotModal(false)}
        provider={selectedProvider as any}
        timeSlots={mockTimeSlots as any}
        selectedSlot={selectedSlot as any}
        onSlotSelect={handleSlotSelect}
        slotTimer={slotTimer}
        formatTime={formatTime}
      />
    </Layout>
  );
}