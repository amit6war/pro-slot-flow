import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowLeft, MapPin, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  rating: number;
}

interface Provider {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url?: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
  address: string;
  service?: {
    id: string;
    service_name: string;
    description?: string;
    price: number;
    duration_minutes: number;
  };
}

const ProviderSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedServices, categoryId, categoryName, subcategoryId, subcategoryName, selectedSubcategory } = location.state || {};
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!subcategoryId) {
        toast({
          title: "No service selected",
          description: "Please select a service first",
          variant: "destructive"
        });
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching providers for subcategory:', subcategoryId);

        // Fetch providers who offer services in the selected subcategory
        const { data: providerServices, error: servicesError } = await supabase
          .from('provider_services')
          .select(`
            *,
            user_profiles!provider_id (
              id,
              user_id,
              full_name,
              business_name,
              phone,
              address
            )
          `)
          .eq('subcategory_id', subcategoryId)
          .eq('status', 'approved')
          .eq('is_active', true);

        console.log('Provider services found:', providerServices);

        if (servicesError) throw servicesError;

        if (!providerServices || providerServices.length === 0) {
          console.log('No provider services found for subcategory:', subcategoryId);
          setProviders([]);
          return;
        }

        // Get unique provider IDs
        const uniqueProviderIds = [...new Set(providerServices.map(ps => ps.provider_id))];
        
        // Get provider details from service_providers table
        const { data: serviceProviders, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', providerServices.map(ps => ps.user_profiles?.user_id).filter(Boolean))
          .eq('status', 'approved');

        if (providersError) throw providersError;

        // Combine data and format for UI with service details
        const formattedProviders = uniqueProviderIds.map(providerId => {
          const providerService = providerServices.find(ps => ps.provider_id === providerId);
          const userProfile = providerService?.user_profiles;
          const serviceProvider = serviceProviders?.find(sp => sp.user_id === userProfile?.user_id);
          
          return {
            id: providerId,
            business_name: userProfile?.business_name || serviceProvider?.business_name || 'Professional Service Provider',
            contact_person: userProfile?.full_name || serviceProvider?.contact_person || 'Service Provider',
            phone: userProfile?.phone || serviceProvider?.phone || 'N/A',
            rating: serviceProvider?.rating || 4.5,
            years_of_experience: serviceProvider?.years_of_experience || 2,
            total_reviews: serviceProvider?.total_reviews || 0,
            total_completed_jobs: serviceProvider?.total_completed_jobs || 0,
            profile_image_url: serviceProvider?.profile_image_url || '/placeholder.svg',
            specializations: Array.isArray(serviceProvider?.specializations) ? serviceProvider.specializations : [],
            certifications: Array.isArray(serviceProvider?.certifications) ? serviceProvider.certifications : ['Licensed'],
            response_time_minutes: serviceProvider?.response_time_minutes || 15,
            address: userProfile?.address || serviceProvider?.address || 'Location not specified',
            // Service details for this provider
            service: {
              id: providerService?.id,
              service_name: providerService?.service_name || subcategoryName,
              description: providerService?.description,
              price: providerService?.price || 0,
              duration_minutes: providerService?.duration_minutes || 60
            }
          };
        }).filter(provider => provider.id);

        setProviders(formattedProviders.map(provider => ({
          ...provider,
          specializations: provider.specializations.map(spec => String(spec)),
          certifications: provider.certifications.map(cert => String(cert))
        })));

      } catch (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: "Error loading providers",
          description: "Failed to load service providers",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [subcategoryId, subcategoryName, navigate]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleNext = () => {
    if (!selectedProvider) {
      toast({
        title: "Please select a provider",
        description: "Choose a service provider to continue",
        variant: "destructive"
      });
      return;
    }

    const provider = providers.find(p => p.id === selectedProvider);
    navigate('/date-selection', {
      state: {
        selectedServices: provider?.service ? [provider.service] : [],
        selectedProvider: provider,
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName
      }
    });
  };

  const getTotalPrice = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    return provider?.service?.price || 0;
  };

  if (!subcategoryId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Service Selected</h1>
            <p className="text-muted-foreground mb-4">Please select a service first</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Choose Service Provider
                </h1>
                <p className="text-muted-foreground">
                  Select from verified professionals in your area
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Selected Service Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Selected Service</h2>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{subcategoryName}</h3>
                  <p className="text-sm text-muted-foreground">{categoryName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  {selectedProvider && providers.find(p => p.id === selectedProvider)?.service?.price && (
                    <p className="font-semibold">${providers.find(p => p.id === selectedProvider)?.service?.price}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Providers Available</h3>
              <p className="text-muted-foreground mb-4">
                No approved service providers found for "{subcategoryName}" in your area.
              </p>
              <div className="text-sm text-muted-foreground mb-4">
                <p>This could be because:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>No providers have registered for this service yet</li>
                  <li>Providers are still pending approval</li>
                  <li>Service is temporarily unavailable</li>
                </ul>
              </div>
              <Button onClick={() => navigate(-1)} variant="outline">
                Choose Different Service
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 mb-8">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedProvider === provider.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={provider.profile_image_url || '/placeholder.svg'}
                        alt={provider.business_name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{provider.business_name}</h3>
                            <p className="text-muted-foreground">{provider.contact_person}</p>
                          </div>
                          {selectedProvider === provider.id && (
                            <Badge className="bg-primary text-primary-foreground">
                              ✓ Selected
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({provider.total_reviews} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Responds in {provider.response_time_minutes} min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{provider.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{provider.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{provider.years_of_experience} years experience</span>
                          <span>{provider.total_completed_jobs} jobs completed</span>
                          {provider.service?.price && (
                            <span className="font-semibold text-primary">${provider.service.price}</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {provider.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {provider.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Continue Button */}
          {selectedProvider && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40" style={{ paddingRight: '120px' }}>
              <div className="container mx-auto">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Provider selected • {subcategoryName}
                    </p>
                    <p className="font-semibold">Total: ${getTotalPrice()}</p>
                  </div>
                  <Button onClick={handleNext} size="lg" className="px-8">
                    Next: Select Date & Time
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProviderSelection;