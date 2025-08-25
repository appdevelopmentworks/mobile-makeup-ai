'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/components/providers/auth-provider'

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold">MakeupAI</h1>
          <p className="text-pink-100 text-sm mt-1">あなたに最適なメイクを提案</p>
        </motion.div>

        {/* Content */}
        <div className="p-4 pb-24 space-y-4">
          {/* Usage Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">今月の利用状況</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-pink-600">{usageCount}</span>
                      <span className="text-gray-500">/ {maxFreeUsage}</span>
                      <span className="text-sm text-gray-400">回</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">利用回数</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">無料プラン</Badge>
                    <br />
                    <Link 
                      href="/pricing"
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium"
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
          >
            <Button asChild className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg">
              <Link href="/upload">
                📸 メイク分析を始める
              </Link>
            </Button>
          </motion.div>

          {/* Trend Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-0">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">今月のトレンド</h3>
                    <p className="text-sm text-yellow-800">韓国風グラデーションリップが人気！</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">クイックアクセス</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-12 flex-col gap-1">
                    <Link href="/history">
                      <span className="text-lg">📋</span>
                      <span className="text-xs">履歴</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 flex-col gap-1">
                    <Link href="/upload">
                      <span className="text-lg">🎨</span>
                      <span className="text-xs">トレンド</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 flex-col gap-1">
                    <Link href="/dashboard">
                      <span className="text-lg">💡</span>
                      <span className="text-xs">使い方</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 flex-col gap-1">
                    <Link href="/settings">
                      <span className="text-lg">⚙️</span>
                      <span className="text-xs">設定</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}