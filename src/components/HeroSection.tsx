import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreServices }) => {
  const features = [
    { icon: Users, label: '50K+', subtitle: 'Happy Customers' },
    { icon: Star, label: '4.8', subtitle: 'Average Rating' },
    { icon: Clock, label: '30min', subtitle: 'Avg Response Time' }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233366FF' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      <div className="relative px-6 py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              ✨ Home Services Made Simple
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Home services at your{' '}
              <span className="gradient-text">doorstep</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Book trusted professionals for home cleaning, repairs, beauty and more. 
              Verified experts, transparent pricing, hassle-free booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 h-auto group"
                onClick={onExploreServices}
              >
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                How it Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center gap-1 mb-1">
                    <feature.icon className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">
                      {feature.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Service Cards Preview */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Top Row */}
              <Card className="card-floating animate-float">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    🏠
                  </div>
                  <h3 className="font-semibold mb-1">Home Cleaning</h3>
                  <p className="text-sm text-gray-600">From $30</p>
                </CardContent>
              </Card>
              
              <Card className="card-floating animate-float" style={{ animationDelay: '0.5s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    🔧
                  </div>
                  <h3 className="font-semibold mb-1">Repairs</h3>
                  <p className="text-sm text-gray-600">From $50</p>
                </CardContent>
              </Card>

              {/* Bottom Row */}
              <Card className="card-floating animate-float" style={{ animationDelay: '1s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    💄
                  </div>
                  <h3 className="font-semibold mb-1">Beauty</h3>
                  <p className="text-sm text-gray-600">From $25</p>
                </CardContent>
              </Card>
              
              <Card className="card-floating animate-float" style={{ animationDelay: '1.5s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                    🍳
                  </div>
                  <h3 className="font-semibold mb-1">Chef</h3>
                  <p className="text-sm text-gray-600">From $40</p>
                </CardContent>
              </Card>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};