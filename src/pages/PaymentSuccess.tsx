import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';
import { 
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  ShoppingBag
} from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setVerificationError('No session ID found. Please contact support.');
      setIsVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams, isAuthenticated, navigate]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setIsVerifying(true);
      setVerificationError('');

      const result = await paymentService.verifyCheckoutSession(sessionId);

      if (result.success) {
        setOrderDetails({
          orderId: result.orderId || '',
          totalAmount: 0 // Will be updated from the verification response
        });

        // Clear the cart
        await clearCart();

        toast({
          title: 'Payment Successful!',
          description: 'Your order has been confirmed.',
        });
      } else {
        setVerificationError(result.error || 'Failed to verify payment');
        toast({
          title: 'Payment Verification Failed',
          description: result.error || 'Please contact support if payment was charged.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setVerificationError(error.message || 'An unexpected error occurred');
      toast({
        title: 'Verification Error',
        description: error.message || 'Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Verifying your payment...</h2>
                <p className="text-gray-600">Please wait while we confirm your order.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (verificationError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-red-800 mb-4">Payment Verification Failed</h1>
                <p className="text-lg text-red-600 mb-6">
                  {verificationError}
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/orders')} 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Check My Orders
                  </Button>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="w-full sm:w-auto ml-0 sm:ml-4"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
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
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h1>
              <p className="text-lg text-green-600 mb-6">
                Thank you for your purchase. Your order has been confirmed.
              </p>
              
              {orderDetails && (
                <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-mono">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">Confirmed</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/orders')} 
                  className="w-full sm:w-auto"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View My Orders
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="w-full sm:w-auto ml-0 sm:ml-4"
                >
                  <Home className="h-4 w-4 mr-2" />
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