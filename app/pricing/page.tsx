'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlanManagement } from '@/components/usage/plan-management'
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Sparkles,
  Zap,
  Star,
  Shield,
  Users,
  Gift
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { stripeService, StripeService } from '@/lib/stripe'

interface PlanFeature {
  text: string
  included: boolean
}

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  period: string
  features: PlanFeature[]
  recommended?: boolean
  discount?: string
}

const pricingPlans: PricingPlan[] = StripeService.PLANS.map(stripePlan => ({
  id: stripePlan.id,
  name: stripePlan.name,
  description: stripePlan.id === 'free' ? 'まずはお試しから' : 
               stripePlan.id === 'premium' ? '制限なしで使い放題' : 
               'お得な年間プラン',
  price: stripePlan.price,
  currency: '¥',
  period: stripePlan.interval === 'month' ? '月' : '年',
  recommended: stripePlan.popular,
  discount: stripePlan.id === 'premium' ? '今なら初月50%OFF！' : undefined,
  features: stripePlan.features.map(feature => ({
    text: feature,
    included: true
  }))
}))

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // 無料プランは選択不要
      toast({
        title: '無料プランをご利用中',
        description: '既に無料プランを利用しています。',
      })
      return
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'ログインが必要です',
        description: 'プランを選択するにはログインしてください。',
      })
      router.push('/login')
      return
    }

    setSelectedPlan(planId)
    setProcessing(true)

    try {
      const plan = StripeService.getPlanById(planId)
      if (!plan || !plan.stripePriceId) {
        throw new Error('プランが見つかりません')
      }

      const successUrl = `${window.location.origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`

      const session = await stripeService.createPaymentSession(
        plan.stripePriceId,
        user.id,
        successUrl,
        cancelUrl
      )

      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url
      } else {
        throw new Error('決済セッションの作成に失敗しました')
      }

    } catch (error) {
      console.error('Payment session error:', error)
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : 'プランの選択に失敗しました。',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={user ? '/dashboard' : '/'}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  料金プラン
                </h1>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {user?.user_metadata?.name || user?.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            シンプルで分かりやすい料金プラン
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            あなたのニーズに合わせて最適なプランをお選びください
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.recommended 
                  ? 'border-2 border-pink-500 shadow-xl' 
                  : 'border-2'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-pink-500 text-white">
                    おすすめ
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  {plan.id === 'premium' ? (
                    <Crown className="h-8 w-8 text-purple-600" />
                  ) : (
                    <Zap className="h-8 w-8 text-pink-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">
                      {plan.currency}{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                  {plan.discount && (
                    <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                      <Gift className="h-3 w-3 mr-1" />
                      {plan.discount}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <span className="h-5 w-5 text-gray-300 flex-shrink-0 text-center">
                          ✕
                        </span>
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processing}
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                      : ''
                  }`}
                  variant={plan.recommended ? 'default' : 'outline'}
                  size="lg"
                >
                  {processing && selectedPlan === plan.id ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : plan.id === 'free' ? (
                    '現在のプラン'
                  ) : (
                    'プランを選択'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Offer Banner */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-12">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-900">
                期間限定オファー！
              </h3>
              <p className="text-yellow-800 max-w-2xl mx-auto">
                今なら初月50%OFFでプレミアムプランをお試しいただけます。
                <span className="font-bold">¥1,500</span>で全機能をお楽しみください。
              </p>
              <Button
                onClick={() => handleSelectPlan('premium')}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
              >
                今すぐお得に始める
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan Management */}
        {user && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">プラン管理</h3>
            <PlanManagement userId={user.id} />
          </div>
        )}

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <Card>
            <CardContent className="p-6">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">安全な決済</h3>
              <p className="text-sm text-gray-600">
                SSL暗号化により安全に決済
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">10万人以上が利用</h3>
              <p className="text-sm text-gray-600">
                多くのユーザーに選ばれています
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">満足度95%</h3>
              <p className="text-sm text-gray-600">
                高い満足度を誇るサービス
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">よくある質問</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">いつでも解約できますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  はい、いつでも解約可能です。解約手数料は一切かかりません。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">支払い方法は？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  クレジットカード、デビットカード、PayPalに対応しています。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">無料プランの制限は？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  月3回まで分析可能で、基本的な機能はすべて利用できます。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">プランの変更は可能？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  はい、いつでもプランのアップグレードやダウングレードが可能です。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}