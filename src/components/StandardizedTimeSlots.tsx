import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { standardizedSlotService, StandardizedSlot, SurchargeSettings } from '@/services/standardizedSlotService';
import { SlotCountdownTimer } from '@/components/SlotCountdownTimer';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

interface Provider {
  id: string;
  business_name: string;
  contact_person: string;
  rating: number;
  years_of_experience: number;
  price: number;
  service_name: string;
  profile_image_url?: string;
}

interface StandardizedTimeSlotsProps {
  provider: Provider;
  onBack: () => void;
  onSlotConfirmed: (slot: StandardizedSlot) => void;
}

export const StandardizedTimeSlots: React.FC<StandardizedTimeSlotsProps> = ({
  provider,
  onBack,
  onSlotConfirmed
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [availableSlots, setAvailableSlots] = useState<StandardizedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<StandardizedSlot | null>(null);
  const [heldSlot, setHeldSlot] = useState<StandardizedSlot | null>(null);
  const [surchargeSettings, setSurchargeSettings] = useState<SurchargeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate next 7 days for quick selection
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    loadSurchargeSettings();
  }, []);

  useEffect(() => {
    if (selectedDate && provider.id) {
      loadAvailableSlots();
    }
  }, [selectedDate, provider.id]);

  const loadSurchargeSettings = async () => {
    const settings = await standardizedSlotService.getSurchargeSettings();
    setSurchargeSettings(settings);
  };

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      console.log('Loading slots for provider:', provider.id, 'date:', format(selectedDate, 'yyyy-MM-dd'));
      
      // First, ensure slots are generated for this provider and date
      const slotsGenerated = await standardizedSlotService.generateProviderSlots(
        provider.id, 
        selectedDate, 
        provider.price
      );
      
      console.log('Slots generation result:', slotsGenerated);

      // Then fetch available slots
      const slots = await standardizedSlotService.getAvailableSlots(provider.id, selectedDate);
      
      console.log('Available slots retrieved:', slots.length);
      
      if (slots.length === 0) {
        // Check if provider has any availability set up
        const hasAvailability = await standardizedSlotService.checkProviderAvailability(provider.id, selectedDate);
        console.log('Provider has availability setup:', hasAvailability);
        
        toast({
          title: "No Slots Available",
          description: hasAvailability 
            ? "All slots are booked for this date." 
            : "Provider hasn't set availability for this date.",
          variant: "destructive"
        });
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = async (slot: StandardizedSlot) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a slot",
        variant: "destructive"
      });
      return;
    }

    // Release previously held slot if any
    if (heldSlot && heldSlot.id !== slot.id) {
      await standardizedSlotService.releaseSlot(heldSlot.id, user.id);
    }

    // Hold the new slot
    const success = await standardizedSlotService.holdSlot(slot.id, user.id);
    
    if (success) {
      const updatedSlot = {
        ...slot,
        status: 'held' as const,
        held_by: user.id,
        hold_expires_at: new Date(Date.now() + 7 * 60 * 1000).toISOString()
      };
      
      setSelectedSlot(updatedSlot);
      setHeldSlot(updatedSlot);
      
      toast({
        title: "Slot Reserved",
        description: "You have 7 minutes to complete the booking"
      });
    } else {
      toast({
        title: "Slot Unavailable",
        description: "This slot is no longer available",
        variant: "destructive"
      });
      loadAvailableSlots(); // Refresh slots
    }
  };

  const handleProceedToCheckout = () => {
    if (heldSlot) {
      onSlotConfirmed(heldSlot);
    }
  };

  const handleSlotExpired = async () => {
    if (heldSlot && user) {
      await standardizedSlotService.releaseSlot(heldSlot.id, user.id);
      setHeldSlot(null);
      setSelectedSlot(null);
      loadAvailableSlots();
      
      toast({
        title: "Slot Expired",
        description: "Your slot reservation has expired",
        variant: "destructive"
      });
    }
  };

  const getDayName = (date: Date) => {
    if (isSameDay(date, startOfToday())) return 'Today';
    if (isSameDay(date, addDays(startOfToday(), 1))) return 'Tomorrow';
    return format(date, 'EEE');
  };

  const formatSlotTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const hasValidAvailability = availableSlots.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Select Date & Time
              </h1>
              <p className="text-muted-foreground">
                Choose your preferred appointment slot
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Summary */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img
              src={provider.profile_image_url || '/placeholder.svg'}
              alt={provider.contact_person}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                {provider.business_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{provider.rating} • {provider.years_of_experience} years exp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Quick Selection
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {next7Days.map((date) => (
                <Card
                  key={date.toISOString()}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSameDay(date, selectedDate)
                      ? 'ring-2 ring-primary bg-primary text-primary-foreground'
                      : 'hover:shadow-md hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs font-medium mb-1">
                      {getDayName(date)}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, 'd')}
                    </div>
                    <div className="text-xs">
                      {format(date, 'MMM')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Available Time Slots
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading available slots...</p>
                </div>
              ) : !hasValidAvailability ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No slots available for this date.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The provider hasn't set their availability for {format(selectedDate, 'MMMM d, yyyy')}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please select a different date or contact the provider directly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => {
                    const hasSurcharge = surchargeSettings && 
                      standardizedSlotService.isSlotEligibleForSurcharge(slot.slot_time, surchargeSettings);
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={`h-auto py-4 flex flex-col relative ${
                          slot.status !== 'available' && slot.held_by !== user?.id 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.status !== 'available' && slot.held_by !== user?.id}
                      >
                        <div className="font-semibold text-sm">
                          {formatSlotTime(slot.slot_time)}
                 </div>
                 <div className="text-xs opacity-75 mt-1">
                           ₹{slot.base_price + (slot.surcharge_amount || 0)}
                         </div>
                        {hasSurcharge && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-orange-100 text-orange-600"
                          >
                            +₹{surchargeSettings.surcharge_amount}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Held Slot Summary & Countdown */}
          {heldSlot && (
            <Card className="mt-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Slot Reserved: {formatSlotTime(heldSlot.slot_time)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Base Price:</span>
                      <span className="font-semibold">₹{heldSlot.base_price}</span>
                    </div>
                    {heldSlot.surcharge_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Evening Surcharge:</span>
                        <span className="font-semibold text-orange-600">+₹{heldSlot.surcharge_amount}</span>
                      </div>
                    )}
                     <div className="border-t mt-2 pt-2 flex justify-between items-center">
                       <span className="font-semibold">Total:</span>
                       <span className="font-bold text-lg text-primary">₹{heldSlot.base_price + (heldSlot.surcharge_amount || 0)}</span>
                     </div>
                  </div>

                  {heldSlot.hold_expires_at && (
                    <SlotCountdownTimer
                      expiresAt={heldSlot.hold_expires_at}
                      onExpired={handleSlotExpired}
                    />
                  )}
                  
                  <Button 
                    onClick={handleProceedToCheckout}
                    size="lg"
                    className="w-full"
                  >
                    Proceed to checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Date Display - Fixed at bottom */}
        {selectedDate && !heldSlot && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40" style={{ paddingRight: '120px' }}>
            <div className="container mx-auto flex flex-col items-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Date selected: {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <p className="font-semibold">
                  Total: ₹{provider.price}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};