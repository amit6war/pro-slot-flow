import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifySessionRequest {
  sessionId: string
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
    const { sessionId }: VerifySessionRequest = await req.json()

    // Validate required fields
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ 
          error: `Payment not completed. Status: ${session.payment_status}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get cart items from database
    const { data: paymentIntent } = await supabaseClient
      .from('payment_intents')
      .select('cart_items, amount')
      .eq('id', session.payment_intent)
      .single()

    const cartItems = paymentIntent?.cart_items || []
    const totalAmount = session.amount_total || 0

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        payment_intent_id: session.payment_intent as string,
        total_amount: totalAmount / 100, // Convert from cents
        currency: session.currency,
        status: 'confirmed',
        payment_status: 'paid',
        cart_items: cartItems,
        customer_info: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          billing_address: session.customer_details?.address,
          phone: session.customer_details?.phone,
        },
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '09:00:00',
        service_name: cartItems.length > 0 ? cartItems[0].serviceName : 'Service',
        provider_name: cartItems.length > 0 ? cartItems[0].providerName : 'Provider',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update payment intent status in database
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.payment_intent)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.id,
        totalAmount: totalAmount / 100,
        paymentStatus: 'paid',
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_details: session.customer_details,
        },
        message: 'Payment verified and order created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error verifying checkout session:', error)
    
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