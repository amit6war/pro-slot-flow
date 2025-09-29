import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ProviderBooking {
  id: string;
  service_name: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_info: any;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  status: string;
  special_instructions: string | null;
  created_at: string;
  currency: string;
  user_id: string | null;
}

export const useProviderBookings = () => {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchBookings = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching bookings for provider:', profile.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings',
          variant: 'destructive',
        });
        return;
      }

      console.log('Provider bookings fetched:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Unexpected error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          booking_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark booking as complete',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'Booking marked as complete',
      });

      // Refresh bookings
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Unexpected error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark booking as complete',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [profile?.id]);

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  };

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  return {
    bookings,
    loading,
    markAsComplete,
    refreshBookings: fetchBookings,
    getStats,
    filterBookings,
  };
};