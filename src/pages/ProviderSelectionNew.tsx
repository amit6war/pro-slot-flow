import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ArrowLeft, Award, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Provider {
  id: string; // Provider ID (user profile ID)
  business_name: string;
  contact_person: string;
  rating: number;
  years_of_experience: number;
  price: number;
  service_name: string;
  profile_image_url: string;
  serviceId?: string; // Provider service ID for cart operations
}

// Providers will be fetched from database based on selected services

const ProviderSelectionNew: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const { selectedServices = [], category = '', subcategoryId, subcategoryName } = location.state || {};

  console.log('ProviderSelectionNew - Location state:', location.state);
  console.log('ProviderSelectionNew - subcategoryId:', subcategoryId);
  console.log('ProviderSelectionNew - subcategoryName:', subcategoryName);

  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      console.log('fetchProviders called with subcategoryId:', subcategoryId);
      console.log('selectedServices:', selectedServices);
      
      if (!subcategoryId && (!selectedServices || selectedServices.length === 0)) {
        console.log('No subcategoryId and no selectedServices - setting empty providers');
        setProviders([]);
        return;
      }

      try {
        console.log('Starting provider fetch...');
        
        let subcategoryIds = [];
        
        // Handle both cases: direct subcategory selection and service selection
        if (subcategoryId) {
          console.log('Using direct subcategoryId:', subcategoryId);
          subcategoryIds = [subcategoryId];
        } else if (selectedServices && selectedServices.length > 0) {
          console.log('Using subcategoryIds from selectedServices');
          subcategoryIds = selectedServices.map((service: any) => service.subcategory_id).filter(Boolean);
        }
        
        console.log('Final subcategoryIds to query:', subcategoryIds);

        
        if (subcategoryIds.length === 0) {
          console.log('No subcategoryIds found - setting empty providers');
          setProviders([]);
          return;
        }
        // Fetch approved provider services for the selected subcategories
        console.log('Querying provider_services with subcategoryIds:', subcategoryIds);
        
        const { data: providerServices, error: servicesError } = await supabase
          .from('provider_services')
          .select(`
            id,
            provider_id,
            subcategory_id,
            service_name,
            price,
            status,
            user_profiles!provider_services_provider_id_fkey (
              id,
              user_id,
              full_name,
              business_name
            )
          `)
          .in('subcategory_id', subcategoryIds)
          .eq('status', 'approved')
          .eq('is_active', true);

        console.log('Provider services query result:', providerServices);
        console.log('Provider services query error:', servicesError);

        if (servicesError) throw servicesError;

        if (!providerServices || providerServices.length === 0) {
          setProviders([]);
          return;
        }

        // Build list of user_ids to fetch provider details
        const userIds = providerServices
          .map((ps: any) => ps.user_profiles?.user_id)
          .filter(Boolean);

        let serviceProvidersMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: serviceProviders, error: providersError } = await supabase
            .from('service_providers')
            .select('user_id, business_name, contact_person, rating, years_of_experience, profile_image_url, status')
            .in('user_id', userIds)
            .eq('status', 'approved');

          if (providersError) throw providersError;
          serviceProvidersMap = Object.fromEntries(
            (serviceProviders || []).map((sp: any) => [sp.user_id, sp])
          );
        }

        // Format data for UI - each provider service is a separate entry
        const formattedProviders: Provider[] = providerServices.map((ps: any) => {
          const userProfile = ps.user_profiles;
          const sp = userProfile?.user_id ? serviceProvidersMap[userProfile.user_id] : null;
          
          console.log('Formatting provider data:', {
            providerService: ps,
            userProfile,
            serviceProvider: sp,
            spBusinessName: sp?.business_name,
            profileBusinessName: userProfile?.business_name,
            fullName: userProfile?.full_name
          });
          
          // Get the actual provider name - prioritize provider name over business name
          let displayName = 'Professional Service Provider'; // Default fallback
          
          if (sp?.contact_person) {
            displayName = sp.contact_person; // Use provider name from service_providers
            console.log('Using service_providers contact_person (provider name):', displayName);
          } else if (userProfile?.full_name) {
            displayName = userProfile.full_name; // Use full name from user profile
            console.log('Using user_profiles full_name as provider name:', displayName);
          } else if (sp?.business_name) {
            displayName = sp.business_name; // Fallback to business name
            console.log('Using service_providers business_name as fallback:', displayName);
          }
          
          console.log('Final selected provider name:', displayName);
          
          return {
            id: ps.provider_id, // Use provider ID (user profile ID) for availability lookup
            business_name: displayName, // Use provider name as business_name for display
            contact_person: sp?.contact_person || userProfile?.full_name || 'Service Provider',
            rating: (sp?.rating ?? ps.rating ?? 4.5),
            years_of_experience: (sp?.years_of_experience ?? 2),
            price: ps.price || 0,
            service_name: ps.service_name || 'Service',
            profile_image_url: sp?.profile_image_url || '/placeholder.svg',
            serviceId: ps.id // Store the service ID separately for cart operations
          };
        });

        setProviders(formattedProviders);
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: "Error",
          description: "Failed to load providers. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchProviders();
  }, [selectedServices, subcategoryId, toast]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleContinue = () => {
    if (!selectedProvider) {
      return;
    }
    
    const provider = providers.find(p => p.id === selectedProvider);
    navigate('/scheduling', { 
      state: { 
        selectedProvider: provider,
        subcategoryId,
        categoryName: subcategoryName,
        basePrice: provider?.price || 0
      } 
    });
  };

  const getTotalPrice = () => {
    const selectedProviderData = providers.find(p => p.id === selectedProvider);
    return selectedProviderData ? selectedProviderData.price : 0;
  };

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
                  Select Service Provider
                </h1>
                <p className="text-muted-foreground">
                  Choose from our verified professionals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Services Summary */}
        <div className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-4">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="text-sm space-y-1">
              <div>SubcategoryId: {subcategoryId || 'Not provided'}</div>
              <div>SubcategoryName: {subcategoryName || 'Not provided'}</div>
              <div>Selected Services: {selectedServices?.length || 0}</div>
              <div>Providers Found: {providers.length}</div>
            </div>
            {selectedServices && selectedServices.length > 0 && (
              <>
                <h3 className="font-semibold mb-2 mt-4">Selected Services:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service: any) => (
                    <Badge key={service.id} variant="secondary">
                      {service.name} - ₹{service.price}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Provider List */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
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
                    <div className="relative">
                      <img
                        src={provider.profile_image_url}
                        alt={provider.business_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      {provider.rating > 4.5 && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="bg-green-500 rounded-full p-1">
                            <Shield className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            {provider.business_name}
                            {provider.rating > 4.5 && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{provider.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Award className="w-4 h-4" />
                              <span className="text-sm">{provider.years_of_experience} years exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">
                            ₹{provider.price}
                          </p>
                          <p className="text-sm text-muted-foreground">for {provider.service_name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="text-sm text-muted-foreground">
                          Contact: {provider.contact_person}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedProvider && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
              <div className="container mx-auto flex items-center justify-center">
                <Button onClick={handleContinue} size="lg" className="px-8">
                  Next: Select Date
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProviderSelectionNew;