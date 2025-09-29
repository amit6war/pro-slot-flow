import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StandardizedTimeSlots } from '@/components/StandardizedTimeSlots';
import { StandardizedSlot } from '@/services/standardizedSlotService';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string; // Provider ID (user profile ID) 
  business_name: string;
  contact_person: string;
  rating: number;
  years_of_experience: number;
  price: number;
  service_name: string;
  profile_image_url?: string;
  serviceId?: string; // Provider service ID for cart operations
}

const StandardizedScheduling: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { 
    selectedProvider, 
    subcategoryId, 
    categoryName,
    basePrice 
  } = location.state || {};

  if (!selectedProvider) {
    navigate('/');
    return null;
  }

  const handleSlotConfirmed = async (slot: StandardizedSlot) => {
    try {
      // Add the confirmed slot to cart
      await addToCart({
        serviceId: selectedProvider.serviceId || selectedProvider.id, // Use serviceId if available, fallback to id
        serviceName: selectedProvider.service_name,
        providerId: selectedProvider.id, // This is now the correct provider ID
        providerName: selectedProvider.contact_person,
        price: slot.total_price,
        serviceDetails: {
          date: slot.slot_date,
          time: slot.slot_time,
          basePrice: slot.base_price,
          surcharge: slot.surcharge_amount,
          slotId: slot.id,
          subcategoryId,
          categoryName
        }
      });

      toast({
        title: "Added to Cart",
        description: `${selectedProvider.service_name} has been added to your cart`,
      });

      // Navigate to cart for checkout
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add service to cart",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <StandardizedTimeSlots
      provider={selectedProvider}
      onBack={handleBack}
      onSlotConfirmed={handleSlotConfirmed}
    />
  );
};

export default StandardizedScheduling;