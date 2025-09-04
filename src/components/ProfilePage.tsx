
import React, { useState } from 'react';
import { ChevronLeft, User, Settings, Bell, CreditCard, MapPin, Phone, Mail, Edit2, Shield, Award, Clock } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(506) 555-0199",
    address: "123 Main Street, Moncton, NB E1C 1A1",
    memberSince: "January 2024",
    totalBookings: 12,
    savedMoney: 240,
    favoriteProviders: 5
  };

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
              <h1 className="text-h3 text-text-primary">Profile</h1>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span className="text-small">Edit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto container-padding py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-surface to-background border border-border/50 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-h3 text-text-primary mb-2">{userProfile.name}</h2>
                <p className="text-body text-text-secondary mb-4">Member since {userProfile.memberSince}</p>
                <div className="flex flex-wrap gap-4 text-small">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-text-primary">{userProfile.totalBookings} bookings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">$</span>
                    <span className="text-text-primary">${userProfile.savedMoney} saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-surface to-background border border-border/50 rounded-2xl p-6 text-center">
              <div className="text-h3 text-primary font-bold">{userProfile.totalBookings}</div>
              <div className="text-small text-text-muted">Total Bookings</div>
            </div>
            <div className="bg-gradient-to-br from-surface to-background border border-border/50 rounded-2xl p-6 text-center">
              <div className="text-h3 text-primary font-bold">${userProfile.savedMoney}</div>
              <div className="text-small text-text-muted">Money Saved</div>
            </div>
            <div className="bg-gradient-to-br from-surface to-background border border-border/50 rounded-2xl p-6 text-center">
              <div className="text-h3 text-primary font-bold">{userProfile.favoriteProviders}</div>
              <div className="text-small text-text-muted">Favorite Providers</div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gradient-to-br from-surface to-background border border-border/50 rounded-3xl p-8">
            <h3 className="text-h4 text-text-primary mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-small font-medium text-text-primary mb-2">Full Name</label>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary" />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={userProfile.name}
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  ) : (
                    <span className="text-body text-text-primary">{userProfile.name}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-small font-medium text-text-primary mb-2">Email</label>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={userProfile.email}
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  ) : (
                    <span className="text-body text-text-primary">{userProfile.email}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-small font-medium text-text-primary mb-2">Phone</label>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  {isEditing ? (
                    <input 
                      type="tel" 
                      value={userProfile.phone}
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  ) : (
                    <span className="text-body text-text-primary">{userProfile.phone}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-small font-medium text-text-primary mb-2">Address</label>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  {isEditing ? (
                    <textarea 
                      value={userProfile.address}
                      rows={2}
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                    />
                  ) : (
                    <span className="text-body text-text-primary">{userProfile.address}</span>
                  )}
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-surface text-text-primary border border-border rounded-xl hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl font-semibold"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Settings & Actions */}
          <div className="space-y-4">
            <h3 className="text-h4 text-text-primary">Settings & Preferences</h3>
            
            {[
              { icon: Bell, label: 'Notifications', description: 'Manage your notification preferences' },
              { icon: CreditCard, label: 'Payment Methods', description: 'Manage saved payment methods' },
              { icon: Settings, label: 'Account Settings', description: 'Security and privacy settings' },
              { icon: Clock, label: 'Booking History', description: 'View all your past bookings' }
            ].map((item, index) => (
              <button
                key={item.label}
                className={`w-full bg-gradient-to-br from-surface to-background border border-border/50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 text-left animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-body font-semibold text-text-primary">{item.label}</h4>
                    <p className="text-small text-text-secondary">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div className="pt-8">
            <button className="w-full bg-error/10 text-error border border-error/20 p-4 rounded-2xl font-semibold hover:bg-error/20 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
