import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useProviderAvailability } from '@/hooks/useProviderAvailability';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
  held: boolean;
}

export const ProviderSlotBooking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const { getAvailableSlots, getProviderAvailability } = useProviderAvailability();

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  useEffect(() => {
    if (profile?.id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, profile?.id]);

  const fetchAvailableSlots = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const slots = await getAvailableSlots(profile.id, dateString);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available slots',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const existingSlot = availableSlots.find(s => s.slot_time === timeString);
        
        slots.push({
          time: timeString,
          available: !existingSlot || existingSlot.status === 'available',
          booked: existingSlot?.status === 'booked',
          held: existingSlot?.status === 'held'
        });
      }
    }
    return slots;
  };

  const handleSlotToggle = async (timeSlot: string) => {
    // This would integrate with your slot creation/blocking logic
    toast({
      title: 'Feature Coming Soon',
      description: 'Slot management will be available soon',
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Availability</h2>
          <p className="text-gray-600 mt-1">Set your available time slots for bookings</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <Button 
          variant="outline" 
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          Previous Week
        </Button>
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h3>
        <Button 
          variant="outline" 
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          Next Week
        </Button>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <Card 
            key={day.toISOString()} 
            className={`cursor-pointer transition-colors ${
              isSameDay(day, selectedDate) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedDate(day)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">
                {format(day, 'EEE')}
              </div>
              <div className="text-lg font-semibold">
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {format(day, 'MMM')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Date Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Available Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading slots...</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.booked ? "secondary" : slot.available ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleSlotToggle(slot.time)}
                  className={`
                    ${slot.booked ? 'bg-red-100 text-red-800 cursor-not-allowed' : ''}
                    ${slot.held ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${slot.available ? 'bg-green-100 text-green-800' : ''}
                  `}
                  disabled={slot.booked}
                >
                  <div className="flex flex-col items-center">
                    <Clock className="h-3 w-3 mb-1" />
                    <span className="text-xs">{slot.time}</span>
                    {slot.booked && <CheckCircle className="h-3 w-3 mt-1" />}
                    {slot.held && <AlertCircle className="h-3 w-3 mt-1" />}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Held (7 min)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={fetchAvailableSlots}>
              Refresh Slots
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Availability Block
            </Button>
            <Button variant="outline">
              Set Weekly Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};