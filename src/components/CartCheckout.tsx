import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';
import { CouponApplication } from '@/components/CouponApplication';
import { TaxCalculation } from '@/components/TaxCalculation';
import { PlatformFees } from '@/components/PlatformFees';
import { PaymentValidation } from '@/components/customer/PaymentValidation';
import { ShoppingCart, Plus, Minus, X, Shield, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  offerId: string;
}

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

export const CartCheckout: React.FC = () => {
  const { items, itemCount, totalAmount, updateQuantity, removeFromCart, isLoading, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [taxAmount, setTaxAmount] = useState(0);
  const [platformFees, setPlatformFees] = useState(0);
  const [showPaymentValidation, setShowPaymentValidation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = totalAmount;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = subtotal - couponDiscount;
  const finalTotal = subtotalAfterDiscount + taxAmount + platformFees;

  const handleCouponApplied = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon);
  };

  const handleTaxCalculated = (tax: number, taxDetails: any) => {
    setTaxAmount(tax);
  };

  const handleFeesCalculated = (fees: number) => {
    setPlatformFees(fees);
  };

  const handleProceedToCheckout = () => {
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

    setShowPaymentValidation(true);
  };

  const handleValidationComplete = async (validationData: ValidationData) => {
    try {
      setIsProcessing(true);
      console.log('Processing checkout with validation data:', validationData);
      
      // Create checkout session with all calculated amounts (amount already in cents from payment service)
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
          source: 'cart_checkout',
          user_id: user?.id || '',
          selected_address_id: validationData.selectedAddress?.id || '',
          subtotal: subtotal.toString(),
          coupon_code: appliedCoupon?.code || '',
          coupon_discount: couponDiscount.toString(),
          tax_amount: taxAmount.toString(),
          platform_fees: platformFees.toString(),
          final_total: finalTotal.toString(),
        },
      });

      if (result.success && result.url) {
        console.log('✅ Redirecting to Stripe checkout:', result.url);
        // Clear cart after successful checkout initiation
        await clearCart();
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to process checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowPaymentValidation(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Browse our services and add them to your cart to get started.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                <p className="text-muted-foreground mt-1">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{item.serviceName}</h4>
                            {item.providerName && (
                              <p className="text-sm text-muted-foreground">by {item.providerName}</p>
                            )}
                            <p className="text-lg font-bold text-primary mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {index < items.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Coupon Application */}
                <CouponApplication
                  subtotal={subtotal}
                  onCouponApplied={handleCouponApplied}
                  appliedCoupon={appliedCoupon}
                />
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {/* Coupon Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Platform Fees */}
                    <PlatformFees
                      subtotal={subtotalAfterDiscount}
                      onFeesCalculated={handleFeesCalculated}
                    />

                    {/* Tax Calculation */}
                    <TaxCalculation
                      subtotal={subtotalAfterDiscount + platformFees}
                      onTaxCalculated={handleTaxCalculated}
                    />

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">${finalTotal.toFixed(2)}</span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={isLoading || isProcessing}
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 mr-2" />
                      Secure 256-bit SSL encryption
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Validation Modal */}
      <PaymentValidation
        isOpen={showPaymentValidation}
        onClose={() => setShowPaymentValidation(false)}
        onValidationComplete={handleValidationComplete}
      />
    </>
  );
};