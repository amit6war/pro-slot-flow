import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, ShoppingCart, Calendar } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { supabase } from '@/integrations/supabase/client';

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

interface ServiceGridProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onServiceSelect: (service: Service) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  selectedCategory,
  selectedSubcategory,
  onServiceSelect
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('provider_services')
          .select(`
            *,
            subcategories!inner(name, category_id),
            user_profiles!provider_services_provider_id_fkey(
              id,
              business_name,
              full_name
            ),
            service_providers(
              rating,
              years_of_experience,
              profile_image_url,
              total_reviews
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true);

        if (selectedSubcategory) {
          query = query.eq('subcategory_id', selectedSubcategory);
        } else if (selectedCategory) {
          query = query.eq('subcategories.category_id', selectedCategory);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const formattedServices: Service[] = data?.map(service => ({
          id: service.id,
          service_name: service.service_name,
          description: service.description,
          price: service.price,
          image_url: service.image_url,
          duration_minutes: service.duration_minutes || 60,
          rating: service.rating || 0,
          total_bookings: service.total_bookings || 0,
          provider_id: service.provider_id,
          provider: service.service_providers?.[0] ? {
            id: service.user_profiles?.id,
            business_name: service.user_profiles?.business_name || service.user_profiles?.full_name,
            rating: service.service_providers[0].rating || 0,
            years_of_experience: service.service_providers[0].years_of_experience || 0,
            profile_image_url: service.service_providers[0].profile_image_url,
            total_reviews: service.service_providers[0].total_reviews || 0
          } : undefined,
          subcategories: service.subcategories
        })) || [];

        setServices(formattedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, selectedSubcategory]);

  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedSubcategory ? 'Services' : selectedCategory ? 'Category Services' : 'All Services'}
            </h1>
            <p className="text-muted-foreground">
              {filteredServices.length} services available
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50">
            <div className="relative overflow-hidden rounded-t-lg">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.service_name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-primary text-4xl font-bold">
                    {service.service_name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              {service.total_bookings > 10 && (
                <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">
                  Popular
                </Badge>
              )}
              
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">
                    {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                    {service.service_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {service.description}
                  </p>
                </div>

                {service.provider && (
                  <div className="flex items-center space-x-2">
                    {service.provider.profile_image_url ? (
                      <img
                        src={service.provider.profile_image_url}
                        alt={service.provider.business_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {service.provider.business_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {service.provider.business_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.provider.years_of_experience}+ years exp
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{service.total_bookings} bookings</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">
                    ₹{service.price}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {service.subcategories?.name}
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 space-y-2">
              <div className="flex space-x-2 w-full">
                <AddToCartButton
                  serviceId={service.id}
                  serviceName={service.service_name}
                  providerId={service.provider_id}
                  providerName={service.provider?.business_name || 'Provider'}
                  price={service.price}
                  serviceDetails={service}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                />
                <Button
                  onClick={() => onServiceSelect(service)}
                  size="sm"
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Book Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No services found
          </h3>
          <p className="text-muted-foreground">
            Try selecting a different category or adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
};