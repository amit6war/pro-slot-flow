import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CreditCard, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStripeErrorMessage } from '@/config/stripe';
import { handlePaymentError, getErrorRecoveryActions, PaymentErrorType } from '@/services/errorHandlingService';
import { initializeSecurity, pciComplianceChecks } from '@/config/security';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  loading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<{
    isSecure: boolean;
    pciCompliant: boolean;
  }>({ isSecure: false, pciCompliant: false });
  const [recoveryActions, setRecoveryActions] = useState<string[]>([]);

  // Initialize security checks on component mount
  useEffect(() => {
    initializeSecurity();
    
    const checks = {
      isSecure: pciComplianceChecks.isSecureConnection(),
      pciCompliant: pciComplianceChecks.validateNoCardStorage()
    };
    
    setSecurityChecks(checks);
    
    if (!checks.isSecure || !checks.pciCompliant) {
      setErrorMessage('Security requirements not met. Please ensure you are on a secure connection.');
    }
  }, []);

  // Reset error when client secret changes
  useEffect(() => {
    setErrorMessage('');
  }, [clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please wait and try again.');
      return;
    }

    if (!clientSecret) {
      setErrorMessage('Payment setup incomplete. Please refresh and try again.');
      return;
    }

    // Security checks before processing
    if (!securityChecks.isSecure || !securityChecks.pciCompliant) {
      const errorMsg = 'Security requirements not met. Please refresh the page and try again.';
      setErrorMessage(errorMsg);
      toast({
        title: 'Security Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setRecoveryActions([]);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        const paymentError = handlePaymentError(error, false);
        setErrorMessage(paymentError.userMessage);
        setRecoveryActions(getErrorRecoveryActions(paymentError));
        onError(paymentError.userMessage);
        
        toast({
          title: 'Payment Failed',
          description: paymentError.userMessage,
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess(paymentIntent);
        
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
        });
      } else {
        // Handle other payment statuses
        const statusMessage = getPaymentStatusMessage(paymentIntent?.status);
        setErrorMessage(statusMessage);
        onError(statusMessage);
      }
    } catch (err: any) {
      const paymentError = handlePaymentError(err, false);
      setErrorMessage(paymentError.userMessage);
      setRecoveryActions(getErrorRecoveryActions(paymentError));
      onError(paymentError.userMessage);
      
      toast({
        title: 'Payment Error',
        description: paymentError.userMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleElementsChange = (event: any) => {
    setIsComplete(event.complete);
    if (event.error) {
      setErrorMessage(getStripeErrorMessage(event.error));
    } else {
      setErrorMessage('');
    }
  };

  const getPaymentStatusMessage = (status?: string): string => {
    switch (status) {
      case 'processing':
        return 'Your payment is being processed. Please wait...';
      case 'requires_payment_method':
        return 'Please provide a valid payment method.';
      case 'requires_confirmation':
        return 'Please confirm your payment.';
      case 'requires_action':
        return 'Additional authentication is required.';
      case 'canceled':
        return 'Payment was canceled.';
      default:
        return 'Payment could not be completed. Please try again.';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Setting up payment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <PaymentElement
                  onChange={handleElementsChange}
                  options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
                  }}
                />
              </div>
            </div>

            {/* Address Element */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Address
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <AddressElement
                  options={{
                    mode: 'billing',
                    allowedCountries: ['US', 'CA', 'GB', 'AU'],
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
                {recoveryActions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Try these solutions:</p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {recoveryActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Security status indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className={`h-4 w-4 ${
              securityChecks.isSecure && securityChecks.pciCompliant 
                ? 'text-green-600' 
                : 'text-red-600'
            }`} />
            <span>
              {securityChecks.isSecure && securityChecks.pciCompliant
                ? 'Secure payment environment'
                : 'Security check in progress...'}
            </span>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !isComplete}
            className="w-full py-3 text-lg font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <Lock className="h-4 w-4 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;