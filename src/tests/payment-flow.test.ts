// Comprehensive end-to-end payment flow tests

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '@/services/paymentService';
import { handlePaymentError, PaymentErrorType } from '@/services/errorHandlingService';
import { pciComplianceChecks, validateAmount } from '@/config/security';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import Payment from '@/pages/Payment';

// Mock Stripe
const mockStripe = {
  confirmPayment: vi.fn(),
  elements: vi.fn(() => mockElements),
  createPaymentMethod: vi.fn(),
  retrievePaymentIntent: vi.fn(),
  _apiKey: 'pk_test_mock',
  _stripeAccount: null
};

// Mock loadStripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe))
}));

const mockElements = {
  submit: vi.fn(),
  getElement: vi.fn()
};

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }))
    },
    functions: {
      invoke: vi.fn((functionName, options) => {
        if (functionName === 'create-payment-intent') {
          return Promise.resolve({
            data: {
              id: 'pi_test_123',
              client_secret: 'pi_test_123_secret',
              amount: options.body.amount,
              currency: options.body.currency,
              status: 'requires_payment_method'
            },
            error: null
          });
        }
        if (functionName === 'confirm-payment') {
          return Promise.resolve({
            data: {
              success: true,
              paymentIntent: {
                id: 'pi_test_123',
                status: 'succeeded'
              },
              orderId: 'order_123'
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: { message: 'Function not mocked' } });
      })
    }
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Payment Flow Integration Tests', () => {
  const mockCartItems = [
    {
      id: '1',
      serviceId: 'service-1',
      serviceName: 'Test Service',
      price: 99.99,
      quantity: 1,
      selectedDate: '2024-01-15',
      selectedTime: '10:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.crypto for security functions
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: vi.fn((arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
        subtle: {
          importKey: vi.fn(),
          encrypt: vi.fn()
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Security Validation', () => {
    it('should validate secure connection', () => {
      // Mock HTTPS connection
      Object.defineProperty(window, 'location', {
        value: { protocol: 'https:' },
        writable: true
      });

      expect(pciComplianceChecks.isSecureConnection()).toBe(true);
    });

    it('should validate localhost connection', () => {
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:', hostname: 'localhost' },
        writable: true
      });

      expect(pciComplianceChecks.isSecureConnection()).toBe(true);
    });

    it('should reject insecure connections', () => {
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:', hostname: 'example.com' },
        writable: true
      });

      expect(pciComplianceChecks.isSecureConnection()).toBe(false);
    });

    it('should validate payment amounts', () => {
      expect(validateAmount(99.99)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-10)).toBe(false);
      expect(validateAmount(1000000)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
    });

    it('should detect card data in storage', () => {
      // Mock localStorage with card data
      const mockLocalStorage = {
        getItem: vi.fn((key) => {
          if (key === 'card') return '4242424242424242';
          return null;
        })
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
      Object.defineProperty(window, 'sessionStorage', {
        value: { getItem: vi.fn(() => null) }
      });

      expect(pciComplianceChecks.validateNoCardStorage()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should classify Stripe card errors correctly', () => {
      const cardError = {
        type: 'card_error',
        code: 'card_declined',
        message: 'Your card was declined.'
      };

      const result = handlePaymentError(cardError, false);
      expect(result.type).toBe(PaymentErrorType.CARD_DECLINED);
      expect(result.retryable).toBe(false);
      expect(result.userMessage).toContain('card was declined');
    });

    it('should classify network errors correctly', () => {
      const networkError = {
        name: 'NetworkError',
        message: 'Network request failed'
      };

      const result = handlePaymentError(networkError, false);
      expect(result.type).toBe(PaymentErrorType.NETWORK_ERROR);
      expect(result.retryable).toBe(true);
    });

    it('should classify server errors correctly', () => {
      const serverError = {
        status: 500,
        message: 'Internal server error'
      };

      const result = handlePaymentError(serverError, false);
      expect(result.type).toBe(PaymentErrorType.SERVER_ERROR);
      expect(result.retryable).toBe(true);
    });
  });

  describe('PaymentService', () => {
    // Using the imported paymentService instance

    it('should create payment intent successfully', async () => {
      const mockResponse = {
        success: true,
        paymentIntent: {
          id: 'pi_test_123',
          client_secret: 'pi_test_123_secret_test'
        }
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse.paymentIntent,
        error: null
      });

      const result = await paymentService.createPaymentIntent({
        amount: 99.99,
        currency: 'usd',
        cartItems: mockCartItems
      });

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toBeDefined();
    });

    it('should handle payment intent creation errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Payment intent creation failed' }
      });

      const result = await paymentService.createPaymentIntent({
        amount: 99.99,
        currency: 'usd',
        cartItems: mockCartItems
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment intent creation failed');
    });

    it('should confirm payment successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { orderId: 'order_123' },
        error: null
      });

      const result = await paymentService.confirmPayment('pi_test_123', mockCartItems);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order_123');
    });
  });

  describe('Stripe Payment Form Component', () => {
    const mockProps = {
      clientSecret: 'pi_test_123_secret_test',
      amount: 99.99,
      onSuccess: vi.fn(),
      onError: vi.fn()
    };

    const renderPaymentForm = async () => {
      const stripePromise = loadStripe('pk_test_mock');
      const stripe = await stripePromise;
      return render(
        React.createElement(BrowserRouter, null,
          React.createElement(Elements, { stripe: stripe },
            React.createElement(StripePaymentForm, mockProps)
          )
        )
      );
    };

    const renderPaymentFormSync = () => {
      const stripePromise = loadStripe('pk_test_mock');
      return render(
        React.createElement(BrowserRouter, null,
          React.createElement(Elements, { stripe: stripePromise },
            React.createElement(StripePaymentForm, mockProps)
          )
        )
      );
    };

    it('should render payment form with security indicator', async () => {
      await renderPaymentForm();
      
      expect(screen.getByText(/secure payment environment/i)).toBeInTheDocument();
    });

    it('should show error recovery actions', async () => {
      await renderPaymentForm();
      
      // Simulate payment error
      const submitButton = screen.getByRole('button', { name: /pay now/i });
      
      // Mock Stripe methods to return error
      mockElements.submit.mockResolvedValue({ error: null });
      mockStripe.confirmPayment.mockResolvedValue({
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/try these solutions/i)).toBeInTheDocument();
        expect(screen.getByText(/try a different payment method/i)).toBeInTheDocument();
      });
    });
  });

  describe('End-to-End Payment Flow', () => {
    it('should complete full payment flow', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock successful payment intent creation
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({
          data: {
            id: 'pi_test_123',
            client_secret: 'pi_test_123_secret_test'
          },
          error: null
        })
        // Mock successful payment confirmation
        .mockResolvedValueOnce({
          data: { orderId: 'order_123' },
          error: null
        });

      // Using the imported paymentService instance

      // Step 1: Create payment intent
      const intentResult = await paymentService.createPaymentIntent({
        amount: 99.99,
        currency: 'usd',
        cartItems: mockCartItems
      });

      expect(intentResult.success).toBe(true);
      expect(intentResult.paymentIntent?.client_secret).toBe('pi_test_123_secret_test');

      // Step 2: Confirm payment
      const confirmResult = await paymentService.confirmPayment(
        'pi_test_123',
        mockCartItems
      );

      expect(confirmResult.success).toBe(true);
      expect(confirmResult.orderId).toBe('order_123');
    });

    it('should handle payment flow with retries', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock network error followed by success
      vi.mocked(supabase.functions.invoke)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            id: 'pi_test_123',
            client_secret: 'pi_test_123_secret_test'
          },
          error: null
        });

      // Using the imported paymentService instance

      const result = await paymentService.createPaymentIntent({
        amount: 99.99,
        currency: 'usd',
        cartItems: mockCartItems
      });

      // Should succeed after retry
      expect(result.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should complete payment intent creation within acceptable time', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          id: 'pi_test_123',
          client_secret: 'pi_test_123_secret_test'
        },
        error: null
      });

      // Using the imported paymentService instance
      const startTime = Date.now();

      await paymentService.createPaymentIntent({
        amount: 99.99,
        currency: 'usd',
        cartItems: mockCartItems
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});

// Test utilities
export const createMockCartItems = (count: number = 1) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index + 1}`,
    serviceId: `service-${index + 1}`,
    serviceName: `Test Service ${index + 1}`,
    price: 99.99 + index,
    quantity: 1,
    selectedDate: '2024-01-15',
    selectedTime: '10:00'
  }));
};

export const mockStripeError = (type: string, code?: string) => ({
  type,
  code,
  message: `Mock ${type} error${code ? ` (${code})` : ''}`
});