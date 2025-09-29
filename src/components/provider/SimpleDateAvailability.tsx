import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isBefore, startOfToday } from 'date-fns';

interface DateAvailability {
  [date: string]: boolean;
}

export const SimpleDateAvailability = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<DateAvailability>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Load existing availability when component mounts
  useEffect(() => {
    if (profile?.id) {
      loadAvailability();
    }
  }, [profile?.id]); // Removed currentMonth dependency to prevent unnecessary reloads

  const loadAvailability = async () => {
    if (!profile?.id) return;

    try {
      // Load all confirmed availability records for this provider (not just current month)
      const { data, error } = await supabase
        .from('provider_weekly_availability')
        .select('*')
        .eq('provider_id', profile.id)
        .eq('is_confirmed', true);

      if (error) throw error;

      const loadedAvailability: DateAvailability = {};
      data?.forEach(record => {
        if (record.availability_data && typeof record.availability_data === 'object') {
          const availData = record.availability_data as Record<string, any>;
          Object.keys(availData).forEach(date => {
            const dateAvail = availData[date];
            if (dateAvail?.is_available) {
              loadedAvailability[date] = true;
            }
          });
        }
      });

      console.log('📅 Loaded availability data:', loadedAvailability);
      setAvailability(loadedAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const toggleDateAvailability = async (date: Date) => {
    if (!profile?.id) return;
    if (isBefore(date, startOfToday())) return; // Can't modify past dates

    const dateString = format(date, 'yyyy-MM-dd');
    const isCurrentlyAvailable = availability[dateString] || false;
    const newAvailability = !isCurrentlyAvailable; // Toggle the current state

    setIsLoading(true);
    try {
      // Calculate week boundaries
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
      const weekStartString = format(weekStart, 'yyyy-MM-dd');
      const weekEndString = format(weekEnd, 'yyyy-MM-dd');

      if (newAvailability) {
        // Check if record exists for this week
        const { data: existingRecord } = await supabase
          .from('provider_weekly_availability')
          .select('*')
          .eq('provider_id', profile.id)
          .eq('week_start', weekStartString)
          .maybeSingle();

        let availabilityData = {};
        if (existingRecord?.availability_data) {
          availabilityData = { ...(existingRecord.availability_data as Record<string, any>) };
        }

        // Add this date to the availability data
        availabilityData[dateString] = {
          day_of_week: date.getDay(),
          start_time: '09:00',
          end_time: '17:30',
          is_available: true
        };

        // Upsert the record with proper conflict resolution
        const { error } = await supabase
          .from('provider_weekly_availability')
          .upsert({
            provider_id: profile.id,
            week_start: weekStartString,
            week_end: weekEndString,
            availability_data: availabilityData,
            is_confirmed: true
          }, {
            onConflict: 'provider_id,week_start'
          });

        if (error) throw error;

        // Generate slots using the RPC function
        console.log('📅 Calling generate_standardized_provider_slots for:', profile.id, dateString);
        const { error: rpcError } = await supabase.rpc('generate_standardized_provider_slots', {
          p_provider_id: profile.id,
          p_date: dateString,
          p_base_price: 120 // Default base price
        });
        
        console.log('📅 RPC function result:', { rpcError });

        if (rpcError) {
          console.error('Error generating slots:', rpcError);
          // Don't throw error for RPC failure, availability is still set
        }
      } else {
        // Make date unavailable - remove from availability data
        const { data: existingRecord } = await supabase
          .from('provider_weekly_availability')
          .select('*')
          .eq('provider_id', profile.id)
          .eq('week_start', weekStartString)
          .maybeSingle();

        if (existingRecord?.availability_data && typeof existingRecord.availability_data === 'object') {
          const updatedData = { ...(existingRecord.availability_data as Record<string, any>) };
          delete updatedData[dateString];

          if (Object.keys(updatedData).length === 0) {
            // Delete the entire record if no dates remain
            await supabase
              .from('provider_weekly_availability')
              .delete()
              .eq('id', existingRecord.id);
          } else {
            // Update with remaining dates
            await supabase
              .from('provider_weekly_availability')
              .update({ availability_data: updatedData })
              .eq('id', existingRecord.id);
          }
        }

        // Remove all slots for this date
        await supabase
          .from('booking_slots')
          .delete()
          .eq('provider_id', profile.id)
          .eq('slot_date', dateString)
          .eq('status', 'available');
      }

      // Update local state
      setAvailability(prev => ({
        ...prev,
        [dateString]: newAvailability
      }));

      toast({
        title: 'Success',
        description: `Date marked as ${newAvailability ? 'available' : 'unavailable'}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: `Failed to update availability: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const calendarDays = generateCalendarGrid();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Set Your Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click dates to toggle availability. Available dates will show all slots from 9:00 AM to 5:30 PM to customers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{monthName}</h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dateString = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isPastDate = isBefore(day, startOfToday());
            const isAvailable = availability[dateString] || false;
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isPastDate) {
                    setSelectedDate(day);
                    toggleDateAvailability(day);
                  }
                }}
                disabled={isPastDate || isLoading}
                className={`
                  relative p-2 text-sm rounded-lg transition-all duration-200
                  ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${isPastDate ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent'}
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateString ? 'ring-2 ring-blue-500' : ''}
                  ${isAvailable 
                    ? 'bg-success/20 text-success-foreground border-2 border-success' 
                    : 'bg-background border border-border hover:border-primary/50'
                  }
                `}
              >
                <span className="relative z-10">{day.getDate()}</span>
                
                {/* Status indicator */}
                {isAvailable && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                )}
                
                {!isAvailable && isCurrentMonth && !isPastDate && (
                  <div className="absolute top-1 right-1">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Availability Control Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (selectedDate && !isBefore(selectedDate, startOfToday())) {
                const dateString = format(selectedDate, 'yyyy-MM-dd');
                if (!availability[dateString]) {
                  toggleDateAvailability(selectedDate);
                }
              } else {
                toast({
                  title: 'Select a Date',
                  description: 'Please select a future date first',
                  variant: 'destructive'
                });
              }
            }}
            disabled={isLoading || !selectedDate || (selectedDate && availability[format(selectedDate, 'yyyy-MM-dd')])}
            className="flex items-center gap-2 border-success/50 text-success hover:bg-success/10 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Mark Available
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (selectedDate && !isBefore(selectedDate, startOfToday())) {
                const dateString = format(selectedDate, 'yyyy-MM-dd');
                if (availability[dateString]) {
                  toggleDateAvailability(selectedDate);
                }
              } else {
                toast({
                  title: 'Select a Date',
                  description: 'Please select a future date first',
                  variant: 'destructive'
                });
              }
            }}
            disabled={isLoading || !selectedDate || (selectedDate && !availability[format(selectedDate, 'yyyy-MM-dd')])}
            className="flex items-center gap-2 border-muted-foreground/50 text-muted-foreground hover:bg-muted/10 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Mark Unavailable
          </Button>
        </div>

        {selectedDate && (
          <div className="text-center text-sm text-muted-foreground">
            Selected: {format(selectedDate, 'MMM dd, yyyy')}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success/20 border border-success rounded"></div>
            <span className="text-xs text-muted-foreground">Available Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-background border border-border rounded"></div>
            <span className="text-xs text-muted-foreground">Unavailable Date</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Available dates will show slots from 9:00 AM to 5:30 PM</p>
          <p>• Evening surcharge applies automatically after 5:00 PM</p>
          <p>• Slots are generated in 30-minute intervals</p>
        </div>
      </CardContent>
    </Card>
  );
};