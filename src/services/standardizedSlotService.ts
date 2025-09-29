import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface StandardizedSlot {
  id: string;
  provider_id: string;
  slot_date: string;
  slot_time: string;
  display_name: string;
  base_price: number;
  surcharge_amount: number;
  total_price: number;
  status: 'available' | 'held' | 'booked';
  is_blocked: boolean;
  held_by?: string;
  hold_expires_at?: string;
  buffer_blocked_until?: string;
  buffer_booking_id?: string;
}

export interface SurchargeSettings {
  id: string;
  name: string;
  surcharge_amount: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

class StandardizedSlotService {
  /**
   * Generate standardized slots for a provider on a specific date
   * Implements: Requirement 1 (Standardized Slot Timing) & 3 (Post-5 PM Additional Charges)
   */
  async generateProviderSlots(providerId: string, date: Date, basePrice: number): Promise<boolean> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Check if provider has marked this date as available
      const { data: weeklyAvailability } = await supabase
        .from('provider_weekly_availability')
        .select('*')
        .eq('provider_id', providerId)
        .lte('week_start', dateString)
        .gte('week_end', dateString)
        .eq('is_confirmed', true);

      // Check if this specific date is available in any weekly schedule record
      let isDateAvailable = false;
      let timeRange = { start_time: '09:00', end_time: '17:00' };

      if (weeklyAvailability && weeklyAvailability.length > 0) {
        for (const record of weeklyAvailability) {
          if (record.availability_data && typeof record.availability_data === 'object') {
            const availData = record.availability_data as Record<string, any>;
            const dateAvailability = availData[dateString];
            if (dateAvailability?.is_available) {
              isDateAvailable = true;
              timeRange = {
                start_time: dateAvailability.start_time || '09:00',
                end_time: dateAvailability.end_time || '17:00'
              };
              break;
            }
          }
        }
      }

      // If no weekly schedule found, provider not available
      // Note: All providers should now use weekly availability setup

      // If no availability set, return false
      if (!isDateAvailable) {
        return false;
      }

