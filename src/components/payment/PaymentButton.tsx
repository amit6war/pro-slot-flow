import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'lg'
}) => {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to proceed with payment.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (itemCount === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before proceeding to payment.',
        variant: 'destructive',
      });
      return;
    }

    if (totalAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Cart total must be greater than $0.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Navigate to payment page where Stripe payment will be handled
      navigate('/payment');
    } catch (error) {
      console.error('Error navigating to payment:', error);
      toast({
        title: 'Navigation Error',
        description: 'Unable to proceed to payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleProceedToPayment}
      disabled={isProcessing || itemCount === 0}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Proceed to Payment
        </>
      )}
    </Button>
  );
};