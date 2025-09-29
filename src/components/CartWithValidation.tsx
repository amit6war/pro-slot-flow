import React, { useState, useEffect } from 'react';
import { CartSidebar } from './CartSidebar';
import { PaymentValidation } from './customer/PaymentValidation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';

interface ValidationData {
  name: string;
  email: string;
  phone: string;
  selectedAddress: {
    id: string;
    name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    user_id: string;
  } | null;
}

interface CartWithValidationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartWithValidation: React.FC<CartWithValidationProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, totalAmount } = useCart();
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const handleOpenValidation = (e?: Event) => {
      e?.preventDefault();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to proceed with checkout",
          variant: "destructive"
        });
        return;
      }

      if (items.length === 0) {
        toast({
          title: "Empty Cart",
          description: "Please add items to your cart first",
          variant: "destructive"
        });
        return;
      }

      setShowValidation(true);
    };

    window.addEventListener('openPaymentValidation', handleOpenValidation);
    return () => window.removeEventListener('openPaymentValidation', handleOpenValidation);
  }, [user, items, toast]);

  const handleValidationComplete = async (validationData: ValidationData) => {
    try {
      console.log('Validation completed:', validationData);
      
      // Calculate final total with fees and taxes
      const platformFees = 30;
      const subtotalWithFees = totalAmount + platformFees;
      const taxAmount = subtotalWithFees * 0.18;
      const finalTotal = subtotalWithFees + taxAmount;
      
      // Create checkout session with validated customer info
      const result = await paymentService.createCheckoutSession({
        amount: Math.round(finalTotal * 100), // Convert to cents
        currency: 'usd',
        cartItems: items,
        guestInfo: {
          name: validationData.name,
          email: validationData.email,
          phone: validationData.phone,
          address: validationData.selectedAddress ? 
            `${validationData.selectedAddress.address_line_1}, ${validationData.selectedAddress.city}, ${validationData.selectedAddress.state} ${validationData.selectedAddress.postal_code}` 
            : '',
          instructions: ''
        },
        metadata: { 
          source: 'cart_validation',
          user_id: user?.id || '',
          selected_address_id: validationData.selectedAddress?.id || '',
          platform_fees: platformFees.toString(),
          tax_amount: taxAmount.toFixed(2),
        },
      });

      console.log('💳 Checkout session result:', result);

      if (result.success && result.url) {
        console.log('✅ Redirecting to Stripe checkout:', result.url);
        // Close modals before redirect
        setShowValidation(false);
        onClose();
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        console.error('❌ Checkout failed:', result.error);
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('Payment validation error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <CartSidebar isOpen={isOpen} onClose={onClose} />
      <PaymentValidation
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        onValidationComplete={handleValidationComplete}
      />
    </>
  );
};