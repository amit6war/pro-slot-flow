import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  service_count?: number;
}

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  onCategorySelect, 
  selectedCategory 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Service NB Link style categories with proper icons and subtitles
const serviceNBLinkCategories = [
    {
      id: 'home-cleaning',
      name: 'Home Cleaning',
      icon: '🏠',
      subtitle: 'Deep cleaning & more',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'beauty-wellness',
      name: 'Beauty & Wellness',
      icon: '💄',
      subtitle: 'Salon at home',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-100'
    },
    {
      id: 'appliance-repair',
      name: 'Appliance Repair',
      icon: '🔧',
      subtitle: 'AC, fridge & more',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      id: 'home-repairs',
      name: 'Home Repairs',
      icon: '🛠️',
      subtitle: 'Plumbing, electrical',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      icon: '🐛',
      subtitle: 'Complete solutions',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100'
    },
    {
      id: 'painting-renovation',
      name: 'Painting & Renovation',
      icon: '🎨',
      subtitle: 'Interior & exterior',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    }
  ];

  // Category emoji mapping for database categories
  const categoryEmojis: Record<string, string> = {
    'Cleaning': '🏠',
    'Repairs & Maintenance': '🛠️',
    'Beauty & Wellness': '💄',
    'Appliance Repair': '🔧',
    'Pest Control': '🐛',
    'Painting': '🎨',
    'Plumbing': '🚿',
    'Electrical': '💡',
    'Home Improvement': '🏠',
    'Gardening': '🌱',
    'Moving': '📦',
    'Photography': '📸'
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, icon, image_url')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        // Add service count for each category (mock for now)
        const categoriesWithCount = (data || []).map(category => ({
          ...category,
          service_count: Math.floor(Math.random() * 50) + 10 // Mock count
        }));
        
        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="skeleton h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What are you looking for?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of professional home services
          </p>
        </div>
        
        {/* Service NB Link Style Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {serviceNBLinkCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 ${
                  isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'shadow-md'
                } ${category.bgColor}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">
                    {category.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600">
                    {category.subtitle}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
          >
            Browse all services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>


      </div>
    </section>
  );
};