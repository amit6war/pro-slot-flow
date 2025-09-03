
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Star
} from 'lucide-react';

export default function Orders() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your orders</h2>
          <p className="text-gray-600 mb-6">Track your bookings and manage your service history</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Mock orders data
  const orders = [
    {
      id: 1,
      serviceName: 'Home Cleaning',
      providerName: 'CleanPro Services',
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 75,
      address: '123 Main St, Moncton, NB',
      rating: null
    },
    {
      id: 2,
      serviceName: 'Hair Cut & Styling',
      providerName: 'Style Studio',
      date: '2024-01-18',
      time: '2:00 PM',
      status: 'completed',
      amount: 45,
      address: 'Salon Location',
      rating: 5
    },
    {
      id: 3,
      serviceName: 'AC Repair',
      providerName: 'CoolTech Services',
      date: '2024-01-15',
      time: '11:00 AM',
      status: 'cancelled',
      amount: 120,
      address: '456 Oak Ave, Moncton, NB',
      rating: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your service bookings</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{order.serviceName}</h3>
                    <p className="text-gray-600">{order.providerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-lg font-bold text-gray-900 mt-1">${order.amount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{order.date} at {order.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{order.address}</span>
                </div>
                {order.rating && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>Rated {order.rating}/5</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {order.status === 'confirmed' && (
                  <>
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Cancel
                    </Button>
                  </>
                )}
                {order.status === 'completed' && !order.rating && (
                  <Button variant="outline" size="sm">Rate Service</Button>
                )}
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start booking services to see your orders here</p>
          <Button onClick={() => window.location.href = '/'}>
            Browse Services
          </Button>
        </div>
      )}
    </div>
  );
}
