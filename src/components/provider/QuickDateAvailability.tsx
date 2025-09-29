import React, { useState } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfToday } from 'date-fns';

export const QuickDateAvailability = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSetAvailability = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const selectedDateObj = new Date(selectedDate);
      const weekStart = new Date(selectedDateObj);
      weekStart.setDate(selectedDateObj.getDate() - selectedDateObj.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday

      // Save to weekly availability table
      const { error } = await supabase
        .from('provider_weekly_availability')
        .upsert({
          provider_id: user.id,
          week_start: format(weekStart, 'yyyy-MM-dd'),
          week_end: format(weekEnd, 'yyyy-MM-dd'),
          availability_data: {
            [selectedDate]: {
              day_of_week: selectedDateObj.getDay(),
              start_time: startTime,
              end_time: endTime,
              is_available: true
            }
          },
          is_confirmed: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Availability set for ${format(selectedDateObj, 'MMMM d, yyyy')}`
      });
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to set availability',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = format(addDays(startOfToday(), 1), 'yyyy-MM-dd');
  // Get maximum date (30 days from now)
  const maxDate = format(addDays(startOfToday(), 30), 'yyyy-MM-dd');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            min={startTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSetAvailability}
        disabled={isLoading || !selectedDate || !startTime || !endTime}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Setting Availability...' : 'Set Availability for This Date'}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        <p>• Slots will be generated from 8:00 AM to 8:00 PM at 30-minute intervals</p>
        <p>• Only slots within your selected time range will be available to customers</p>
        <p>• Evening surcharge applies automatically after 5:00 PM</p>
      </div>
    </div>
  );
};