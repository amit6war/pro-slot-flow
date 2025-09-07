import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceExperiencesProps {
  className?: string;
}

const ServiceExperiencesSection: React.FC<ServiceExperiencesProps> = ({ className = '' }) => {
  console.log('🎬 ServiceExperiencesSection: Component rendering started');
  console.log('🎬 ServiceExperiencesSection: Received className:', className);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    mounted: false,
    containerExists: false,
    videosLoaded: 0
  });

  console.log('🎬 ServiceExperiencesSection: Current state:', {
    currentIndex,
    isVisible,
    isPlaying,
    debugInfo
  });

  const videoData = [
    {
      id: '1',
      title: 'FACIALS & CLEANUPS',
      description: 'Professional facial treatments and deep cleansing services',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=600&fit=crop&crop=face'
    },
    {
      id: '2',
      title: 'SPA TREATMENTS',
      description: 'Relaxing spa services for complete wellness',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=600&fit=crop&crop=face'
    },
    {
      id: '3',
      title: 'MASSAGE THERAPY',
      description: 'Professional massage services for men and women',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=face'
    },
    {
      id: '4',
      title: 'WAXING SERVICES',
      description: 'Professional waxing with premium products',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=600&fit=crop&crop=face'
    },
    {
      id: '5',
      title: 'HAIR STYLING',
      description: 'Expert hair styling and treatments',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=600&fit=crop&crop=face'
    },
    {
      id: '6',
      title: 'NAIL SERVICES',
      description: 'Professional nail care and nail art',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=600&fit=crop&crop=face'
    }
  ];

  console.log('🎬 ServiceExperiencesSection: Video data loaded:', videoData.length, 'videos');

  const itemsPerView = 3;
  const maxIndex = Math.max(0, videoData.length - itemsPerView);

  console.log('🎬 ServiceExperiencesSection: Carousel config:', {
    itemsPerView,
    maxIndex,
    totalVideos: videoData.length
  });

  useEffect(() => {
    console.log('🎬 ServiceExperiencesSection: useEffect triggered - setting component as visible');
    
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
      setDebugInfo(prev => ({ ...prev, mounted: true }));
      console.log('🎬 ServiceExperiencesSection: Component marked as visible and mounted');
      
      // Check if container exists
      if (containerRef.current) {
        console.log('🎬 ServiceExperiencesSection: Container ref exists:', containerRef.current);
        setDebugInfo(prev => ({ ...prev, containerExists: true }));
      } else {
        console.error('🎬 ServiceExperiencesSection: Container ref is null!');
      }
    }, 100);

    return () => {
      console.log('🎬 ServiceExperiencesSection: Component unmounting');
      clearTimeout(timer);
    };
  }, []);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🎬 ServiceExperiencesSection: isVisible changed to:', isVisible);
  }, [isVisible]);

  useEffect(() => {
    console.log('🎬 ServiceExperiencesSection: currentIndex changed to:', currentIndex);
  }, [currentIndex]);

  const handlePrevious = () => {
    console.log('🎬 ServiceExperiencesSection: Previous button clicked, current index:', currentIndex);
    const newIndex = Math.max(0, currentIndex - 1);
    console.log('🎬 ServiceExperiencesSection: Setting new index to:', newIndex);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    console.log('🎬 ServiceExperiencesSection: Next button clicked, current index:', currentIndex);
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    console.log('🎬 ServiceExperiencesSection: Setting new index to:', newIndex);
    setCurrentIndex(newIndex);
  };

  const toggleVideo = (videoId: string, videoElement: HTMLVideoElement) => {
    console.log('🎬 ServiceExperiencesSection: Toggle video called for:', videoId);
    console.log('🎬 ServiceExperiencesSection: Video element:', videoElement);
    
    const newPlayingState = { ...isPlaying };
    
    // Pause all other videos
    Object.keys(newPlayingState).forEach(id => {
      if (id !== videoId && newPlayingState[id]) {
        const otherVideo = document.getElementById(`video-${id}`) as HTMLVideoElement;
        if (otherVideo) {
          console.log('🎬 ServiceExperiencesSection: Pausing other video:', id);
          otherVideo.pause();
          newPlayingState[id] = false;
        }
      }
    });

    // Toggle current video
    if (newPlayingState[videoId]) {
      console.log('🎬 ServiceExperiencesSection: Pausing video:', videoId);
      videoElement.pause();
      newPlayingState[videoId] = false;
    } else {
      console.log('🎬 ServiceExperiencesSection: Playing video:', videoId);
      videoElement.play().catch(error => {
        console.error('🎬 ServiceExperiencesSection: Error playing video:', videoId, error);
      });
      newPlayingState[videoId] = true;
    }

    setIsPlaying(newPlayingState);
    console.log('🎬 ServiceExperiencesSection: Updated playing state:', newPlayingState);
  };

  // Debug: Log when component is about to render loading state
  if (!isVisible) {
    console.log('🎬 ServiceExperiencesSection: Rendering loading state (isVisible = false)');
    return (
      <section className={`py-16 bg-gray-50 ${className}`} style={{ minHeight: '400px', border: '2px solid red' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
              <p className="text-red-700 font-semibold">DEBUG: Loading State</p>
              <p className="text-red-600 text-sm">Component is not visible yet. Check console for details.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log('🎬 ServiceExperiencesSection: Rendering main component (isVisible = true)');

  return (
    <section className={`py-20 bg-gradient-to-br from-gray-50 to-white ${className}`} style={{ minHeight: '600px', border: '2px solid green' }}>
      <div className="container mx-auto px-4">
        {/* Debug Info Panel */}
        <div className="mb-8 p-4 bg-green-100 border border-green-300 rounded">
          <p className="text-green-700 font-semibold">DEBUG: Component Active</p>
          <p className="text-green-600 text-sm">Mounted: {debugInfo.mounted ? '✅' : '❌'} | Container: {debugInfo.containerExists ? '✅' : '❌'} | Videos: {debugInfo.videosLoaded}/{videoData.length}</p>
          <p className="text-green-600 text-sm">Current Index: {currentIndex} | Max Index: {maxIndex}</p>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
            <Play className="h-4 w-4 mr-2" />
            Video Showcase
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Service <span className="text-blue-600">Experiences</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Watch real demonstrations of our professional services and see the quality that sets us apart
          </p>
        </div>

        {/* Video Carousel */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
              currentIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-600 hover:scale-110'
            }`}
          >
            <ChevronLeft className="w-6 h-6 mx-auto" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
              currentIndex >= maxIndex
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-600 hover:scale-110'
            }`}
          >
            <ChevronRight className="w-6 h-6 mx-auto" />
          </button>

          {/* Video Container */}
          <div className="overflow-hidden rounded-2xl" style={{ border: '2px solid blue' }}>
            <div 
              ref={containerRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {videoData.map((video, index) => {
                console.log('🎬 ServiceExperiencesSection: Rendering video card:', video.id, video.title);
                return (
                  <div
                    key={video.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / itemsPerView}%`, border: '1px solid orange' }}
                  >
                    <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      {/* Video Container */}
                      <div className="relative aspect-[4/5] bg-gray-900">
                        <video
                          id={`video-${video.id}`}
                          className="w-full h-full object-cover"
                          poster={video.thumbnail}
                          muted
                          loop
                          playsInline
                          onLoadedData={() => {
                            console.log(`🎬 ServiceExperiencesSection: Video ${video.id} loaded successfully`);
                            setDebugInfo(prev => ({ ...prev, videosLoaded: prev.videosLoaded + 1 }));
                          }}
                          onError={(e) => {
                            console.error(`🎬 ServiceExperiencesSection: Video ${video.id} error:`, e);
                            console.error(`🎬 ServiceExperiencesSection: Video ${video.id} URL:`, video.videoUrl);
                          }}
                          onLoadStart={() => console.log(`🎬 ServiceExperiencesSection: Video ${video.id} started loading`)}
                          onCanPlay={() => console.log(`🎬 ServiceExperiencesSection: Video ${video.id} can play`)}
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>

                        {/* Play/Pause Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => {
                              console.log(`🎬 ServiceExperiencesSection: Play button clicked for video ${video.id}`);
                              const videoElement = document.getElementById(`video-${video.id}`) as HTMLVideoElement;
                              if (videoElement) {
                                console.log(`🎬 ServiceExperiencesSection: Video element found for ${video.id}`);
                                toggleVideo(video.id, videoElement);
                              } else {
                                console.error(`🎬 ServiceExperiencesSection: Video element not found for ${video.id}`);
                              }
                            }}
                            className="w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                          >
                            {isPlaying[video.id] ? (
                              <Pause className="w-8 h-8 text-gray-800" />
                            ) : (
                              <Play className="w-8 h-8 text-gray-800 ml-1" />
                            )}
                          </button>
                        </div>

                        {/* Video Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                          <h3 className="text-white font-bold text-xl mb-2">
                            {video.title}
                          </h3>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('🎬 ServiceExperiencesSection: Dot indicator clicked, setting index to:', index);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button 
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
            onClick={() => console.log('🎬 ServiceExperiencesSection: Book Service button clicked')}
          >
            <Play className="w-5 h-5 mr-2" />
            Book Your Service Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceExperiencesSection;