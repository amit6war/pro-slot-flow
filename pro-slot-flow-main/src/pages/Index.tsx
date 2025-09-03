import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Heart,
  ArrowRight,
  TrendingUp,
  Award,
  Shield
} from 'lucide-react';
import { LocationModal } from '@/components/LocationModal';
import { ProviderDetailsModal } from '@/components/ProviderDetailsModal';
import { SlotBookingModal } from '@/components/SlotBookingModal';

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
  duration: string;
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
  phone: string;
  email: string;
  address: string;
  services: string[];
  responseTime: string;
  completedJobs: number;
  isVerified: boolean;
  verified: boolean;
  profileImage: string;
  availability: string;
  price: number;
  originalPrice?: number;
  description: string;
}

// Updated categories with sections
const sections = [
  {
    id: 'men',
    name: 'Men\'s Services',
    icon: '👨',
    description: 'Grooming and styling services for men',
    gradient: 'from-blue-500 to-indigo-600',
    categories: [
      { id: 1, name: 'Hair & Beard', icon: '✂️', services: ['Haircut', 'Beard Trim', 'Hair Styling'] },
      { id: 2, name: 'Spa & Massage', icon: '💆‍♂️', services: ['Deep Tissue Massage', 'Facial', 'Body Scrub'] },
      { id: 3, name: 'Fitness', icon: '💪', services: ['Personal Training', 'Yoga', 'Nutrition Coaching'] },
    ]
  },
  {
    id: 'women',
    name: 'Women\'s Services',
    icon: '👩',
    description: 'Beauty and wellness services for women',
    gradient: 'from-pink-500 to-rose-600',
    categories: [
      { id: 4, name: 'Salon', icon: '💇‍♀️', services: ['Hair Cut', 'Hair Color', 'Hair Treatment'] },
      { id: 5, name: 'Spa & Wellness', icon: '🧖‍♀️', services: ['Facial', 'Massage', 'Body Treatment'] },
      { id: 6, name: 'Beauty', icon: '💄', services: ['Makeup', 'Eyebrow Threading', 'Manicure & Pedicure'] },
    ]
  },
  {
    id: 'home',
    name: 'Home Services',
    icon: '🏠',
    description: 'Professional home maintenance and cleaning',
    gradient: 'from-green-500 to-emerald-600',
    categories: [
      { id: 7, name: 'Cleaning', icon: '🧹', services: ['House Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning'] },
      { id: 8, name: 'Repairs & Maintenance', icon: '🔧', services: ['Plumbing', 'Electrical', 'Carpentry'] },
      { id: 9, name: 'Appliance Services', icon: '🔌', services: ['AC Service', 'Washing Machine Repair', 'Refrigerator Repair'] },
    ]
  }
];

const mockServices: Service[] = [
  { id: 1, name: 'House Cleaning', price: 50, duration: '2 hours', rating: 4.8, category: 'Home Services', description: 'Professional house cleaning service', isPopular: true },
  { id: 2, name: 'Plumbing Repair', price: 75, duration: '1 hour', rating: 4.9, category: 'Home Services', description: 'Quick plumbing fixes', isPopular: false },
  { id: 3, name: 'Haircut & Styling', price: 30, duration: '45 min', rating: 4.7, category: 'Beauty & Wellness', description: 'Professional hair styling', isPopular: true },
];

const mockProviders: Provider[] = [
  {
    id: 1,
    name: 'John\'s Cleaning Service',
    rating: 4.8,
    reviews: 124,
    location: 'Downtown',
    distance: '0.8 km',
    phone: '+1-555-0123',
    email: 'john@cleaningservice.com',
    address: '123 Main St, Downtown',
    services: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning'],
    responseTime: '15 min',
    completedJobs: 89,
    isVerified: true,
    verified: true,
    profileImage: '/placeholder.svg',
    availability: 'Available today',
    price: 50,
    originalPrice: 60,
    description: 'Professional cleaning service with 5+ years of experience. We provide thorough and reliable cleaning services for homes and offices.'
  },
];

const mockTimeSlots: TimeSlot[] = [
  { id: 1, time: '9:00 AM', available: true, price: 50, date: '2024-01-15' },
  { id: 2, time: '11:00 AM', available: true, price: 50, date: '2024-01-15' },
  { id: 3, time: '2:00 PM', available: true, price: 55, date: '2024-01-15' },
  { id: 4, time: '4:00 PM', available: false, price: 55, date: '2024-01-15' },
];

const mockFavorites = new Set([1, 3]);

