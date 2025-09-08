import React from 'react';
import { Star, Clock, TrendingUp, Sparkles, ArrowRight, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Recommendations = () => {
  const popularServices = [
    {
      id: 1,
      name: 'Deep Home Cleaning',
      category: 'Cleaning',
      rating: 4.8,
      reviews: 2847,
      price: 'Starting at $89',
      image: '/api/placeholder/300/200',
      badge: 'Most Popular',
      badgeColor: 'bg-red-500',
      duration: '2-3 hours',
      description: 'Professional deep cleaning for your entire home'
    },
    {
      id: 2,
      name: 'AC Service & Repair',
      category: 'Appliance',
      rating: 4.9,
      reviews: 1923,
      price: 'Starting at $79',
      image: '/api/placeholder/300/200',
      badge: 'Trending',
      badgeColor: 'bg-orange-500',
      duration: '1-2 hours',
      description: 'Complete AC maintenance and repair service'
    },
    {
      id: 3,
      name: 'Salon at Home - Women',
      category: 'Beauty',
      rating: 4.7,
      reviews: 3156,
      price: 'Starting at $45',
      image: '/api/placeholder/300/200',
      badge: 'Top Rated',
      badgeColor: 'bg-green-500',
      duration: '1-3 hours',
      description: 'Professional beauty services at your doorstep'
    },
    {
      id: 4,
      name: 'Plumbing Services',
      category: 'Repair',
      rating: 4.6,
      reviews: 1654,
      price: 'Starting at $65',
      image: '/api/placeholder/300/200',
      badge: 'Emergency Available',
      badgeColor: 'bg-blue-500',
      duration: '30min - 2 hours',
      description: 'Expert plumbing solutions for all your needs'
    }
  ];

  const newServices = [
    {
      id: 1,
      name: 'Smart Home Setup',
      category: 'Technology',
      price: 'Starting at $120',
      badge: 'New',
      description: 'Complete smart home automation setup',
      isNew: true
    },
    {
      id: 2,
      name: 'Pet Grooming at Home',
      category: 'Pet Care',
      price: 'Starting at $55',
      badge: 'New',
      description: 'Professional pet grooming services',
      isNew: true
    },
    {
      id: 3,
      name: 'Elderly Care Services',
      category: 'Healthcare',
      price: 'Starting at $25/hr',
      badge: 'New',
      description: 'Compassionate care for your loved ones',
      isNew: true
    }
  ];

  const recentlyViewed = [
    {
      id: 1,
      name: 'Massage Therapy',
      category: 'Wellness',
      price: 'Starting at $80',
      viewedAt: '2 hours ago'
    },
    {
      id: 2,
      name: 'Carpet Cleaning',
      category: 'Cleaning',
      price: 'Starting at $95',
      viewedAt: '1 day ago'
    },
    {
      id: 3,
      name: 'Painting Services',
      category: 'Home Improvement',
      price: 'Starting at $150',
      viewedAt: '2 days ago'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Popular Services */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Popular Services
              </h2>
              <p className="text-lg text-gray-600">
                Most loved services by our customers
              </p>
            </div>
            <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <Card key={service.id} className="bg-white border-0 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                    <div className="text-6xl opacity-20">
                      {service.category === 'Cleaning' && '🧹'}
                      {service.category === 'Appliance' && '❄️'}
                      {service.category === 'Beauty' && '💄'}
                      {service.category === 'Repair' && '🔧'}
                    </div>
                  </div>
                  <Badge className={`absolute top-3 left-3 ${service.badgeColor} text-white border-0`}>
                    {service.badge}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 p-2"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-600 font-medium">
                      {service.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {service.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({service.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      {service.price}
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* New Services */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Sparkles className="h-8 w-8 text-yellow-500 mr-3" />
                New Services
              </h2>
              <p className="text-lg text-gray-600">
                Fresh additions to our service catalog
              </p>
            </div>
            <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
              Explore All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newServices.map((service) => (
              <Card key={service.id} className="bg-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-green-500 text-white border-0">
                      {service.badge}
                    </Badge>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      {service.price}
                    </span>
                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                Recently Viewed
              </h2>
              <p className="text-lg text-gray-600">
                Continue where you left off
              </p>
            </div>
            <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
              Clear History
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlyViewed.map((service) => (
              <Card key={service.id} className="bg-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {service.category} • Viewed {service.viewedAt}
                      </p>
                      <span className="font-medium text-gray-900">
                        {service.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                      Book Now
                    </Button>
                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recommendations;