
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalProviders },
        { count: totalBookings },
        { count: pendingProviders }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('service_providers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        totalBookings: totalBookings || 0,
        pendingProviders: pendingProviders || 0
      };
    }
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_amount,
          customer_id,
          services (name),
          service_providers (business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Providers',
      value: stats?.totalProviders || 0,
      icon: UserCheck,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingProviders || 0,
      icon: Activity,
      change: '-5%',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to Service NB LINK admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings?.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.services?.name}</p>
                    <p className="text-sm text-gray-600">{booking.service_providers?.business_name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.booking_date} at {booking.booking_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${booking.total_amount}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
              Add New Category
            </button>
            <button className="w-full p-3 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Approve Providers
            </button>
            <button className="w-full p-3 text-left bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              View Reports
            </button>
            <button className="w-full p-3 text-left bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              Manage Settings
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
