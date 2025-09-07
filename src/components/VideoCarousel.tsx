import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VideoCategory {
  id: string;
  title: string;
  subtitle?: string;
  videoThumbnail: string;
  videoUrl: string;
  category: string;
}

const videoCategories: VideoCategory[] = [
  {
    id: '1',
    title: 'FACIALS &',
    subtitle: 'CLEANUPS',
    videoThumbnail: '/lovable-uploads/ecaa6d37-10a5-43d6-b2c8-3c0712032d51.png',
    videoUrl: '/videos/facials-cleanups.mp4',
    category: 'beauty'
  },
  {
    id: '2',
    title: 'SPA',
    subtitle: 'for WOMEN',
    videoThumbnail: '/api/placeholder/600/400',
    videoUrl: '/videos/spa-women.mp4',
    category: 'spa'
  },
  {
    id: '3',
    title: 'MASSAGE',
    subtitle: 'FOR MEN',
    videoThumbnail: '/api/placeholder/600/400', 
    videoUrl: '/videos/massage-men.mp4',
    category: 'massage'
  },
  {
    id: '4',
    title: 'Roll-on',
    subtitle: 'waxing',
    videoThumbnail: '/api/placeholder/600/400',
    videoUrl: '/videos/roll-on-waxing.mp4',
    category: 'waxing'
  }
];

export const VideoCarousel: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/services/${category}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            of our finest experiences
          </p>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Premium Service Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our curated collection of professional services, each delivered with 
            exceptional quality and attention to detail.
          </p>
        </div>

        {/* Video Modal */}
        {currentVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setCurrentVideo(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
              <div className="bg-black rounded-xl overflow-hidden">
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

        {/* Video Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {videoCategories.map((category) => (
                <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div 
                    className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10"
                    onClick={() => handleCategoryClick(category.category)}
                  >
                    <img
                      src={category.videoThumbnail}
                      alt={`${category.title} ${category.subtitle || ''}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVideo(category.videoUrl);
                        }}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110 border border-white/30"
                      >
                        <Play className="h-8 w-8 text-white fill-white" />
                      </button>
                    </div>
                    
                    {/* Text Content */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">
                        {category.title}
                      </h3>
                      {category.subtitle && (
                        <p className="text-white/90 font-bold text-2xl md:text-3xl leading-tight">
                          {category.subtitle}
                        </p>
                      )}
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="hidden md:flex -left-6 bg-white/90 hover:bg-white border-0 shadow-lg h-12 w-12" />
            <CarouselNext className="hidden md:flex -right-6 bg-white/90 hover:bg-white border-0 shadow-lg h-12 w-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};