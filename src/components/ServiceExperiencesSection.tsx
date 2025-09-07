import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Star, Clock, User } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  category: string;
  rating: number;
  duration: string;
  customerName: string;
  videoThumbnail: string;
  videoUrl: string;
  description: string;
}

const experiences: Experience[] = [
  {
    id: '1',
    title: 'Professional Home Cleaning',
    category: 'Home Services',
    rating: 4.9,
    duration: '2 hours',
    customerName: 'Sarah M.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/cleaning-service.mp4',
    description: 'Watch how our professional cleaners transformed this home with attention to detail and eco-friendly products.'
  },
  {
    id: '2',
    title: 'Expert Electrical Installation',
    category: 'Electrical',
    rating: 5.0,
    duration: '3 hours',
    customerName: 'Mike R.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/electrical-service.mp4',
    description: 'See our certified electrician install smart home switches with precision and safety as top priority.'
  },
  {
    id: '3',
    title: 'Professional Car Wash',
    category: 'Automotive',
    rating: 4.8,
    duration: '1 hour',
    customerName: 'Lisa K.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/car-wash.mp4',
    description: 'Experience our premium car washing service that leaves vehicles spotless inside and out.'
  },
  {
    id: '4',
    title: 'Beauty & Wellness Session',
    category: 'Beauty',
    rating: 4.9,
    duration: '90 minutes',
    customerName: 'Emma J.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/beauty-service.mp4',
    description: 'Relax and rejuvenate with our professional beauty treatments in the comfort of your home.'
  }
];

export const ServiceExperiencesSection: React.FC = () => {
  const [currentVideo, setCurrentVideo] = React.useState<string | null>(null);

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Experiences</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See real customer experiences and the quality of service our professionals deliver. 
            Every service is completed with care, expertise, and attention to detail.
          </p>
        </div>

        {/* Video Modal */}
        {currentVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setCurrentVideo(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
              >
                ✕
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <video
                  controls
                  autoPlay
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh' }}
                >
                  <source src={currentVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}

        {/* Experience Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={experience.videoThumbnail}
                  alt={experience.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Button
                    onClick={() => handlePlayVideo(experience.videoUrl)}
                    size="lg"
                    className="bg-white bg-opacity-90 text-gray-900 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full p-4"
                  >
                    <Play className="h-6 w-6 fill-current" />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    {experience.category}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {experience.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {experience.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{experience.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{experience.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 border-t pt-3">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Customer: {experience.customerName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
            View All Experiences
          </Button>
        </div>
      </div>
    </section>
  );
};