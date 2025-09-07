import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    'Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.'
  );
}

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  currency: 'usd',
  country: 'US',
  // Payment method types to accept
  paymentMethodTypes: ['card'],
  // Stripe Elements appearance customization
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
      },
      '.Input:focus': {
        borderColor: '#0570de',
        boxShadow: '0 0 0 2px rgba(5, 112, 222, 0.1)',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
      },
    },
  },
  // Elements options
  elementsOptions: {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
  },
};

// Payment intent creation options
export const createPaymentIntentOptions = {
  currency: STRIPE_CONFIG.currency,
  automatic_payment_methods: {
    enabled: true,
  },
};

// Utility function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format amount for display
export const formatAmountForDisplay = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

// Error messages mapping
export const STRIPE_ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Your card\'s security code is incorrect.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  incorrect_number: 'Your card number is incorrect.',
  incomplete_number: 'Your card number is incomplete.',
  incomplete_cvc: 'Your card\'s security code is incomplete.',
  incomplete_expiry: 'Your card\'s expiration date is incomplete.',
  invalid_expiry_month: 'Your card\'s expiration month is invalid.',
  invalid_expiry_year: 'Your card\'s expiration year is invalid.',
  generic_decline: 'Your card was declined. Please contact your bank for more information.',
};

// Get user-friendly error message
export const getStripeErrorMessage = (error: any): string => {
  if (error?.code && STRIPE_ERROR_MESSAGES[error.code as keyof typeof STRIPE_ERROR_MESSAGES]) {
    return STRIPE_ERROR_MESSAGES[error.code as keyof typeof STRIPE_ERROR_MESSAGES];
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};