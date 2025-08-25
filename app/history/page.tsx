'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { HistoryItemComponent } from '@/components/history/history-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Heart, 
  Calendar,
  BarChart3,
  Sparkles,
  Upload,
  Trash2,
  Download
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { mockHistoryItems, mockUserStats } from '@/types/history'
import type { HistoryItem, HistoryFilters, UserStats } from '@/types/history'

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(mockHistoryItems)
  const [userStats] = useState<UserStats>(mockUserStats)
  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: 'all',
    searchQuery: ''
  })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { user, loading } = useAuth()
  const { toast } = useToast()

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let filtered = [...historyItems]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.styleName.toLowerCase().includes(query) ||
        item.faceShape.toLowerCase().includes(query) ||
        item.skinTone.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(item => new Date(item.createdAt) >= cutoffDate)
    }

    // Face shape filter
    if (filters.faceShape) {
      filtered = filtered.filter(item => item.faceShape === filters.faceShape)
    }

    // Skin tone filter
    if (filters.skinTone) {
      filtered = filtered.filter(item => item.skinTone === filters.skinTone)
    }

    // Style filter
    if (filters.style) {
      filtered = filtered.filter(item => item.selectedStyle === filters.style)
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter(item => item.isFavorite)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [historyItems, filters])

  const handleToggleFavorite = (id: string) => {
    setHistoryItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    )
    
    const item = historyItems.find(item => item.id === id)
    toast({
      title: item?.isFavorite ? 'お気に入りから削除しました' : 'お気に入りに追加しました',
      description: item?.styleName,
    })
  }

  const handleDeleteItem = (id: string) => {
    setHistoryItems(items => items.filter(item => item.id !== id))
    toast({
      title: '分析結果を削除しました',
      description: '削除された結果は復元できません。',
    })
  }

  const handleViewItem = (_id: string) => {
    // TODO: Navigate to detailed view
    toast({
      title: '詳細表示',
      description: '詳細ページを開きます（実装予定）',
    })
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    setHistoryItems(items => items.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
    toast({
      title: `${selectedItems.length}件の分析結果を削除しました`,
      description: '削除された結果は復元できません。',
    })
  }

  const handleExportData = () => {
    // TODO: Implement data export
    toast({
      title: 'データをエクスポート',
      description: '分析履歴をCSVファイルでダウンロードします（実装予定）',
    })
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
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ダッシュボード
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  分析履歴
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {user?.user_metadata?.name || user?.email}
              </span>
              <Badge variant="secondary">無料プラン</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalAnalyses}</div>
              <p className="text-sm text-gray-600">総分析回数</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {userStats.currentMonthUsage}/{userStats.monthlyLimit}
              </div>
              <p className="text-sm text-gray-600">今月の使用</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.favoriteCount}</div>
              <p className="text-sm text-gray-600">お気に入り</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-bold truncate">{userStats.mostUsedStyle}</div>
              <p className="text-sm text-gray-600">人気スタイル</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              フィルター・検索
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="スタイル、顔型、肌色で検索..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({...filters, dateRange: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての期間</SelectItem>
                  <SelectItem value="week">過去1週間</SelectItem>
                  <SelectItem value="month">過去1ヶ月</SelectItem>
                  <SelectItem value="quarter">過去3ヶ月</SelectItem>
                  <SelectItem value="year">過去1年</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.faceShape || ''}
                onValueChange={(value) => setFilters({...filters, faceShape: value || undefined})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="顔型で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">すべての顔型</SelectItem>
                  <SelectItem value="卵型">卵型</SelectItem>
                  <SelectItem value="丸型">丸型</SelectItem>
                  <SelectItem value="四角型">四角型</SelectItem>
                  <SelectItem value="面長">面長</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={filters.favorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({...filters, favorites: !filters.favorites})}
                  className="flex-1"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  お気に入り
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredItems.length}件の結果
            </span>
            {selectedItems.length > 0 && (
              <Badge variant="secondary">
                {selectedItems.length}件選択中
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </Button>

            <Button size="sm" asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-1" />
                新しい分析
              </Link>
            </Button>
          </div>
        </div>

        {/* History List */}
        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <HistoryItemComponent
                key={item.id}
                item={item}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteItem}
                onView={handleViewItem}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filters.searchQuery || filters.favorites || filters.faceShape || filters.dateRange !== 'all'
                  ? '条件に一致する結果がありません'
                  : '分析履歴がありません'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.searchQuery || filters.favorites || filters.faceShape || filters.dateRange !== 'all'
                  ? 'フィルターを変更して再度お試しください。'
                  : '写真をアップロードして最初の分析を始めましょう。'
                }
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  新しい分析を開始
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}