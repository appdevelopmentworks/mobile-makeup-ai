'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // 認証済みユーザーはダッシュボードにリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

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

  // 未認証の場合、シンプルなウェルカム画面を表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl glass-card">
          <CardContent className="p-8 text-center">
            {/* Logo */}
            <motion.div
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                MakeupAI
              </h1>
              <p className="text-gray-700 text-lg mb-2 font-medium">
                あなただけのメイクアドバイザー
              </p>
              <p className="text-sm text-gray-500 mb-8">
                AIがあなたに最適なメイクを提案します
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  asChild 
                  className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  <Link href="/login" className="font-semibold">
                    ログイン
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full h-14 text-lg border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 rounded-xl transition-all duration-300"
                >
                  <Link href="/signup" className="font-semibold text-gray-700">
                    新規登録
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-xs text-gray-400 mb-4 font-medium">主な機能</p>
              <div className="flex justify-center gap-8 text-gray-600">
                {[
                  { icon: "📸", label: "分析" },
                  { icon: "💄", label: "提案" },
                  { icon: "🎨", label: "生成" }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-2xl block mb-2">{feature.icon}</span>
                    <span className="text-xs font-medium">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}