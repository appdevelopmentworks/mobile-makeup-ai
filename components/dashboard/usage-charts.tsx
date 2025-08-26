'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { CalendarDays, TrendingUp, Palette, Heart, Sparkles } from 'lucide-react'
import { DatabaseService } from '@/lib/database'

interface UsageChartsProps {
  userId: string
}

interface ChartData {
  dailyUsage: Array<{
    date: string
    analyses: number
    day: string
  }>
  featureUsage: Array<{
    name: string
    count: number
    color: string
  }>
  monthlyTrend: Array<{
    month: string
    analyses: number
    favorites: number
  }>
  stats: {
    totalAnalyses: number
    thisMonth: number
    favoriteCount: number
    streak: number
  }
}

// const COLORS = {
//   primary: '#ec4899',
//   secondary: '#8b5cf6',
//   accent: '#f59e0b',
//   success: '#10b981',
//   warning: '#f59e0b',
//   info: '#06b6d4'
// }

const FEATURE_COLORS = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4']

export function UsageCharts({ userId }: UsageChartsProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const [history, favorites, stats] = await Promise.all([
          DatabaseService.getAnalysisHistory(userId),
          DatabaseService.getFavoriteAnalyses(userId),
          DatabaseService.getUserStats(userId)
        ])

        // Process daily usage (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date
        }).reverse()

        const dailyUsage = last7Days.map(date => {
          const dayAnalyses = history.filter(h => {
            const hDate = new Date(h.created_at)
            return hDate.toDateString() === date.toDateString()
          }).length

          return {
            date: date.toISOString().split('T')[0],
            analyses: dayAnalyses,
            day: date.toLocaleDateString('ja-JP', { weekday: 'short' })
          }
        })

        // Process feature usage
        const featureMap = new Map()
        history.forEach(h => {
          if (h.face_analysis?.faceShape) {
            const shape = h.face_analysis.faceShape
            featureMap.set(shape, (featureMap.get(shape) || 0) + 1)
          }
        })

        const featureUsage = Array.from(featureMap.entries()).map(([name, count], index) => ({
          name: name === 'oval' ? '卵型' : 
                name === 'round' ? '丸型' : 
                name === 'square' ? '四角型' : 
                name === 'heart' ? 'ハート型' : 
                name === 'diamond' ? 'ダイヤ型' : name,
          count: count as number,
          color: FEATURE_COLORS[index % FEATURE_COLORS.length]
        })).slice(0, 5)

        // Process monthly trend (last 6 months)
        const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          const monthAnalyses = history.filter(h => {
            const hDate = new Date(h.created_at)
            return hDate >= monthStart && hDate <= monthEnd
          }).length

          const monthFavorites = favorites.filter(h => {
            const hDate = new Date(h.created_at)
            return hDate >= monthStart && hDate <= monthEnd
          }).length

          return {
            month: date.toLocaleDateString('ja-JP', { month: 'short' }),
            analyses: monthAnalyses,
            favorites: monthFavorites
          }
        }).reverse()

        // Calculate streak (consecutive days with analysis)
        let streak = 0
        let currentDate = new Date()
        
        while (streak < 30) { // Max 30 days check
          const hasAnalysis = history.some(h => {
            const hDate = new Date(h.created_at)
            return hDate.toDateString() === currentDate.toDateString()
          })
          
          if (hasAnalysis) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        setChartData({
          dailyUsage,
          featureUsage,
          monthlyTrend,
          stats: {
            totalAnalyses: stats.totalAnalyses,
            thisMonth: stats.thisMonthAnalyses,
            favoriteCount: favorites.length,
            streak
          }
        })
      } catch (error) {
        console.error('Failed to load chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadChartData()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!chartData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>データがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-xs opacity-90">総分析回数</p>
                  <p className="text-xl font-bold">{chartData.stats.totalAnalyses}回</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <div>
                  <p className="text-xs opacity-90">お気に入り</p>
                  <p className="text-xl font-bold">{chartData.stats.favoriteCount}件</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <div>
                  <p className="text-xs opacity-90">今月</p>
                  <p className="text-xl font-bold">{chartData.stats.thisMonth}回</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <p className="text-xs opacity-90">連続使用</p>
                  <p className="text-xl font-bold">{chartData.stats.streak}日</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-pink-500" />
              週間利用状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="analyses" 
                  fill="#ec4899" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Usage Chart */}
      {chartData.featureUsage.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Palette className="h-4 w-4 text-purple-500" />
                顔型分析結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.featureUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {chartData.featureUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {chartData.featureUsage.map((entry, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name} ({entry.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Monthly Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              月間トレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="analyses" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  name="分析回数"
                />
                <Line 
                  type="monotone" 
                  dataKey="favorites" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="お気に入り"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}