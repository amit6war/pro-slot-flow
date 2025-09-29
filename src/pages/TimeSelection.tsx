import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProviderAvailability } from '../hooks/useProviderAvailability';
import { SlotCountdownTimer } from '@/components/SlotCountdownTimer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { ArrowLeft, User, Star, Clock, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BookingSlot {
  id: string;
  provider_id: string;
  service_id?: string;
  slot_date: string;
  slot_time: string;
  status: string;
  is_blocked: boolean;
  held_by?: string;
  hold_expires_at?: string;
  booking_id?: string;
  blocked_by?: string;
  blocked_until?: string;
  created_at: string;
}

const TimeSelection = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getAvailableSlots, holdSlot, releaseSlot } = useProviderAvailability();
  
  // Get data from DateSelection page
  const { selectedServices = [], selectedProvider, selectedDate, category = '' } = location.state || {};
  
  // Use provider ID from the state instead of URL params
  const providerId = selectedProvider?.id;
  
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [heldSlot, setHeldSlot] = useState<BookingSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(selectedDate || new Date());

  // Fetch available slots when component mounts
  useEffect(() => {
    if (selectedDate && providerId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, providerId]);
  
  // Debug logging
  useEffect(() => {
    console.log('TimeSelection Debug:', {
      selectedProvider,
      providerId,
      selectedDate,
      selectedServices,
      locationState: location.state
    });
    
    // Check if we have the required data
    if (!selectedProvider) {
      console.error('No selectedProvider found in location state');
      toast({
        title: "Missing Provider Information",
        description: "Please go back and select a provider again.",
        variant: "destructive"
      });
    }
    
    if (!selectedDate) {
      console.error('No selectedDate found in location state');
      toast({
        title: "Missing Date Information", 
        description: "Please go back and select a date again.",
        variant: "destructive"
      });
    }
  }, [selectedProvider, providerId, selectedDate, selectedServices, location.state, toast]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !providerId) return;
    
    setLoading(true);
    try {
      // Convert selectedDate to string format (YYYY-MM-DD)
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // First check if provider has availability set for this day
      const dayOfWeek = selectedDate.getDay();
      const { data: availability, error: availError } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .single();
      
      if (availError || !availability) {
        console.log('No availability set for this day');
        setAvailableSlots([]);
        toast({
          title: "No Availability",
          description: "This provider is not available on this day.",
          variant: "destructive"
        });
        return;
      }
      
      // Try to get existing available slots
      const slots = await getAvailableSlots(providerId, dateString);
      
      // If no slots exist, generate them for this provider
      if (slots.length === 0) {
        console.log('No slots found, generating for provider:', providerId);
        
        // Generate slots for the next 15 days starting from selected date
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 14);
        
        // Generate slots using the database function
        const { error } = await supabase.rpc('generate_provider_slots', {
          p_provider_id: providerId,
          p_start_date: dateString,
          p_end_date: endDate.toISOString().split('T')[0]
        });
        
        if (error) {
          console.error('Error generating slots:', error);
          toast({
            title: "Error",
            description: "Failed to generate time slots",
            variant: "destructive"
          });
          return;
        }
        
        // Fetch the newly generated slots
        const newSlots = await getAvailableSlots(providerId, dateString);
        setAvailableSlots(newSlots);
      } else {
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = async (slot: BookingSlot) => {
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
      await releaseSlot(heldSlot.id, user.id);
    }

    // Hold the new slot
    const success = await holdSlot(slot.id, user.id);
    if (success) {
      setSelectedSlot(slot);
      setHeldSlot(slot);
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
      fetchAvailableSlots(); // Refresh slots
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSlot && heldSlot) {
      navigate('/cart', {
        state: {
          providerId,
          serviceId,
          selectedSlot: heldSlot,
          selectedDate: format(selectedDate!, 'yyyy-MM-dd')
        }
      });
    }
  };

  const handleSlotExpired = async () => {
    if (heldSlot && user) {
      await releaseSlot(heldSlot.id, user.id);
      setHeldSlot(null);
      setSelectedSlot(null);
      fetchAvailableSlots();
      toast({
        title: "Slot Expired",
        description: "Your slot reservation has expired",
        variant: "destructive"
      });
    }
  };

  const getTotalPrice = () => {
    if (!selectedServices.length) return 0;
    return selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
  };

  // Generate week dates for quick selection
  const getWeekDates = () => {
    const start = startOfWeek(selectedWeekDate, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="rounded-full h-10 w-10 p-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Select Time Slot
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Choose your preferred appointment time
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Secure Booking
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Provider Card */}
      {selectedProvider && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedProvider.profile_image_url || selectedProvider.image}
                      alt={selectedProvider.business_name || selectedProvider.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {selectedProvider.business_name || selectedProvider.name || selectedProvider.contact_person || 'Service Provider'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{selectedProvider.rating}</span>
                            <span>({selectedProvider.reviews} reviews)</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>2.5 km away</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Available Today
                        </Badge>
                        <Badge variant="secondary">
                          4.5+ Years Experience
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Quick Date Selection */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Quick Selection</h2>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedWeekDate(date)}
                    className={`p-3 rounded-xl text-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'bg-white/80 hover:bg-primary/10 border border-border/50'
                    }`}
                  >
                    <div className="text-xs font-medium opacity-70">
                      {format(date, 'EEE')}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    <div className="text-xs opacity-70">
                      {format(date, 'MMM')}
                    </div>
                    {isToday && (
                      <div className="text-xs text-primary font-medium mt-1">Today</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Available Time Slots</h2>
              </div>
              {selectedDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Finding available slots</p>
                      <p className="text-xs text-muted-foreground">This will only take a moment...</p>
                    </div>
                  </div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No available time slots for the selected date</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Try selecting a different date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isUnavailable = slot.status !== 'available';
                    
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={isUnavailable}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
                            : isUnavailable
                            ? 'border-muted-foreground/20 bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : 'border-border bg-white hover:border-primary/50 hover:bg-primary/5 hover:scale-102'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-lg">{slot.slot_time}</div>
                          <div className="text-xs mt-1 opacity-75">
                            ₹250
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          )}
                          {slot.slot_time === '5:00 PM' && (
                            <div className="text-xs text-orange-500 font-medium mt-1">+₹100</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Services Summary */}
          {selectedServices.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-primary/20">
                <h3 className="text-lg font-semibold">Services Included</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {selectedServices.map((service: any) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration} minutes
                        </p>
                      </div>
                      <p className="font-bold text-lg">₹{service.price}</p>
                    </div>
                  ))}
                  <div className="border-t border-primary/20 pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg">
                      <p className="font-semibold">Total Amount</p>
                      <p className="font-bold text-primary">₹{getTotalPrice()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Slot Booking Confirmation */}
          {heldSlot && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 border-b border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Slot Reserved: {heldSlot.slot_time}
                  </h3>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="p-6">
                <div className="text-center space-y-6">
                  <SlotCountdownTimer
                    expiresAt={new Date(Date.now() + 7 * 60 * 1000).toISOString()}
                    onExpired={handleSlotExpired}
                  />
                  <Button 
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  >
                    Proceed to Payment →
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your slot is temporarily reserved. Complete payment to confirm.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSelection;