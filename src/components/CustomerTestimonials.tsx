import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  review: string;
  date: string;
  avatar?: string;
}

const CustomerTestimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Downtown",
      service: "Home Cleaning",
      rating: 5,
      review: "Absolutely fantastic service! The team was professional, thorough, and left my home spotless. I'll definitely book again.",
      date: "2 days ago",
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Westside",
      service: "AC Repair",
      rating: 5,
      review: "Quick response and excellent work. Fixed my AC in no time and explained everything clearly. Highly recommended!",
      date: "1 week ago",
      avatar: "MC"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Eastside",
      service: "Beauty & Wellness",
      rating: 5,
      review: "Amazing spa experience at home! The therapist was skilled and professional. Felt completely relaxed and rejuvenated.",
      date: "3 days ago",
      avatar: "ER"
    },
    {
      id: 4,
      name: "David Thompson",
      location: "Northside",
      service: "Plumbing",
      rating: 4,
      review: "Great service and fair pricing. The plumber arrived on time and solved the issue efficiently. Very satisfied!",
      date: "5 days ago",
      avatar: "DT"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Quote className="h-4 w-4 mr-2" />
            Customer Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from thousands of satisfied customers across the city
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 line-clamp-4 text-sm leading-relaxed">
                  "{testimonial.review}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {testimonial.service}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
            <p className="text-gray-600 text-sm">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">4.8</div>
            <p className="text-gray-600 text-sm">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <p className="text-gray-600 text-sm">Satisfaction Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600 text-sm">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;