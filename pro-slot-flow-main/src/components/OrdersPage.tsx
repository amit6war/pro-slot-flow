
import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, Star, MapPin, Phone, MessageSquare } from 'lucide-react';

interface OrdersPageProps {
  onBack: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const orders = [
    {
      id: 'SNL001',
      provider: 'Atlantic Home Services',
      service: 'Plumbing Repair',
      date: 'Today',
      time: '2:00 PM',
      status: 'confirmed',
      price: 110,
      address: '123 Main St, Moncton, NB',
      providerPhone: '(506) 555-0123'
    },
    {
      id: 'SNL002',
      provider: "Emma's Premium Cleaning",
      service: 'House Cleaning',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'confirmed',
      price: 85,
      address: '123 Main St, Moncton, NB',
      providerPhone: '(506) 555-0125'
    },
    {
      id: 'SNL003',
      provider: "Mike's Electric Pro",
      service: 'Electrical Inspection',
      date: 'Dec 15, 2024',
      time: '9:00 AM',
      status: 'completed',
      price: 159,
      address: '123 Main St, Moncton, NB',
      providerPhone: '(506) 555-0124',
      rating: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-info/10 text-info border-info/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'upcoming') return order.status === 'confirmed';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

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
              <h1 className="text-h3 text-text-primary">My Orders</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto container-padding py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-surface rounded-2xl p-1">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Orders' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-small font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-text-muted" />
              </div>
              <h3 className="text-h4 text-text-primary mb-2">No orders found</h3>
              <p className="text-body text-text-secondary">
                {activeTab === 'upcoming' ? "You don't have any upcoming bookings." : "You haven't completed any services yet."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <div 
                key={order.id}
                className={`bg-gradient-to-br from-surface to-background border border-border/50 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-h4 text-text-primary">{order.service}</h3>
                        <p className="text-body text-text-secondary">{order.provider}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xsmall font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-small">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-text-primary">{order.date} at {order.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-text-primary">{order.address}</span>
                      </div>
                    </div>

                    {order.status === 'completed' && order.rating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-small text-text-secondary">Your rating:</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < order.rating ? 'fill-warning text-warning' : 'text-text-muted'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-right">
                      <div className="text-h4 text-text-primary font-bold">${order.price}</div>
                      <div className="text-small text-text-muted">Order #{order.id}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.status === 'confirmed' && (
                        <>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors">
                            <Phone className="h-4 w-4" />
                            <span className="text-small">Call Provider</span>
                          </button>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-surface text-text-primary border border-border rounded-xl hover:bg-background transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-small">Reschedule</span>
                          </button>
                        </>
                      )}
                      
                      {order.status === 'completed' && (
                        <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors">
                          <span className="text-small">Book Again</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
