import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  cartItems: any[]
  customerEmail?: string
  customerName?: string
  userId: string
  metadata?: Record<string, string>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    )

    // Get the user from the request using anon key client
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await anonClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const {
      amount,
      currency = 'usd',
      cartItems,
      customerEmail,
      customerName,
      userId,
      metadata = {},
    }: CreatePaymentIntentRequest = await req.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart items are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create or retrieve Stripe customer
    let customer
    const email = customerEmail || user.email
    
    if (email) {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: email,
          name: customerName || user.user_metadata?.full_name || undefined,
          metadata: {
            userId: userId,
          },
        })
      }
    }

    // Prepare line items for receipt
    const lineItems = cartItems.map((item) => ({
      name: item.serviceName,
      provider: item.providerName || 'Unknown Provider',
      quantity: item.quantity,
      amount: Math.round(item.price * 100), // Convert to cents
    }))

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount should already be in cents
      currency: currency.toLowerCase(),
      customer: customer?.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        cartItemsCount: cartItems.length.toString(),
        lineItems: JSON.stringify(lineItems),
        ...metadata,
      },
      description: `Payment for ${cartItems.length} service(s)`,
      receipt_email: email,
    })

    // Store payment intent in database for tracking using service role client
    const { error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert({
        id: paymentIntent.id,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        stripe_customer_id: customer?.id,
        cart_items: cartItems,
        metadata: metadata,
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error storing payment intent:', dbError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})