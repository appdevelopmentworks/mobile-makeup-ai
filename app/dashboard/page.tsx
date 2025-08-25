'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Sparkles, History, Settings, Star, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()

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
    <MainLayout 
      isAuthenticated={true}
      isPremium={false}
      user={user ? {
        id: user.id,
        name: user.user_metadata?.name,
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url
      } : undefined}
      showFooter={false}
      className="bg-gradient-to-br from-pink-50 via-white to-purple-50"
    >
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-lg sm:max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              MakeupAI
            </h1>
          </div>
          <p className="text-gray-600">
            あなたに最適なメイクを提案
          </p>
        </div>

        {/* Usage Stats Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle>今月の利用状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-3xl font-bold text-pink-500">1/3</div>
                <p className="text-sm text-gray-600">利用回数</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">無料プラン</p>
                <Link href="/pricing" className="text-sm text-pink-600 hover:underline">
                  アップグレード →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Analysis Button */}
        <div className="mb-4 sm:mb-6">
          <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 h-12 sm:h-14 text-base sm:text-lg" size="lg">
            <Link href="/upload">
              <Upload className="mr-2 h-5 w-5" />
              メイク分析を始める
            </Link>
          </Button>
        </div>

        {/* Today's Trend Card */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Star className="h-5 w-5 text-yellow-600" />
              今月のトレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              韓国風グラデーションリップが人気！
            </p>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle>クイックアクセス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button variant="outline" asChild>
                <Link href="/history">
                  <History className="mr-2 h-4 w-4" />
                  履歴
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trends">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  トレンド
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tutorial">
                  <Sparkles className="mr-2 h-4 w-4" />
                  使い方
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">まだ分析履歴がありません</p>
              <p className="text-xs sm:text-sm mt-2">最初の分析を始めてみましょう！</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}