import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfirmPaymentRequest {
  paymentIntentId: string
  cartItems: any[]
  userId: string
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

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
    const { paymentIntentId, cartItems, userId }: ConfirmPaymentRequest = await req.json()

    // Validate required fields
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'Payment intent ID is required' }),
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

    // Retrieve payment intent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ 
          error: `Payment not completed. Status: ${paymentIntent.status}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        payment_intent_id: paymentIntentId,
        total_amount: totalAmount,
        currency: paymentIntent.currency,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'stripe',
        items: cartItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    // Create individual order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      service_id: item.serviceId,
      service_name: item.serviceName,
      provider_id: item.providerId,
      provider_name: item.providerName,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      service_details: item.serviceDetails || {},
      created_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Don't fail the request, just log the error
    }

    // Update payment intent status in database
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'succeeded',
        order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntentId)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
      // Don't fail the request, just log the error
    }

    // Clear user's cart items
    const { error: clearCartError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (clearCartError) {
      console.error('Error clearing cart:', clearCartError)
      // Don't fail the request, just log the error
    }

    // Send confirmation email (optional - implement if needed)
    // await sendOrderConfirmationEmail(user.email, order)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.id,
        totalAmount: totalAmount,
        paymentStatus: 'paid',
        message: 'Payment confirmed and order created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error confirming payment:', error)
    
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