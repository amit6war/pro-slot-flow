import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/HeroSection';
import { CategoryGrid } from '@/components/CategoryGrid';
import { MostBookedServices } from '@/components/MostBookedServices';
import { ServiceExperiencesSection } from '@/components/ServiceExperiencesSection';

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  image_url?: string;
  duration_minutes: number;
  rating: number;
  total_bookings: number;
  provider_id: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
    years_of_experience: number;
    profile_image_url?: string;
    total_reviews: number;
  };
  subcategories?: {
    name: string;
  };
}

interface Provider {
  id: string;
  business_name: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url?: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
}

interface TimeSlot {
  id: number;
  time: string;
  price: number;
  available: boolean;
  date: string;
}

const ModernIndex: React.FC = () => {
  const handleServiceSelect = (service: Service) => {
    // Navigate to provider selection or service details
    console.log('Service selected:', service);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
  };

  const handleExploreServices = () => {
    // Scroll to services section
    console.log('Exploring services');
  };

  return (
    <Layout>
      <HeroSection onExploreServices={handleExploreServices} />
      <CategoryGrid 
        onCategorySelect={handleCategorySelect}
        selectedCategory={null}
      />
      <MostBookedServices onServiceSelect={handleServiceSelect} />
      <ServiceExperiencesSection />
    </Layout>
  );
};

export default ModernIndex;
