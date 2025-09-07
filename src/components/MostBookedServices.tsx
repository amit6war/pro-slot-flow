import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MostBookedService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  rating: number;
  total_bookings: number;
  duration_minutes: number;
  image_url?: string;
  video_url?: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
  };
  subcategories?: {
    name: string;
  };
}

interface MostBookedServicesProps {
  onServiceSelect: (service: MostBookedService) => void;
}

export const MostBookedServices: React.FC<MostBookedServicesProps> = ({ onServiceSelect }) => {
  const [services, setServices] = useState<MostBookedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostBookedServices = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_services')
          .select(`
            id,
            service_name,
            description,
            price,
            rating,
            total_bookings,
            duration_minutes,
            image_url,
            video_url,
            subcategories:subcategory_id (
              name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .gt('total_bookings', 0)
          .order('total_bookings', { ascending: false })
          .limit(8);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching most booked services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostBookedServices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Most Booked Services</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <Card className="skeleton h-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Most Booked Services</h2>
        <Badge variant="secondary" className="ml-2">
          Trending
        </Badge>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {services.map((service) => (
          <Card
            key={service.id}
            className="flex-shrink-0 w-80 group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={() => onServiceSelect(service)}
          >
            <CardContent className="p-0">
              {/* Service Image/Video */}
              <div className="relative h-40 overflow-hidden rounded-t-lg">
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.service_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl text-primary/30">
                      {service.service_name.charAt(0)}
                    </div>
                  </div>
                )}
                
                {/* Trending Badge */}
                <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  #{services.indexOf(service) + 1}
                </Badge>
                
                {/* Bookings Count */}
                <Badge variant="secondary" className="absolute bottom-2 left-2">
                  {service.total_bookings} bookings
                </Badge>
              </div>

              {/* Service Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {service.service_name}
                  </h3>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(service.price)}
                  </div>
                </div>

                {service.subcategories?.name && (
                  <Badge variant="outline" className="mb-2 text-xs">
                    {service.subcategories.name}
                  </Badge>
                )}

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description || 'Professional service at your doorstep'}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{service.rating || 4.5}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(service.duration_minutes)}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="hover:scale-105 transition-transform">
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};