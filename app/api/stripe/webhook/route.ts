import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: any

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabase)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabase)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabase)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: any, supabase: any) {
  console.log('Checkout completed for session:', session.id)
  
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription)
  const priceId = subscription.items.data[0].price.id
  
  // Determine plan type from price ID
  let planType = 'premium'
  if (priceId.includes('yearly')) {
    planType = 'premium-yearly'
  }

  // Update user subscription in database
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      subscription_id: subscription.id,
      customer_id: session.customer,
      price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      created_at: new Date(),
      updated_at: new Date()
    })

  if (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: any, supabase: any) {
  console.log('Payment succeeded for invoice:', invoice.id)
  
  const subscriptionId = invoice.subscription
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  // Update subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .eq('subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating subscription after payment:', error)
  }
}

async function handlePaymentFailed(invoice: any, supabase: any) {
  console.log('Payment failed for invoice:', invoice.id)
  
  const subscriptionId = invoice.subscription
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  // Update subscription status to past_due
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .eq('subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating subscription after failed payment:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Subscription updated:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (!userId) return

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (!userId) return

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  }
}