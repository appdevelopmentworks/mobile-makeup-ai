'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Check, 
  X, 
  Sparkles,
  Zap,
  Star,
  Gift
} from 'lucide-react'
import { UsageTracker } from '@/lib/usage-tracking'
import { useToast } from '../../hooks/use-toast'
import { stripeService } from '@/lib/stripe'

interface PlanManagementProps {
  userId: string
  onPlanChange?: (newPlan: 'free' | 'premium') => void
}

export function PlanManagement({ userId, onPlanChange }: PlanManagementProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(() => 
    UsageTracker.getCurrentUserPlan(userId)
  )
  const { toast } = useToast()

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    
    try {
      // For demo purposes, upgrade locally without payment
      if (!stripeService.isConfigured()) {
        const newPlan = UsageTracker.upgradeToPremium(userId)
        setCurrentPlan(newPlan)
        onPlanChange?.('premium')
        
        toast({
          title: '🎉 プレミアムプランへようこそ！',
          description: '無制限で全ての機能をお楽しみください（デモ版）',
        })
        return
      }

      // In production, redirect to Stripe Checkout
      // This would be handled by the pricing page
      toast({
        title: '決済ページへ移動',
        description: '料金プランページで決済を完了してください',
      })
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'アップグレードに失敗しました',
        description: '後ほど再度お試しください',
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleDowngrade = () => {
    const newPlan = UsageTracker.downgradeToFree(userId)
    setCurrentPlan(newPlan)
    onPlanChange?.('free')
    
    toast({
      title: 'フリープランに変更しました',
      description: '月間3回まで利用可能です',
    })
  }

  const isPremium = currentPlan.type === 'premium'

  const features = {
    free: [
      { name: '顔分析', available: true, limit: '月3回まで' },
      { name: 'メイク提案', available: true, limit: '基本提案' },
      { name: 'AI画像生成', available: false, limit: 'プレミアム限定' },
      { name: '履歴保存', available: false, limit: 'プレミアム限定' },
      { name: '詳細分析', available: false, limit: 'プレミアム限定' }
    ],
    premium: [
      { name: '顔分析', available: true, limit: '無制限' },
      { name: 'メイク提案', available: true, limit: '高度な提案' },
      { name: 'AI画像生成', available: true, limit: '無制限' },
      { name: '履歴保存', available: true, limit: '無制限' },
      { name: '詳細分析', available: true, limit: '全機能' },
      { name: '優先サポート', available: true, limit: '24時間以内' },
      { name: '新機能先行利用', available: true, limit: 'β機能アクセス' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className={`${isPremium ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isPremium ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    プレミアムプラン
                  </span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-blue-600" />
                  フリープラン
                </>
              )}
            </CardTitle>
            <Badge variant={isPremium ? "default" : "secondary"}>
              {isPremium ? 'PREMIUM' : 'FREE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plan Comparison */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">プラン比較</h3>
              
              {/* Free Plan Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">フリープラン</span>
                  {!isPremium && <Badge variant="outline" className="text-xs">現在のプラン</Badge>}
                </div>
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {feature.available ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={feature.available ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                    <span className="text-xs text-gray-500">({feature.limit})</span>
                  </div>
                ))}
              </div>

              {/* Premium Plan Features */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">プレミアムプラン</span>
                  {isPremium && <Badge className="text-xs">現在のプラン</Badge>}
                </div>
                {features.premium.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">{feature.name}</span>
                    <span className="text-xs text-gray-500">({feature.limit})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Panel */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">プラン管理</h3>
              
              {!isPremium ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">プレミアム特典</span>
                    </div>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>✨ 分析回数無制限</li>
                      <li>🎨 AI画像生成機能</li>
                      <li>📊 詳細分析レポート</li>
                      <li>💾 履歴の永久保存</li>
                    </ul>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isUpgrading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          アップグレード中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          プレミアムにアップグレード
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Gift className="h-4 w-4" />
                      <span className="text-sm font-medium">デモ版特別価格: 無料</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      このデモでは無料でプレミアム機能をお試しいただけます
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">プレミアム会員</span>
                    </div>
                    <p className="text-sm text-green-800">
                      全ての機能を無制限でご利用いただけます！
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/50 p-3 rounded-lg text-center">
                      <div className="font-semibold text-gray-900">∞</div>
                      <div className="text-gray-600">分析回数</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg text-center">
                      <div className="font-semibold text-gray-900">∞</div>
                      <div className="text-gray-600">AI生成</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleDowngrade}
                    className="w-full"
                  >
                    フリープランに戻す
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}