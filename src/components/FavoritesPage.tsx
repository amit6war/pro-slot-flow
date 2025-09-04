
import React from 'react';
import { ChevronLeft, Heart, Star, MapPin, Calendar, Shield } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  verified: boolean;
  services: string[];
  distance: string;
  description: string;
}

interface FavoritesPageProps {
  onBack: () => void;
  favorites: Set<number>;
  providers: Provider[];
  onProviderSelect: (provider: Provider) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onBack,
  favorites,
  providers,
  onProviderSelect
}) => {
  const favoriteProviders = providers.filter(provider => favorites.has(provider.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-surface/50 transition-all duration-200"
              >
                <ChevronLeft className="h-6 w-6 text-text-primary" />
              </button>
              <h1 className="text-h3 text-text-primary">Favorites</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto container-padding py-8">
        {favoriteProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-text-muted" />
            </div>
            <h3 className="text-h4 text-text-primary mb-2">No favorites yet</h3>
            <p className="text-body text-text-secondary mb-6">
              Save providers you love by tapping the heart icon when browsing services.
            </p>
            <button 
              onClick={onBack}
              className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-6 py-3 rounded-2xl font-semibold"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <p className="text-body text-text-secondary">{favoriteProviders.length} favorite providers</p>
            </div>

            <div className="grid gap-6">
              {favoriteProviders.map((provider, index) => (
                <div 
                  key={provider.id}
                  className={`bg-gradient-to-br from-surface to-background border border-border/50 p-6 rounded-3xl hover:shadow-lg transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-6 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
                          {provider.name.charAt(0)}
                        </div>
                        {provider.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                          <Heart className="h-3 w-3 text-white fill-current" />
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3 className="text-h4 text-text-primary">{provider.name}</h3>
                          {provider.verified && (
                            <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-xsmall font-semibold w-fit">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-body text-text-secondary">{provider.description}</p>
                        <div className="flex flex-wrap items-center gap-6 text-small text-text-muted">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-bold text-text-primary">{provider.rating}</span>
                            <span>({provider.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{provider.distance} away</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {provider.services.map((service) => (
                            <span key={service} className="bg-info/10 text-info border border-info/20 px-3 py-1 rounded-full text-xsmall font-medium">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-h4 text-text-primary font-bold">${provider.price}</span>
                          {provider.originalPrice && (
                            <span className="text-body text-text-muted line-through">${provider.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => onProviderSelect(provider)}
                        className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-6 py-2 rounded-2xl flex items-center space-x-2 font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
