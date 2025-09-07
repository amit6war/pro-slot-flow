import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/config/stripe';
import { CartItem } from '@/types/cart';
import { executePaymentOperation, handlePaymentError, PaymentErrorType } from './errorHandlingService';
import { validateAmount, sanitizeInput, logSecurityEvent, initializeSecurity } from '@/config/security';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  cartItems: CartItem[];
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  orderId?: string;
}

class PaymentService {
  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentResult> {
    return executePaymentOperation(async () => {
      // Initialize security measures
      initializeSecurity();
      
      // Validate amount
      if (!validateAmount(request.amount)) {
        throw new Error('Invalid payment amount');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logSecurityEvent('UNAUTHORIZED_PAYMENT_ATTEMPT', { amount: request.amount, currency: request.currency });
        return {
          success: false,
          error: 'User must be authenticated to create payment'
        };
      }

      // Sanitize and validate cart items
      const sanitizedCartItems = request.cartItems.map(item => ({
        ...item,
        serviceName: sanitizeInput(item.serviceName)
      }));

      // Call Supabase Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(request.amount * 100), // Convert to cents
          currency: sanitizeInput(request.currency || 'usd'),
          cartItems: sanitizedCartItems,
          customerEmail: sanitizeInput(request.customerEmail || user.email),
          customerName: sanitizeInput(request.customerName),
          userId: user.id,
          metadata: {
            userId: user.id,
            cartItemsCount: request.cartItems.length.toString(),
            ...request.metadata
          }
        }
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      logSecurityEvent('PAYMENT_INTENT_CREATED', {
        paymentIntentId: data.id,
        amount: request.amount,
        currency: request.currency || 'usd'
      });

      return {
        success: true,
        paymentIntent: data
      };
    }).catch((error: any) => {
      const paymentError = handlePaymentError(error, false);
      return {
        success: false,
        error: paymentError.userMessage
      };
    });
  }

  /**
   * Confirm payment and create order
   */
  async confirmPayment(paymentIntentId: string, cartItems: CartItem[]): Promise<PaymentResult> {
    try {
      return await executePaymentOperation(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          logSecurityEvent('UNAUTHORIZED_PAYMENT_CONFIRMATION', { paymentIntentId });
          return {
            success: false,
            error: 'User must be authenticated to confirm payment'
          };
        }

        // Sanitize cart items
        const sanitizedCartItems = cartItems.map(item => ({
          ...item,
          serviceName: sanitizeInput(item.serviceName)
        }));

        // Call Supabase Edge Function to confirm payment and create order
        const { data, error } = await supabase.functions.invoke('confirm-payment', {
          body: {
            paymentIntentId: sanitizeInput(paymentIntentId),
            cartItems: sanitizedCartItems,
            userId: user.id
          }
        });

        if (error) {
          console.error('Error confirming payment:', error);
          throw new Error(error.message || 'Failed to confirm payment');
        }

        logSecurityEvent('PAYMENT_CONFIRMED', {
          paymentIntentId,
          orderId: data.orderId
        });

        return {
          success: true,
          orderId: data.orderId
        };
      });
    } catch (error: any) {
      const paymentError = handlePaymentError(error, false);
      return {
        success: false,
        error: paymentError.userMessage
      };
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-status', {
        body: { paymentIntentId }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to get payment status'
        };
      }

      return {
        success: true,
        paymentIntent: data
      };
    } catch (error: any) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-payment', {
        body: { paymentIntentId }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to cancel payment'
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Cancel payment error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User must be authenticated to process refund'
        };
      }

      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if provided
          userId: user.id
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to process refund'
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(): Promise<{ success: boolean; paymentMethods?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User must be authenticated'
        };
      }

      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { userId: user.id }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to get payment methods'
        };
      }

      return {
        success: true,
        paymentMethods: data.paymentMethods || []
      };
    } catch (error: any) {
      console.error('Get payment methods error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Save payment method for future use
   */
  async savePaymentMethod(paymentMethodId: string): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User must be authenticated'
        };
      }

      const { data, error } = await supabase.functions.invoke('save-payment-method', {
        body: {
          paymentMethodId,
          userId: user.id
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to save payment method'
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Save payment method error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;