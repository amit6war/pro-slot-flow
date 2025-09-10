import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, UserCheck, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
}

const HowItWorks: React.FC = () => {
  const { data: howItWorksData, isLoading } = useAdminSettings('how_it_works');

  if (isLoading) {
    return <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="animate-pulse text-center mb-16">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>;
  }

  const getIconComponent = (iconName: string) => {
    const icons = { Search, Calendar, UserCheck, CreditCard, CheckCircle };
    const IconComponent = icons[iconName as keyof typeof icons] || Search;
    return <IconComponent className="h-8 w-8" />;
  };

  const getColorClass = (step: number) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-pink-600', 'text-purple-600', 'text-orange-600'];
    return colors[(step - 1) % colors.length];
  };

  const steps: Step[] = (howItWorksData as any)?.steps?.map((step: any) => ({
    id: step.step,
    icon: getIconComponent(step.icon),
    title: step.title,
    description: step.description,
    details: step.details || [],
    color: getColorClass(step.step)
  })) || [];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {(howItWorksData as any)?.title || 'How It Works'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {(howItWorksData as any)?.subtitle || 'Get professional services in just 5 simple steps. It\'s that easy!'}
          </p>
        </div>

        {/* Desktop Steps Flow */}
        <div className="hidden lg:block mb-16">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 via-orange-200 to-pink-200 z-0"></div>
            
            <div className="grid grid-cols-5 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div key={step.id} className="text-center">
                  {/* Step Circle */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center ${step.color} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number */}
                  <div className="w-8 h-8 mx-auto mb-3 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.id}
                  </div>
                  
                  {/* Step Content */}
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>
                  
                  {/* Step Details */}
                  <ul className="text-xs text-gray-500 space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Steps */}
        <div className="lg:hidden space-y-6 mb-12">
          {steps.map((step, index) => (
            <div key={step.id}>
              <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Icon & Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center ${step.color} mb-2`}>
                        {step.icon}
                      </div>
                      <div className="w-6 h-6 mx-auto bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {step.id}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {step.description}
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join thousands of satisfied customers who trust us for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Book Your First Service
            </Button>
            <Button size="lg" variant="outline">
              Browse All Services
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">5 Min</div>
            <p className="text-gray-600 text-sm">Average Booking Time</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Same Day</div>
            <p className="text-gray-600 text-sm">Service Availability</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">24/7</div>
            <p className="text-gray-600 text-sm">Customer Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">100%</div>
            <p className="text-gray-600 text-sm">Satisfaction Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;