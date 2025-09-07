import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the raw body
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Received webhook event:', event.type, event.id)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(supabaseClient, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(supabaseClient, paymentIntent)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentCanceled(supabaseClient, paymentIntent)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        await handleChargeDispute(supabaseClient, dispute)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(supabaseClient, invoice)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(supabaseClient, subscription, event.type)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    
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

// Handle successful payment intent
async function handlePaymentIntentSucceeded(
  supabaseClient: any,
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id)

    // Update payment intent status in database
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
    }

    // Update order status if exists
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
    }

    // Log the successful payment
    await supabaseClient
      .from('payment_logs')
      .insert({
        payment_intent_id: paymentIntent.id,
        event_type: 'payment_succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        created_at: new Date().toISOString(),
      })

    console.log('Successfully processed payment_intent.succeeded')
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error)
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(
  supabaseClient: any,
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id)

    // Update payment intent status
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
    }

    // Update order status if exists
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'payment_failed',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
    }

    // Log the failed payment
    await supabaseClient
      .from('payment_logs')
      .insert({
        payment_intent_id: paymentIntent.id,
        event_type: 'payment_failed',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
        metadata: paymentIntent.metadata,
        created_at: new Date().toISOString(),
      })

    console.log('Successfully processed payment_intent.payment_failed')
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error)
  }
}

// Handle canceled payment intent
async function handlePaymentIntentCanceled(
  supabaseClient: any,
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log('Processing payment_intent.canceled:', paymentIntent.id)

    // Update payment intent status
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
    }

    // Update order status if exists
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'canceled',
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
    }

    console.log('Successfully processed payment_intent.canceled')
  } catch (error) {
    console.error('Error handling payment_intent.canceled:', error)
  }
}

// Handle charge disputes
async function handleChargeDispute(
  supabaseClient: any,
  dispute: Stripe.Dispute
) {
  try {
    console.log('Processing charge.dispute.created:', dispute.id)

    // Log the dispute
    await supabaseClient
      .from('payment_disputes')
      .insert({
        dispute_id: dispute.id,
        charge_id: dispute.charge,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        evidence_due_by: new Date(dispute.evidence_details.due_by * 1000).toISOString(),
        created_at: new Date().toISOString(),
      })

    // Update related order if exists
    const { data: paymentIntent } = await supabaseClient
      .from('payment_intents')
      .select('*')
      .eq('id', dispute.payment_intent)
      .single()

    if (paymentIntent) {
      await supabaseClient
        .from('orders')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
    }

    console.log('Successfully processed charge.dispute.created')
  } catch (error) {
    console.error('Error handling charge.dispute.created:', error)
  }
}

// Handle invoice payment succeeded (for subscriptions)
async function handleInvoicePaymentSucceeded(
  supabaseClient: any,
  invoice: Stripe.Invoice
) {
  try {
    console.log('Processing invoice.payment_succeeded:', invoice.id)

    // Log the invoice payment
    await supabaseClient
      .from('invoice_payments')
      .insert({
        invoice_id: invoice.id,
        customer_id: invoice.customer,
        subscription_id: invoice.subscription,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created_at: new Date().toISOString(),
      })

    console.log('Successfully processed invoice.payment_succeeded')
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error)
  }
}

// Handle subscription changes
async function handleSubscriptionChange(
  supabaseClient: any,
  subscription: Stripe.Subscription,
  eventType: string
) {
  try {
    console.log(`Processing ${eventType}:`, subscription.id)

    // Update or insert subscription record
    const { error } = await supabaseClient
      .from('subscriptions')
      .upsert({
        subscription_id: subscription.id,
        customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error updating subscription:', error)
    }

    console.log(`Successfully processed ${eventType}`)
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error)
  }
}