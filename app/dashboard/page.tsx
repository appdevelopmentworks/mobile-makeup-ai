'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, Badge } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/components/providers/auth-provider'
import { Camera, History, Settings, Sparkles, TrendingUp, Crown } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [usageCount] = useState(1)
  const maxFreeUsage = 3

  return (
    <MainLayout 
      isAuthenticated={true} 
      user={user ? {
        id: user.id,
        name: user.user_metadata?.name,
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url
      } : undefined}
      showHeader={false}
      showFooter={false}
      showBottomNav={true}
    >
      {/* Mobile Dashboard */}
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-12 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">MakeupAI</h1>
          </div>
          <p className="text-pink-100 text-sm">あなたに最適なメイクを提案</p>
        </motion.div>

        {/* Content */}
        <div className="p-4 pb-24 space-y-4">
          {/* Usage Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">今月の利用状況</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {usageCount}
                      </span>
                      <span className="text-lg text-gray-400">/ {maxFreeUsage}</span>
                      <span className="text-sm text-gray-500 ml-1">回</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">利用回数</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-3 border-pink-200 text-pink-700">
                      無料プラン
                    </Badge>
                    <br />
                    <Link 
                      href="/pricing"
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium hover:underline transition-colors"
                    >
                      アップグレード →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button asChild className="w-full h-16 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
              <Link href="/upload" className="flex items-center gap-3">
                <Camera className="w-6 h-6" />
                <span className="font-semibold">メイク分析を始める</span>
              </Link>
            </Button>
          </motion.div>

          {/* Trend Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-start gap-3">
                  <motion.div
                    className="text-2xl"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    🌟
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-1">今月のトレンド</h3>
                    <p className="text-sm text-yellow-800">韓国風グラデーションリップが人気！</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-300/20 rounded-full -translate-y-8 translate-x-8"></div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  クイックアクセス
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: "/history", icon: History, label: "履歴", emoji: "📋" },
                    { href: "/upload", icon: TrendingUp, label: "トレンド", emoji: "🎨" },
                    { href: "/dashboard", icon: Sparkles, label: "使い方", emoji: "💡" },
                    { href: "/settings", icon: Settings, label: "設定", emoji: "⚙️" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button asChild variant="outline" className="h-14 flex-col gap-2 border-2 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200">
                        <Link href={item.href} className="w-full">
                          <span className="text-xl">{item.emoji}</span>
                          <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Promotion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-xl text-white overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Crown className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold mb-1">プレミアムで無制限利用</h3>
                    <p className="text-sm text-purple-100">今なら初月50%OFF！</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}