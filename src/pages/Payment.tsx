import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import { paymentService } from '@/services/paymentService';
import { STRIPE_CONFIG } from '@/config/stripe';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

export default function Payment() {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [paymentIntent, setPaymentIntent] = useState<{
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  } | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  
  const [steps, setSteps] = useState<PaymentStep[]>([
    { id: 'review', title: 'Review Order', completed: true, current: false },
    { id: 'payment', title: 'Payment Details', completed: false, current: true },
    { id: 'confirmation', title: 'Confirmation', completed: false, current: false }
  ]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
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
        description: 'Your cart is empty. Please add items before proceeding to payment.',
        variant: 'destructive',
      });
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, itemCount, navigate, toast]);

  // Create payment intent when component mounts
  useEffect(() => {
    if (isAuthenticated && itemCount > 0 && !paymentIntent && !isCreatingPayment) {
      createPaymentIntent();
    }
  }, [isAuthenticated, itemCount, paymentIntent, isCreatingPayment]);

  const createPaymentIntent = async () => {
    setIsCreatingPayment(true);
    setPaymentError('');
    
    try {
      const result = await paymentService.createPaymentIntent({
        amount: totalAmount * 100, // Convert to cents for Stripe
        currency: STRIPE_CONFIG.currency,
        cartItems: items,
        customerEmail: user?.email,
        customerName: user?.user_metadata?.full_name || user?.email,
        metadata: {
          itemCount: itemCount.toString(),
          userId: user?.id || '',
        }
      });

      if (result.success && result.paymentIntent) {
        setPaymentIntent({
          id: result.paymentIntent.id,
          client_secret: result.paymentIntent.client_secret,
          amount: result.paymentIntent.amount,
          currency: result.paymentIntent.currency,
          status: result.paymentIntent.status
        });
      } else {
        setPaymentError(result.error || 'Failed to initialize payment');
        toast({
          title: 'Payment Setup Failed',
          description: result.error || 'Unable to initialize payment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setPaymentError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentResult: any) => {
    try {
      // Confirm payment and create order
      const result = await paymentService.confirmPayment(
        paymentIntentResult.id,
        items
      );

      if (result.success) {
        setPaymentSuccess(true);
        setOrderId(result.orderId || '');
        
        // Update steps
        setSteps(prev => prev.map(step => ({
          ...step,
          completed: true,
          current: step.id === 'confirmation'
        })));

        // Clear cart
        await clearCart();

        toast({
          title: 'Payment Successful!',
          description: 'Your order has been confirmed. Redirecting to orders page...',
        });

        // Redirect to orders page after a delay
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to confirm payment');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Failed to process payment confirmation');
      toast({
        title: 'Payment Confirmation Failed',
        description: error.message || 'Please contact support if payment was charged.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleRetryPayment = () => {
    setPaymentIntent(null);
    setPaymentError('');
    createPaymentIntent();
  };

  // Show loading state while creating payment intent
  if (isCreatingPayment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Setting up your payment...</h2>
                <p className="text-gray-600">Please wait while we prepare your secure payment form.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Show success state
  if (paymentSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
                {orderId && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600">Order ID:</p>
                    <p className="font-mono text-lg font-semibold">{orderId}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <Button onClick={() => navigate('/orders')} className="w-full sm:w-auto">
                    View My Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="w-full sm:w-auto ml-0 sm:ml-4"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cart')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely with Stripe</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.current 
                        ? 'bg-primary border-primary text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              {paymentError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{paymentError}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetryPayment}
                      className="ml-4"
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {paymentIntent?.client_secret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret: paymentIntent.client_secret,
                    appearance: STRIPE_CONFIG.appearance,
                    loader: 'auto',
                  }}
                >
                  <StripePaymentForm
                    clientSecret={paymentIntent.client_secret}
                    amount={totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Payment Setup Required
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Unable to initialize payment form. Please try again.
                    </p>
                    <Button onClick={handleRetryPayment}>
                      Initialize Payment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.serviceName}</h4>
                          {item.providerName && (
                            <p className="text-xs text-gray-500">by {item.providerName}</p>
                          )}
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Qty: {item.quantity}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                      <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      <span>Secured by Stripe • SSL Encrypted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}