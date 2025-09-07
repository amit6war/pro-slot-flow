import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  rating: number;
  image_url?: string;
  category: string;
}

const mockServices: Record<string, Service[]> = {
  beauty: [
    {
      id: 'facial-1',
      name: 'Hydrating Facial',
      description: 'Deep cleansing and moisturizing facial treatment',
      price: 1500,
      duration: 60,
      rating: 4.8,
      image_url: '/api/placeholder/300/200',
      category: 'beauty'
    },
    {
      id: 'facial-2', 
      name: 'Anti-Aging Facial',
      description: 'Advanced anti-aging treatment with premium products',
      price: 2500,
      duration: 90,
      rating: 4.9,
      image_url: '/api/placeholder/300/200',
      category: 'beauty'
    },
    {
      id: 'cleanup-1',
      name: 'Deep Cleanup',
      description: 'Professional deep cleaning and extraction',
      price: 1200,
      duration: 45,
      rating: 4.7,
      image_url: '/api/placeholder/300/200',
      category: 'beauty'
    }
  ],
  spa: [
    {
      id: 'spa-1',
      name: 'Relaxation Spa Package',
      description: 'Full body massage and aromatherapy session',
      price: 3500,
      duration: 120,
      rating: 4.9,
      image_url: '/api/placeholder/300/200',
      category: 'spa'
    },
    {
      id: 'spa-2',
      name: 'Detox Spa Treatment',
      description: 'Detoxifying body wrap and massage',
      price: 4000,
      duration: 150,
      rating: 4.8,
      image_url: '/api/placeholder/300/200',
      category: 'spa'
    }
  ],
  massage: [
    {
      id: 'massage-1',
      name: 'Deep Tissue Massage',
      description: 'Therapeutic deep tissue massage for men',
      price: 2000,
      duration: 60,
      rating: 4.8,
      image_url: '/api/placeholder/300/200',
      category: 'massage'
    },
    {
      id: 'massage-2',
      name: 'Sports Massage',
      description: 'Professional sports massage and recovery',
      price: 2500,
      duration: 75,
      rating: 4.9,
      image_url: '/api/placeholder/300/200',
      category: 'massage'
    }
  ],
  waxing: [
    {
      id: 'wax-1',
      name: 'Full Body Waxing',
      description: 'Complete body waxing with roll-on technique',
      price: 1800,
      duration: 90,
      rating: 4.7,
      image_url: '/api/placeholder/300/200',
      category: 'waxing'
    },
    {
      id: 'wax-2',
      name: 'Facial Waxing',
      description: 'Gentle facial hair removal',
      price: 800,
      duration: 30,
      rating: 4.8,
      image_url: '/api/placeholder/300/200',
      category: 'waxing'
    }
  ]
};

const ServiceCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (category && mockServices[category]) {
      setServices(mockServices[category]);
    } else {
      setServices([]);
    }
  }, [category]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }
    
    const selectedServiceData = services.filter(s => selectedServices.includes(s.id));
    navigate('/provider-selection', { 
      state: { 
        selectedServices: selectedServiceData,
        category 
      } 
    });
  };

  const categoryTitles: Record<string, string> = {
    beauty: 'Facials & Cleanups',
    spa: 'Spa for Women', 
    massage: 'Massage for Men',
    waxing: 'Roll-on Waxing'
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
                  {category ? categoryTitles[category] || 'Services' : 'Services'}
                </h1>
                <p className="text-muted-foreground">
                  Select the services you'd like to book
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 py-8">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No services found for this category.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-4"
                variant="outline"
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedServices.includes(service.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedServices.includes(service.id) && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground">
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{service.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{service.duration} min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          ₹{service.price}
                        </span>
                        <Button
                          size="sm"
                          variant={selectedServices.includes(service.id) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceToggle(service.id);
                          }}
                        >
                          {selectedServices.includes(service.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Button */}
              {selectedServices.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
                  <div className="container mx-auto flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="font-semibold">
                        Total: ₹{services
                          .filter(s => selectedServices.includes(s.id))
                          .reduce((sum, s) => sum + s.price, 0)
                        }
                      </p>
                    </div>
                    <Button onClick={handleNext} size="lg" className="px-8">
                      Next: Choose Provider
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServiceCategory;