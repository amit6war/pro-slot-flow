import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';
import { STRIPE_CONFIG } from '@/config/stripe';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function CheckoutRedirect() {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

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

  const createCheckoutSession = async () => {
    setIsCreatingCheckout(true);
    setCheckoutError('');
    
    try {
      const result = await paymentService.createCheckoutSession({
        amount: totalAmount,
        currency: STRIPE_CONFIG.currency,
        cartItems: items,
        customerEmail: user?.email,
        customerName: user?.user_metadata?.full_name || user?.email,
        metadata: {
          itemCount: itemCount.toString(),
          userId: user?.id || '',
        }
      });

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error || 'Failed to create checkout session');
        toast({
          title: 'Checkout Failed',
          description: result.error || 'Unable to create checkout session. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setCheckoutError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleRetryCheckout = () => {
    setCheckoutError('');
    createCheckoutSession();
  };

  // Show loading state while creating checkout
  if (isCreatingCheckout) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Redirecting to secure checkout...</h2>
                <p className="text-gray-600">Please wait while we prepare your payment session.</p>
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
        <div className="max-w-4xl mx-auto">
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
            <p className="text-gray-600">You will be redirected to Stripe's secure payment page</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Action */}
            <div className="lg:col-span-1">
              {checkoutError && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800">Checkout Error</h3>
                        <p className="text-red-600">{checkoutError}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRetryCheckout}
                        className="ml-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Proceed to Secure Payment
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Click below to be redirected to Stripe's secure payment page where you can complete your purchase safely.
                  </p>
                  
                  <div className="space-y-4">
                    <Button 
                      onClick={createCheckoutSession}
                      className="w-full py-4 text-lg font-semibold"
                      size="lg"
                      disabled={isCreatingCheckout}
                    >
                      {isCreatingCheckout ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating Checkout Session...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Continue to Payment
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Powered by Stripe • Your data is secure</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Summary
                  </h3>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.serviceName}</h4>
                          {item.providerName && (
                            <p className="text-xs text-gray-500">by {item.providerName}</p>
                          )}
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}