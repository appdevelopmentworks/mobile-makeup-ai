'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Zap, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { UsageTracker, UserPlan } from '@/lib/usage-tracking'

interface UsageDisplayProps {
  userId?: string
  onUpgradeClick?: () => void
  showUpgradeButton?: boolean
  compact?: boolean
}

export function UsageDisplay({ 
  userId, 
  onUpgradeClick, 
  showUpgradeButton = true,
  compact = false 
}: UsageDisplayProps) {
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [remaining, setRemaining] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const updateUsageData = () => {
      const currentPlan = UsageTracker.getCurrentUserPlan(userId)
      const remainingUsage = UsageTracker.getRemainingUsage(userId)
      const usageStats = userId ? UsageTracker.getUsageStats(userId) : null

      setPlan(currentPlan)
      setRemaining(remainingUsage)
      setStats(usageStats)
    }

    updateUsageData()

    // Update every minute to keep countdown accurate
    const interval = setInterval(updateUsageData, 60000)
    return () => clearInterval(interval)
  }, [userId])

  if (!plan || !remaining) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
        </CardContent>
      </Card>
    )
  }

  const isPremium = plan.type === 'premium'
  const analysesUsed = plan.currentUsage
  const analysesLimit = plan.monthlyLimit
  const usagePercentage = isPremium ? 0 : (analysesUsed / analysesLimit) * 100

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Badge variant={isPremium ? "default" : "secondary"} className="flex items-center gap-1">
          {isPremium ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {isPremium ? 'プレミアム' : 'フリープラン'}
        </Badge>
        
        {!isPremium && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>残り {remaining.analyses}回</span>
            {remaining.analyses === 0 && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`overflow-hidden ${isPremium ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
        <CardHeader className="pb-3">
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

        <CardContent className="space-y-4">
          {/* Usage Progress */}
          {!isPremium && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">月間利用状況</span>
                <span className="font-medium">
                  {analysesUsed}/{analysesLimit}回使用
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-2"
                // @ts-ignore
                indicatorClassName={usagePercentage > 80 ? "bg-red-500" : usagePercentage > 60 ? "bg-yellow-500" : "bg-green-500"}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>残り {remaining.analyses}回</span>
                <span>{remaining.daysUntilReset}日後にリセット</span>
              </div>
            </div>
          )}

          {/* Premium Features */}
          {isPremium && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">今月の利用</span>
                <span className="font-medium text-green-600">無制限</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-gray-900">∞</div>
                  <div className="text-gray-600">分析回数</div>
                </div>
                <div className="bg-white/50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-gray-900">∞</div>
                  <div className="text-gray-600">AI生成</div>
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats */}
          {stats && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">利用統計</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{stats.thisMonth}回</div>
                  <div className="text-gray-600">今月</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{stats.totalAnalyses}回</div>
                  <div className="text-gray-600">累計</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {!isPremium && remaining.analyses === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  月間制限に達しました
                </span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                {remaining.daysUntilReset}日後に利用回数がリセットされます
              </p>
            </motion.div>
          )}

          {/* Upgrade Button */}
          {!isPremium && showUpgradeButton && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={onUpgradeClick}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                プレミアムにアップグレード
              </Button>
            </motion.div>
          )}

          {/* Next Reset */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <Calendar className="h-3 w-3" />
            <span>次回リセット: {remaining.daysUntilReset}日後</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}