import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowRight, MapPin, Shield, DollarSign, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreServices }) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  const userLocation = 'New Delhi'; // This would come from user's saved location or geolocation

  const trustIndicators = [
    { icon: Shield, text: 'Verified professionals' },
    { icon: DollarSign, text: 'Transparent pricing' },
    { icon: Award, text: 'Quality guaranteed' },
    { icon: Star, text: 'Safe & secure' }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      <div className="relative px-6 py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Welcome Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Hi {userName}!
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span>Services available in {userLocation}</span>
              </div>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              What can we help you with 
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                today?
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Book trusted professionals for cleaning, repairs, beauty and more. Quality service at your doorstep.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {trustIndicators.map((indicator, index) => {
                const IconComponent = indicator.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{indicator.text}</span>
                  </div>
                );
              })}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={onExploreServices}
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                How it Works
              </Button>
            </div>
          </div>

          {/* Right Content - Service Cards Preview */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Top Row */}
              <Card className="card-floating animate-float hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    🏠
                  </div>
                  <h3 className="font-semibold mb-1">Home Cleaning</h3>
                  <p className="text-sm text-gray-600">Deep cleaning & more</p>
                </CardContent>
              </Card>
              
              <Card className="card-floating animate-float hover:shadow-lg transition-shadow" style={{ animationDelay: '0.5s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                    💄
                  </div>
                  <h3 className="font-semibold mb-1">Beauty & Wellness</h3>
                  <p className="text-sm text-gray-600">Salon at home</p>
                </CardContent>
              </Card>

              {/* Bottom Row */}
              <Card className="card-floating animate-float hover:shadow-lg transition-shadow" style={{ animationDelay: '1s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    🔧
                  </div>
                  <h3 className="font-semibold mb-1">Appliance Repair</h3>
                  <p className="text-sm text-gray-600">AC, fridge & more</p>
                </CardContent>
              </Card>
              
              <Card className="card-floating animate-float hover:shadow-lg transition-shadow" style={{ animationDelay: '1.5s' }}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    👨‍🍳
                  </div>
                  <h3 className="font-semibold mb-1">Personal Chef</h3>
                  <p className="text-sm text-gray-600">Home cooking</p>
                </CardContent>
              </Card>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-400/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};