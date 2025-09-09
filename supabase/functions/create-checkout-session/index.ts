import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateCheckoutSessionRequest {
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
    }: CreateCheckoutSessionRequest = await req.json()

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

    // Create line items for Stripe Checkout
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.serviceName,
          description: `Service by ${item.providerName || 'Professional'}`,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Get the origin for success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer?.id,
      customer_email: customer?.id ? undefined : email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: {
        userId: userId,
        cartItemsCount: cartItems.length.toString(),
        ...metadata,
      },
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE'],
      },
    })

    // Store checkout session in database for tracking using service role client
    const { error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert({
        id: session.payment_intent as string,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method',
        client_secret: session.id, // Store session ID in client_secret field
        stripe_customer_id: customer?.id,
        cart_items: cartItems,
        metadata: {
          checkout_session_id: session.id,
          ...metadata
        },
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error storing checkout session:', dbError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        paymentIntentId: session.payment_intent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
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