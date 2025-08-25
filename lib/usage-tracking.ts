// Usage tracking and limits system
export interface UserPlan {
  type: 'free' | 'premium'
  monthlyLimit: number
  currentUsage: number
  resetDate: string
  features: string[]
}

export interface UsageRecord {
  id: string
  userId: string
  action: 'face_analysis' | 'ai_generation' | 'makeup_suggestion'
  timestamp: string
  planType: 'free' | 'premium'
}

export interface UsageLimits {
  free: {
    monthlyAnalyses: 3
    aiGenerations: 0
    features: ['basic_analysis', 'makeup_suggestions']
  }
  premium: {
    monthlyAnalyses: -1 // unlimited
    aiGenerations: -1 // unlimited
    features: ['basic_analysis', 'makeup_suggestions', 'ai_generation', 'advanced_analysis', 'history_save']
  }
}

export class UsageTracker {
  private static readonly STORAGE_KEY = 'makeup_ai_usage'
  private static readonly LIMITS: UsageLimits = {
    free: {
      monthlyAnalyses: 3,
      aiGenerations: 0,
      features: ['basic_analysis', 'makeup_suggestions']
    },
    premium: {
      monthlyAnalyses: -1,
      aiGenerations: -1,
      features: ['basic_analysis', 'makeup_suggestions', 'ai_generation', 'advanced_analysis', 'history_save']
    }
  }

  static getCurrentUserPlan(userId?: string): UserPlan {
    if (!userId) {
      return this.getDefaultFreePlan()
    }

    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
      if (stored) {
        const plan: UserPlan = JSON.parse(stored)
        
        // Check if we need to reset monthly usage
        const resetDate = new Date(plan.resetDate)
        const now = new Date()
        
        if (now >= resetDate) {
          return this.resetMonthlyUsage(plan, userId)
        }
        
        return plan
      }
    } catch (error) {
      console.error('Error loading user plan:', error)
    }

    return this.getDefaultFreePlan()
  }

  static getDefaultFreePlan(): UserPlan {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return {
      type: 'free',
      monthlyLimit: this.LIMITS.free.monthlyAnalyses,
      currentUsage: 0,
      resetDate: nextMonth.toISOString(),
      features: this.LIMITS.free.features
    }
  }

  static resetMonthlyUsage(plan: UserPlan, userId: string): UserPlan {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    const resetPlan: UserPlan = {
      ...plan,
      currentUsage: 0,
      resetDate: nextMonth.toISOString()
    }
    
    this.savePlan(resetPlan, userId)
    return resetPlan
  }

  static savePlan(plan: UserPlan, userId: string): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(plan))
    } catch (error) {
      console.error('Error saving user plan:', error)
    }
  }

  static canUseFeature(action: 'face_analysis' | 'ai_generation', userId?: string): {
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
  } {
    const plan = this.getCurrentUserPlan(userId)
    
    switch (action) {
      case 'face_analysis':
        if (plan.type === 'premium') {
          return { allowed: true }
        }
        
        if (plan.currentUsage >= plan.monthlyLimit) {
          return {
            allowed: false,
            reason: `月間利用制限（${plan.monthlyLimit}回）に達しました`,
            upgradeRequired: true
          }
        }
        
        return { allowed: true }
      
      case 'ai_generation':
        if (plan.type === 'premium') {
          return { allowed: true }
        }
        
        return {
          allowed: false,
          reason: 'AI画像生成はプレミアムプラン限定機能です',
          upgradeRequired: true
        }
      
      default:
        return { allowed: false, reason: '不明な機能です' }
    }
  }

  static recordUsage(action: 'face_analysis' | 'ai_generation' | 'makeup_suggestion', userId?: string): boolean {
    if (!userId) return false

    const plan = this.getCurrentUserPlan(userId)
    
    // Check if usage is allowed
    const canUse = this.canUseFeature(action as 'face_analysis' | 'ai_generation', userId)
    if (!canUse.allowed) {
      return false
    }

    // Record the usage
    const usageRecord: UsageRecord = {
      id: Date.now().toString(),
      userId,
      action,
      timestamp: new Date().toISOString(),
      planType: plan.type
    }

    // Update current usage count for billable actions
    if (action === 'face_analysis' && plan.type === 'free') {
      plan.currentUsage += 1
      this.savePlan(plan, userId)
    }

    // Save usage record (for analytics)
    this.saveUsageRecord(usageRecord)
    
    return true
  }

  static saveUsageRecord(record: UsageRecord): void {
    try {
      const records = this.getUsageHistory(record.userId)
      records.push(record)
      
      // Keep only last 100 records per user
      const recentRecords = records.slice(-100)
      localStorage.setItem(`${this.STORAGE_KEY}_history_${record.userId}`, JSON.stringify(recentRecords))
    } catch (error) {
      console.error('Error saving usage record:', error)
    }
  }

  static getUsageHistory(userId: string): UsageRecord[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_history_${userId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading usage history:', error)
    }
    return []
  }

  static getRemainingUsage(userId?: string): {
    analyses: number
    aiGenerations: number
    daysUntilReset: number
  } {
    const plan = this.getCurrentUserPlan(userId)
    
    const resetDate = new Date(plan.resetDate)
    const now = new Date()
    const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      analyses: plan.type === 'premium' ? -1 : Math.max(0, plan.monthlyLimit - plan.currentUsage),
      aiGenerations: plan.type === 'premium' ? -1 : 0,
      daysUntilReset: Math.max(0, daysUntilReset)
    }
  }

  static upgradeToPremium(userId: string): UserPlan {
    const currentPlan = this.getCurrentUserPlan(userId)
    
    const premiumPlan: UserPlan = {
      type: 'premium',
      monthlyLimit: -1, // unlimited
      currentUsage: currentPlan.currentUsage,
      resetDate: currentPlan.resetDate,
      features: this.LIMITS.premium.features
    }
    
    this.savePlan(premiumPlan, userId)
    return premiumPlan
  }

  static downgradeToFree(userId: string): UserPlan {
    const freePlan = this.getDefaultFreePlan()
    this.savePlan(freePlan, userId)
    return freePlan
  }

  static getUsageStats(userId: string): {
    totalAnalyses: number
    thisMonth: number
    averagePerMonth: number
    planType: 'free' | 'premium'
  } {
    const history = this.getUsageHistory(userId)
    const plan = this.getCurrentUserPlan(userId)
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const totalAnalyses = history.filter(r => r.action === 'face_analysis').length
    const thisMonth = history.filter(r => {
      const recordDate = new Date(r.timestamp)
      return r.action === 'face_analysis' && recordDate >= thisMonthStart
    }).length
    
    // Calculate average (simplified - could be more sophisticated)
    const monthsOfData = Math.max(1, Math.ceil(history.length / 30)) // rough estimate
    const averagePerMonth = Math.round(totalAnalyses / monthsOfData)
    
    return {
      totalAnalyses,
      thisMonth,
      averagePerMonth,
      planType: plan.type
    }
  }

  static clearUserData(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`)
    localStorage.removeItem(`${this.STORAGE_KEY}_history_${userId}`)
  }
}