import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Category emoji mapping
  const categoryEmojis: Record<string, string> = {
    'Cleaning': '🧹',
    'Repairs & Maintenance': '🔧',
    'Beauty & Wellness': '💄',
    'Appliance Repair': '🔌',
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
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Popular Categories</h2>
        <button className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm font-medium">
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categories.slice(0, 12).map((category) => {
          const isSelected = selectedCategory === category.id;
          const emoji = categoryEmojis[category.name] || category.icon || '🔧';
          
          return (
            <Card
              key={category.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-12 h-12 mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 mx-auto flex items-center justify-center">
                      {emoji}
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {category.name}
                </h3>
                
                <Badge variant="secondary" className="text-xs">
                  {category.service_count}+ services
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};