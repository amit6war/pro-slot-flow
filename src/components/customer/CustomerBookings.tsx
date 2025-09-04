
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, Filter, Search, Plus, Download, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const CustomerBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const bookings = [
    {
      id: 1,
      service: 'Premium Plumbing Repair',
      provider: 'John Smith',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'Completed',
      amount: '$85',
      address: '123 Main St, Moncton, NB',
      rating: 5,
      category: 'Home Maintenance'
    },
    {
      id: 2,
      service: 'Deep House Cleaning',
      provider: 'Maria Garcia',
      date: '2025-01-18',
      time: '2:00 PM',
      status: 'Confirmed',
      amount: '$120',
      address: '456 Oak Ave, Moncton, NB',
      category: 'Cleaning'
    },
    {
      id: 3,
      service: 'Electrical Installation',
      provider: 'Mike Johnson',
      date: '2025-01-12',
      time: '9:00 AM',
      status: 'Cancelled',
      amount: '$150',
      address: '789 Pine St, Moncton, NB',
      category: 'Electrical'
    },
    {
      id: 4,
      service: 'Garden Landscaping',
      provider: 'Green Thumb Co.',
      date: '2025-01-22',
      time: '8:00 AM',
      status: 'Pending',
      amount: '$200',
      address: '321 Elm St, Moncton, NB',
      category: 'Landscaping'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return '✓';
      case 'Confirmed':
        return '●';
      case 'Pending':
        return '○';
      case 'Cancelled':
        return '✕';
      default:
        return '○';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: bookings.length,
    Pending: bookings.filter(b => b.status === 'Pending').length,
    Confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
    Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage your service appointments and track their progress
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Book New Service
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings or providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`${
                    statusFilter === status 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status} ({count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {booking.service}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            with {booking.provider}
                          </p>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-2">
                            {booking.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.address}
                        </div>
                      </div>

                      {booking.rating && (
                        <div className="flex items-center mt-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            Rated {booking.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <Badge className={`${getStatusColor(booking.status)} border font-medium px-3 py-1`}>
                      <span className="mr-1">{getStatusIcon(booking.status)}</span>
                      {booking.status}
                    </Badge>
                    <p className="text-2xl font-bold text-gray-900">
                      {booking.amount}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'Confirmed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'Completed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Plus className="h-4 w-4 mr-1" />
                            Book Again
                          </Button>
                        </>
                      )}
                      {booking.status === 'Pending' && (
                        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                          <Clock className="h-4 w-4 mr-1" />
                          Awaiting Confirmation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start exploring our services to make your first booking.'
                }
              </p>
              {searchTerm || statusFilter !== 'All' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Browse Services
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
