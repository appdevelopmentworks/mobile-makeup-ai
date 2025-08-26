import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

// Server-side Stripe (for API routes)
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2025-07-30.basil',
  }
)

// Enhanced pricing plan interface
export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  currency: string
  features: string[]
  stripePriceId: string
  popular?: boolean
  analysisLimit: number // -1 for unlimited
  generationLimit: number // -1 for unlimited
  aiEngines: string[] // Available AI engines
}

export interface PaymentSession {
  id: string
  url: string
  status: 'open' | 'complete' | 'expired'
}

export interface SubscriptionStatus {
  active: boolean
  planId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
}

export class StripeService {
  private publishableKey: string | null
  private secretKey: string | null
  private baseUrl = 'https://api.stripe.com/v1'

  constructor() {
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
    this.secretKey = process.env.STRIPE_SECRET_KEY || null
  }

  // Available pricing plans with enhanced features
  static readonly PLANS: PricingPlan[] = [
    {
      id: 'free',
      name: 'フリープラン',
      description: '基本機能をお試しください',
      price: 0,
      interval: 'month',
      currency: 'JPY',
      stripePriceId: '', // No Stripe price for free plan
      features: [
        '月3回まで顔分析',
        '基本メイク提案',
        'モックAI画像生成',
        '履歴保存（30日間）'
      ],
      analysisLimit: 3,
      generationLimit: 3,
      aiEngines: ['mock']
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      description: 'すべての機能を無制限に利用',
      price: 980,
      interval: 'month',
      currency: 'JPY',
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
      popular: true,
      features: [
        '無制限の顔分析',
        'AI画像生成（Google Imagen & DALL-E）',
        'MediaPipe高精度顔分析',
        '詳細メイク提案',
        '複数スタイル生成',
        '無制限履歴保存',
        '優先サポート'
      ],
      analysisLimit: -1,
      generationLimit: -1,
      aiEngines: ['google-imagen', 'openai-dalle', 'mock']
    },
    {
      id: 'premium-yearly',
      name: 'プレミアム年間プラン',
      description: '年間契約で2ヶ月分お得',
      price: 9800, // 2 months free
      interval: 'year',
      currency: 'JPY',
      stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_premium_yearly',
      features: [
        '無制限の顔分析',
        'AI画像生成（Google Imagen & DALL-E）',
        'MediaPipe高精度顔分析',
        '詳細メイク提案',
        '複数スタイル生成',
        '無制限履歴保存',
        '優先サポート',
        '年間20%割引'
      ],
      analysisLimit: -1,
      generationLimit: -1,
      aiEngines: ['google-imagen', 'openai-dalle', 'mock']
    }
  ]

  async createPaymentSession(
    priceId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PaymentSession> {
    if (!this.secretKey) {
      // Return mock session for development
      return this.createMockSession()
    }

    try {
      const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'subscription',
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'success_url': successUrl,
          'cancel_url': cancelUrl,
          'client_reference_id': userId,
          'locale': 'ja',
          'billing_address_collection': 'required',
          'payment_method_types[0]': 'card',
          'metadata[user_id]': userId,
        })
      })

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`)
      }

      const session = await response.json()
      
      return {
        id: session.id,
        url: session.url,
        status: session.status
      }

    } catch (error) {
      console.error('Stripe session creation error:', error)
      throw new Error('決済セッションの作成に失敗しました')
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    if (!this.secretKey) {
      // Return mock status for development
      return this.getMockSubscriptionStatus(userId)
    }

    try {
      // In a real implementation, you would:
      // 1. Get customer ID from your database using userId
      // 2. Fetch subscriptions from Stripe API
      // 3. Return the active subscription status
      
      const response = await fetch(`${this.baseUrl}/customers?email=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        }
      })

      if (!response.ok) {
        return null
      }

      const customers = await response.json()
      
      if (customers.data.length === 0) {
        return null
      }

      const customer = customers.data[0]
      
      const subscriptionsResponse = await fetch(`${this.baseUrl}/subscriptions?customer=${customer.id}&status=active`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        }
      })

      if (!subscriptionsResponse.ok) {
        return null
      }

      const subscriptions = await subscriptionsResponse.json()
      
      if (subscriptions.data.length === 0) {
        return null
      }

      const subscription = subscriptions.data[0]
      
      return {
        active: subscription.status === 'active',
        planId: this.getPlanIdFromStripePrice(subscription.items.data[0].price.id),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        status: subscription.status
      }

    } catch (error) {
      console.error('Subscription status error:', error)
      return null
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.secretKey) {
      // Mock cancellation success
      return true
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        }
      })

      return response.ok

    } catch (error) {
      console.error('Subscription cancellation error:', error)
      return false
    }
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{ url: string } | null> {
    if (!this.secretKey) {
      // Mock portal URL for development
      return { url: '/settings?portal=mock' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/billing_portal/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'customer': customerId,
          'return_url': returnUrl,
        })
      })

      if (!response.ok) {
        return null
      }

      const session = await response.json()
      return { url: session.url }

    } catch (error) {
      console.error('Customer portal error:', error)
      return null
    }
  }

  private createMockSession(): PaymentSession {
    return {
      id: 'cs_mock_' + Date.now(),
      url: '/pricing?success=mock',
      status: 'open'
    }
  }

  private getMockSubscriptionStatus(userId: string): SubscriptionStatus | null {
    // Mock: check if user has premium plan in localStorage
    try {
      const plan = localStorage.getItem(`makeup_ai_usage_${userId}`)
      if (plan) {
        const planData = JSON.parse(plan)
        if (planData.type === 'premium') {
          return {
            active: true,
            planId: 'premium',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            status: 'active'
          }
        }
      }
    } catch (error) {
      console.error('Mock subscription status error:', error)
    }
    
    return null
  }

  private getPlanIdFromStripePrice(stripePriceId: string): string {
    const plan = StripeService.PLANS.find(p => p.stripePriceId === stripePriceId)
    return plan?.id || 'premium'
  }

  // Utility methods
  static getPlanById(planId: string): PricingPlan | null {
    return this.PLANS.find(plan => plan.id === planId) || null
  }

  static formatPrice(price: number, currency: string = 'JPY'): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  isConfigured(): boolean {
    return !!(this.publishableKey && this.secretKey)
  }

  getPublishableKey(): string | null {
    return this.publishableKey
  }
}

// Singleton instance
export const stripeService = new StripeService()