import React from 'react';
import { RotateCcw, Zap, Calendar, HelpCircle, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const QuickActions = () => {
  const quickActions = [
    {
      id: 'book-again',
      title: 'Book Again',
      subtitle: 'Repeat your last service',
      icon: RotateCcw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      action: () => console.log('Book Again clicked')
    },
    {
      id: 'emergency',
      title: 'Emergency Services',
      subtitle: 'Urgent repairs & fixes',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      badge: 'Available 24/7',
      action: () => console.log('Emergency Services clicked')
    },
    {
      id: 'scheduled',
      title: 'Scheduled Services',
      subtitle: 'Plan your services ahead',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      action: () => console.log('Scheduled Services clicked')
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Get instant assistance',
      icon: HelpCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      action: () => console.log('Help & Support clicked')
    }
  ];



  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access your most-used services and get help when you need it
          </p>
        </div>

        {/* Main Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            
            return (
              <Card
                key={action.id}
                className={`${action.bgColor} border-0 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group`}
                onClick={action.action}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${action.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${action.color}`} />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {action.subtitle}
                  </p>
                  
                  {action.badge && (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      {action.badge}
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>



        {/* Recent Activity (if user is logged in) */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Activity
            </h3>
            <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Home Cleaning</h4>
                  <p className="text-sm text-gray-500">Completed 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Book Again
              </Button>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AC Repair</h4>
                  <p className="text-sm text-gray-500">Rated 5 stars</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Book Again
              </Button>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Plumbing</h4>
                  <p className="text-sm text-gray-500">Scheduled for tomorrow</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;