// Removed mockCities - now using dynamic locations from admin

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function Index() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Moncton, NB');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [favorites, setFavorites] = useState(mockFavorites);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotTimer, setSlotTimer] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleBookService = (provider: Provider) => {
    setSelectedProvider(provider);
    setSelectedService(mockServices[0]);
    setShowSlotModal(true);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSlotTimer(600);
  };

  const toggleFavorite = (providerId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(providerId)) {
      newFavorites.delete(providerId);
    } else {
      newFavorites.add(providerId);
    }
    setFavorites(newFavorites);
  };

  const handleLocationSelect = (location: string) => {
    setLocationLoading(true);
    setTimeout(() => {
      setSelectedLocation(location);
      setShowLocationModal(false);
      setLocationLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

      {/* Service Sections */}
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

          <div className="grid-responsive mb-12 lg:mb-16">
            {sections.map((section, index) => (
              <Card 
                key={section.id} 
                className={`card-premium group border-0 bg-gradient-to-br from-white via-gray-50/30 to-white animate-fade-in animate-stagger-${index + 1} hover:shadow-premium`}
                onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
              >
                <CardContent className="p-6 lg:p-10 text-center">
                  <div className={`w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-gradient-to-r ${section.gradient} flex items-center justify-center mx-auto mb-6 lg:mb-8 group-hover:scale-110 transition-all duration-300 shadow-medium`}>
                    <span className="text-2xl lg:text-4xl">{section.icon}</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">{section.name}</h3>
                  <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">{section.description}</p>
                  <Button 
                    variant="outline" 
                    className="btn-secondary group-hover:btn-primary group-hover:text-white transition-all duration-300 w-full sm:w-auto"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expanded Section Categories */}
          {selectedSection && (
            <div className="mt-12 animate-fade-in">
              {sections.filter(s => s.id === selectedSection).map(section => (
                <div key={section.id} className="bg-gradient-secondary rounded-3xl p-10 shadow-medium">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    {section.name} Categories
                  </h3>
                  <div className="grid-responsive">
                    {section.categories.map((category, index) => (
                      <Card key={category.id} className={`card-floating group animate-slide-up animate-stagger-${index + 1} hover:shadow-floating`}>
                        <CardContent className="p-8 text-center">
                          <div className="text-5xl mb-6">{category.icon}</div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-4">{category.name}</h4>
                          <div className="space-y-3 mb-6">
                            {category.services.map((service, index) => (
                              <Badge key={index} className="badge-secondary text-sm mr-2 mb-2">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          <Button className="btn-primary w-full" size="sm">
                            View Services
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Services */}
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
            {mockProviders.map((provider, index) => (
              <Card key={provider.id} className={`card-neon group animate-fade-in animate-stagger-${index + 1} hover:shadow-neon`}>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-start justify-between mb-4 lg:mb-6">
                    <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-primary text-white group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-medium">
                        <span className="text-lg lg:text-xl font-bold">{provider.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2 truncate">{provider.name}</h4>
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600 text-sm lg:text-base">
                          <MapPin className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                          <span className="truncate">{provider.location}</span>
                          <span>•</span>
                          <span className="font-medium">{provider.distance}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(provider.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 flex-shrink-0"
                    >
                      <Heart className={`h-4 w-4 lg:h-5 lg:w-5 ${favorites.has(provider.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-4 lg:mb-6">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <Star className="h-4 w-4 lg:h-5 lg:w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 text-sm lg:text-base">{provider.rating}</span>
                      <span className="text-gray-500 text-sm lg:text-base">({provider.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm">Responds in {provider.responseTime}</span>
                    </div>
                    {provider.isVerified && (
                      <div className="status-success text-xs lg:text-sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    {provider.services.slice(0, 2).map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service}</p>
                          <p className="text-sm text-gray-600">Professional service</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${provider.price}</p>
                          {provider.originalPrice && (
                            <p className="text-sm text-gray-500 line-through">${provider.originalPrice}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {provider.services.length > 2 && (
                      <p className="text-sm text-gray-500 text-center">+{provider.services.length - 2} more services available</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProviderClick(provider)}
                      className="btn-secondary flex-1 py-2.5"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleBookService(provider)}
                      size="sm"
                      className="btn-primary flex-1 py-2.5"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
        provider={selectedProvider}
        onBookNow={() => {
          setShowProviderModal(false);
          if (selectedProvider) {
            handleBookService(selectedProvider);
          }
        }}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedProvider ? favorites.has(selectedProvider.id) : false}
      />

      <SlotBookingModal
        isOpen={showSlotModal}
        onClose={() => setShowSlotModal(false)}
        provider={selectedProvider}
        timeSlots={mockTimeSlots}
        selectedSlot={selectedSlot}
        onSlotSelect={handleSlotSelect}
        slotTimer={slotTimer}
        formatTime={formatTime}
      />
    </Layout>
  );
}