      // Generate slots manually since we have custom logic
      const slots = await this.generateSlotsForTimeRange(providerId, date, basePrice, timeRange);
      return slots.length > 0;
    } catch (error) {
      console.error('Error generating standardized slots:', error);
      return false;
    }
  }

  private async generateSlotsForTimeRange(
    providerId: string, 
    date: Date, 
    basePrice: number, 
    timeRange: { start_time: string; end_time: string }
  ): Promise<StandardizedSlot[]> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Get standardized time slots
      const { data: timeSlots } = await supabase
        .from('standardized_time_slots')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!timeSlots) return [];

      // Get surcharge settings
      const surchargeSettings = await this.getSurchargeSettings();
      
      const generatedSlots: StandardizedSlot[] = [];

      for (const timeSlot of timeSlots) {
        // Check if this time slot is within the provider's available range
        if (timeSlot.slot_time >= timeRange.start_time && timeSlot.slot_time <= timeRange.end_time) {
          // Calculate surcharge if applicable
          let surchargeAmount = 0;
          if (surchargeSettings && this.isSlotEligibleForSurcharge(timeSlot.slot_time, surchargeSettings)) {
            surchargeAmount = surchargeSettings.surcharge_amount;
          }

          // Check if slot already exists first
          const { data: existingSlot } = await supabase
            .from('booking_slots')
            .select('*')
            .eq('provider_id', providerId)
            .eq('slot_date', dateString)
            .eq('slot_time', timeSlot.slot_time)
            .maybeSingle();

          let insertedSlot;
          let insertError;

          if (existingSlot) {
            // Update existing slot if it's available and price is different
            if (existingSlot.status === 'available' && existingSlot.base_price !== basePrice) {
              const { data, error } = await supabase
                .from('booking_slots')
                .update({
                  base_price: basePrice,
                  surcharge_amount: surchargeAmount,
                  total_price: basePrice + surchargeAmount
                })
                .eq('id', existingSlot.id)
                .select()
                .single();
              insertedSlot = data;
              insertError = error;
            } else {
              // Slot exists and price is correct, or not available - use existing
              insertedSlot = existingSlot;
              insertError = null;
            }
          } else {
            // Insert new slot
            const { data, error } = await supabase
              .from('booking_slots')
              .insert({
                provider_id: providerId,
                slot_date: dateString,
                slot_time: timeSlot.slot_time,
                status: 'available',
                is_blocked: false,
                base_price: basePrice,
                surcharge_amount: surchargeAmount,
                total_price: basePrice + surchargeAmount
              })
              .select()
              .single();
            insertedSlot = data;
            insertError = error;
          }

          if (!insertError && insertedSlot) {
            generatedSlots.push({
              id: insertedSlot.id,
              provider_id: providerId,
              slot_date: dateString,
              slot_time: timeSlot.slot_time,
              display_name: timeSlot.display_name,
              base_price: basePrice,
              surcharge_amount: surchargeAmount,
              total_price: basePrice + surchargeAmount,
              status: 'available',
              is_blocked: false
            });
          }
        }
      }

      return generatedSlots;
    } catch (error) {
      console.error('Error generating slots for time range:', error);
      return [];
    }
  }

  /**
   * Check if provider has availability set up for a specific date
   */
  async checkProviderAvailability(providerId: string, date: Date): Promise<boolean> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Check weekly availability first
      const { data: weeklyAvailability } = await supabase
        .from('provider_weekly_availability')
        .select('*')
        .eq('provider_id', providerId)
        .lte('week_start', dateString)
        .gte('week_end', dateString)
        .eq('is_confirmed', true);

      if (weeklyAvailability && weeklyAvailability.length > 0) {
        for (const record of weeklyAvailability) {
          if (record.availability_data && typeof record.availability_data === 'object') {
            const availData = record.availability_data as Record<string, any>;
            const dateAvailability = availData[dateString];
            if (dateAvailability?.is_available) {
              return true;
            }
          }
        }
      }

      // Only use weekly availability now
      return false;
    } catch (error) {
      console.error('Error checking provider availability:', error);
      return false;
    }
  }
  async getAvailableSlots(providerId: string, date: Date): Promise<StandardizedSlot[]> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      // First cleanup expired holds and buffers
      await this.cleanupExpiredSlots();
      
      // Check if provider has weekly availability for this specific date
      const { data: weeklyAvailability } = await supabase
        .from('provider_weekly_availability')
        .select('*')
        .eq('provider_id', providerId)
        .lte('week_start', dateString)
        .gte('week_end', dateString)
        .eq('is_confirmed', true);

      // Check if this specific date is available in any weekly schedule record
      let isDateAvailable = false;
      let timeRange = { start_time: '09:00', end_time: '17:30' };

      if (weeklyAvailability && weeklyAvailability.length > 0) {
        for (const record of weeklyAvailability) {
          if (record.availability_data && typeof record.availability_data === 'object') {
            const availData = record.availability_data as Record<string, any>;
            const dateAvailability = availData[dateString];
            if (dateAvailability?.is_available) {
              isDateAvailable = true;
              timeRange = {
                start_time: dateAvailability.start_time || '09:00',
                end_time: dateAvailability.end_time || '17:30'
              };
              break;
            }
          }
        }
      }

      // Only use weekly availability - no fallback to old table

      // If no availability set, return empty array
      if (!isDateAvailable) {
        return [];
      }

      // Get existing slots from database
      const { data: slots, error } = await supabase
        .from('booking_slots')
        .select('*')
        .eq('provider_id', providerId)
        .eq('slot_date', dateString)
        .order('slot_time');

      if (error) {
        console.error('Error fetching slots:', error);
        return [];
      }

      // If no slots exist but provider is available, generate them
      if (!slots || slots.length === 0) {
        const generated = await this.generateProviderSlots(providerId, date, 120); // Default base price
        if (generated) {
          // Re-fetch the generated slots
          const { data: newSlots } = await supabase
            .from('booking_slots')
            .select('*')
            .eq('provider_id', providerId)
            .eq('slot_date', dateString)
            .order('slot_time');
          
          if (newSlots) {
            return this.mapSlotsToStandardizedSlots(newSlots);
          }
        }
        return [];
      }

      // Filter available slots (not blocked, not booked, not held by others)
      const availableSlots = slots.filter(slot => {
        if (slot.status === 'booked') return false;
        if (slot.is_blocked) return false;
        if (slot.status === 'held' && slot.hold_expires_at) {
          const holdExpiry = new Date(slot.hold_expires_at);
          if (holdExpiry > new Date()) return false; // Still held
        }
        return slot.status === 'available' || slot.status === 'held';
      });

      return this.mapSlotsToStandardizedSlots(availableSlots);
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      return [];
    }
  }

  private mapSlotsToStandardizedSlots(slots: any[]): StandardizedSlot[] {
    return slots.map(slot => ({
      id: slot.id,
      provider_id: slot.provider_id,
      slot_date: slot.slot_date,
      slot_time: slot.slot_time,
      display_name: this.formatSlotTime(slot.slot_time),
      base_price: slot.base_price || 0,
      surcharge_amount: slot.surcharge_amount || 0,
      total_price: slot.total_price || 0,
      status: slot.status as 'available' | 'held' | 'booked',
      is_blocked: slot.is_blocked,
      held_by: slot.held_by,
      hold_expires_at: slot.hold_expires_at,
      buffer_blocked_until: slot.buffer_blocked_until,
      buffer_booking_id: slot.buffer_booking_id
    }));
  }

  /**
   * Hold a slot temporarily for 7 minutes
   * Implements: Requirement 5 (Slot Booking & Freezing)
   */
  async holdSlot(slotId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('hold_slot', {
        slot_id: slotId,
        user_id: userId,
        hold_duration_minutes: 7
      });

      if (error) {
        console.error('Error holding slot:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in holdSlot:', error);
      return false;
    }
  }

  /**
   * Release a held slot
   */
  async releaseSlot(slotId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('release_slot', {
        slot_id: slotId,
        user_id: userId
      });

      if (error) {
        console.error('Error releasing slot:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in releaseSlot:', error);
      return false;
    }
  }

  /**
   * Confirm slot booking with 1-hour buffer rule
   * Implements: Requirement 7 (Booking Buffer Rule)
   */
  async confirmSlotBooking(slotId: string, userId: string, bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('confirm_slot_booking_with_buffer', {
        slot_id: slotId,
        user_id: userId,
        booking_id: bookingId
      });

      if (error) {
        console.error('Error confirming slot booking:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in confirmSlotBooking:', error);
      return false;
    }
  }

  /**
   * Get active surcharge settings
   * Implements: Requirement 3 (Post-5 PM Additional Charges)
   */
  async getSurchargeSettings(): Promise<SurchargeSettings | null> {
    try {
      const { data, error } = await supabase
        .from('surcharge_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching surcharge settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSurchargeSettings:', error);
      return null;
    }
  }

  /**
   * Set provider availability for specific dates
   * Implements: Requirement 6 (Provider Dashboard – Availability Setup)
   */
  async setProviderAvailability(
    providerId: string, 
    dayOfWeek: number, 
    isAvailable: boolean,
    startTime: string = '08:00:00',
    endTime: string = '20:00:00'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: providerId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
          slot_duration: 30 // Fixed 30-minute slots
        }, {
          onConflict: 'provider_id, day_of_week'
        });

      if (error) {
        console.error('Error setting provider availability:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setProviderAvailability:', error);
      return false;
    }
  }

  /**
   * Clean up expired holds and buffer blocks
   */
  private async cleanupExpiredSlots(): Promise<void> {
    try {
      // Clean up expired holds
      const now = new Date().toISOString();
      await supabase
        .from('booking_slots')
        .update({ 
          status: 'available', 
          held_by: null, 
          hold_expires_at: null 
        })
        .eq('status', 'held')
        .lt('hold_expires_at', now);

      // Clean up expired buffer blocks
      await supabase.rpc('cleanup_expired_buffers');
    } catch (error) {
      console.error('Error cleaning up expired slots:', error);
    }
  }

  /**
   * Check if a time slot qualifies for surcharge
   */
  isSlotEligibleForSurcharge(slotTime: string, surchargeSettings: SurchargeSettings): boolean {
    if (!surchargeSettings.is_active) return false;
    
    const time = slotTime.substring(0, 5); // Extract HH:MM
    const startTime = surchargeSettings.start_time.substring(0, 5);
    const endTime = surchargeSettings.end_time.substring(0, 5);
    
    return time >= startTime && time <= endTime;
  }

  /**
   * Calculate total price including surcharge
   * Implements: Requirement 4 (Price Display Consistency)
   */
  calculateTotalPrice(basePrice: number, slotTime: string, surchargeSettings: SurchargeSettings | null): number {
    let totalPrice = basePrice;
    
    if (surchargeSettings && this.isSlotEligibleForSurcharge(slotTime, surchargeSettings)) {
      totalPrice += surchargeSettings.surcharge_amount;
    }
    
    return totalPrice;
  }

  /**
   * Format 24-hour time to 12-hour display format
   */
  private formatSlotTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }
}

export const standardizedSlotService = new StandardizedSlotService();