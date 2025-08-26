'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Download,
  Loader2,
  X,
  Hash
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { DatabaseService } from '@/lib/database'
import { ExportManager } from '@/components/export/export-manager'
import type { HistoryItem, HistoryFilters, UserStats } from '@/types/history'

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: 'all',
    searchQuery: ''
  })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  // Load history data when user is available
  useEffect(() => {
    const loadHistoryData = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        // Load analysis history
        const history = await DatabaseService.getAnalysisHistory(user.id, 50)
        
        // Convert database records to HistoryItem format
        const historyItems: HistoryItem[] = history.map(record => ({
          id: record.id,
          userId: record.user_id,
          date: record.created_at,
          thumbnailUrl: record.original_image_data || '/placeholder-face.jpg',
          imageUrl: record.original_image_data || '/placeholder-face.jpg',
          styleName: getStyleName(record.analysis_type, record.occasion),
          selectedStyle: 'natural', // Default style
          faceShape: getFaceShapeDisplay(record.face_analysis?.faceShape),
          skinTone: getSkinToneDisplay(record.face_analysis?.skinTone),
          confidence: Math.round((record.face_analysis?.confidence || 0.9) * 100),
          tags: getTags(record),
          isFavorite: (record.face_analysis as any)?.favorite || false,
          generatedImage: null, // TODO: Load generated images
          createdAt: record.created_at,
          updatedAt: record.created_at
        }))

        setHistoryItems(historyItems)
        
        // Generate search suggestions from all data
        const suggestions = new Set<string>()
        historyItems.forEach(item => {
          // Add style names
          suggestions.add(item.styleName)
          // Add face shapes
          suggestions.add(item.faceShape)
          // Add skin tones
          suggestions.add(item.skinTone)
          // Add tags
          item.tags?.forEach(tag => suggestions.add(tag))
        })
        setSearchSuggestions(Array.from(suggestions).filter(s => s !== '未分析'))

        // Load user stats
        const stats = await DatabaseService.getUserStats(user.id)
        setUserStats({
          totalAnalyses: stats.totalAnalyses,
          currentMonthUsage: stats.thisMonthAnalyses,
          monthlyLimit: 3, // Default for free users
          favoriteCount: 0, // TODO: Implement favorites
          mostUsedStyle: stats.favoriteFeatures[0] || '自然メイク',
          joinedDate: new Date().toISOString() // TODO: Get actual join date
        })

      } catch (error) {
        console.error('Failed to load history:', error)
        toast({
          variant: 'destructive',
          title: '履歴の読み込みに失敗',
          description: 'データの取得中にエラーが発生しました。'
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadHistoryData()
    }
  }, [user?.id, authLoading, toast])

  // Helper functions
  const getStyleName = (analysisType: string, occasion?: string): string => {
    if (occasion) {
      const occasionMap: Record<string, string> = {
        daily: 'デイリーメイク',
        business: 'ビジネスメイク',
        party: 'パーティーメイク',
        date: 'デートメイク'
      }
      return occasionMap[occasion] || 'カスタムメイク'
    }
    
    const typeMap: Record<string, string> = {
      standard: 'スタンダード分析',
      quick: 'クイック分析',
      detailed: '詳細分析'
    }
    return typeMap[analysisType] || 'メイク分析'
  }

  const getFaceShapeDisplay = (faceShape?: string): string => {
    const shapeMap: Record<string, string> = {
      oval: '卵型',
      round: '丸型',
      square: '四角型',
      heart: 'ハート型',
      oblong: '面長型'
    }
    return shapeMap[faceShape || ''] || '未分析'
  }

  const getSkinToneDisplay = (skinTone?: string): string => {
    const toneMap: Record<string, string> = {
      light: '明るめ',
      medium: '標準',
      dark: '濃いめ',
      deep: '深め'
    }
    return toneMap[skinTone || ''] || '未分析'
  }

  const getTags = (record: any): string[] => {
    const tags: string[] = []
    if (record.analysis_type === 'detailed') tags.push('詳細分析')
    if (record.occasion) tags.push(record.occasion)
    if (record.face_analysis?.confidence > 0.9) tags.push('高精度')
    return tags
  }

  // Enhanced search handler
  const handleSearchChange = (value: string) => {
    setFilters({...filters, searchQuery: value})
    setShowSuggestions(value.length > 0)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFilters({...filters, searchQuery: suggestion})
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setFilters({...filters, searchQuery: ''})
    setShowSuggestions(false)
  }

  const getSearchResultsText = (): string => {
    if (!filters.searchQuery) return `${filteredItems.length}件の結果`
    
    const activeFilters = []
    if (filters.searchQuery) activeFilters.push(`"${filters.searchQuery}"`)
    if (filters.favorites) activeFilters.push('お気に入り')
    if (filters.faceShape) activeFilters.push(`顔型: ${filters.faceShape}`)
    if (filters.dateRange !== 'all') {
      const dateLabels = {
        week: '1週間以内',
        month: '1ヶ月以内', 
        quarter: '3ヶ月以内',
        year: '1年以内'
      }
      activeFilters.push(dateLabels[filters.dateRange as keyof typeof dateLabels] || filters.dateRange)
    }

    return `${filteredItems.length}件の結果 (${activeFilters.join(', ')})`
  }

  // Enhanced filter and search logic
  const filteredItems = useMemo(() => {
    let filtered = [...historyItems]

    // Enhanced search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const queryTerms = query.split(' ').filter(term => term.length > 0)
      
      filtered = filtered.filter(item => {
        const searchableText = [
          item.styleName,
          item.faceShape,
          item.skinTone,
          ...(item.tags || []),
          new Date(item.createdAt).toLocaleDateString('ja-JP'),
          new Date(item.createdAt).toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        ].join(' ').toLowerCase()

        // Support multiple search terms (AND logic)
        return queryTerms.every(term => searchableText.includes(term))
      })
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

  const handleToggleFavorite = async (id: string) => {
    if (!user?.id) return

    try {
      const success = await DatabaseService.toggleFavorite(id, user.id)
      
      if (success) {
        // Update local state
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
      } else {
        throw new Error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'お気に入りの更新に失敗しました。',
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!user?.id) return

    try {
      const success = await DatabaseService.deleteAnalysis(id, user.id)
      
      if (success) {
        setHistoryItems(items => items.filter(item => item.id !== id))
        toast({
          title: '分析結果を削除しました',
          description: '履歴から削除されました。',
        })
      } else {
        throw new Error('削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: 'destructive',
        title: '削除エラー',
        description: '分析結果の削除に失敗しました。',
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0 || !user?.id) return

    try {
      // Delete each selected item
      const deletePromises = selectedItems.map(id => 
        DatabaseService.deleteAnalysis(id, user.id)
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(result => result).length
      
      // Remove successfully deleted items from UI
      if (successCount > 0) {
        setHistoryItems(items => items.filter(item => !selectedItems.includes(item.id)))
        setSelectedItems([])
        
        toast({
          title: `${successCount}件の分析結果を削除しました`,
          description: successCount < selectedItems.length ? 
            `${selectedItems.length - successCount}件の削除に失敗しました。` : 
            '削除された結果は復元できません。',
        })
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        variant: 'destructive',
        title: '一括削除エラー',
        description: '選択した項目の削除に失敗しました。',
      })
    }
  }

  const handleViewItem = (id: string) => {
    // Navigate to analysis results page with the specific analysis
    window.location.href = `/analysis/results?id=${id}`
  }

  const handleBulkDelete = async () => {
    await handleDeleteSelected()
  }


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">履歴を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">ログインが必要です</p>
            <Button asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
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
              <div className="text-2xl font-bold">{userStats?.totalAnalyses || 0}</div>
              <p className="text-sm text-gray-600">総分析回数</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {userStats?.currentMonthUsage || 0}
              </div>
              <p className="text-sm text-gray-600">今月の分析</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats?.favoriteCount || 0}</div>
              <p className="text-sm text-gray-600">お気に入り</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-bold truncate">{userStats?.mostUsedStyle || '未設定'}</div>
              <p className="text-sm text-gray-600">好きなスタイル</p>
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
                  placeholder="スタイル、顔型、肌色、日付で検索..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-8"
                />
                {filters.searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {searchSuggestions
                      .filter(suggestion => 
                        suggestion.toLowerCase().includes(filters.searchQuery?.toLowerCase() || '')
                      )
                      .slice(0, 8)
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Hash className="h-3 w-3 text-gray-400" />
                          {suggestion}
                        </button>
                      ))
                    }
                  </div>
                )}
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">
              {getSearchResultsText()}
            </span>
            {selectedItems.length > 0 && (
              <Badge variant="secondary">
                {selectedItems.length}件選択中
              </Badge>
            )}
            
            {/* Active filters display */}
            <div className="flex gap-1">
              {filters.searchQuery && (
                <Badge variant="outline" className="text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  検索中
                </Badge>
              )}
              {filters.favorites && (
                <Badge variant="outline" className="text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  お気に入り
                </Badge>
              )}
            </div>
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
              onClick={() => document.getElementById('export-section')?.scrollIntoView({ behavior: 'smooth' })}
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

        {/* Export Section */}
        <div id="export-section" className="mb-8">
          <ExportManager
            historyItems={filteredItems}
            userStats={userStats || {
              totalAnalyses: 0,
              currentMonthUsage: 0,
              monthlyLimit: 3,
              favoriteCount: 0,
              mostUsedStyle: '未設定',
              joinedDate: new Date().toISOString()
            }}
            userName={user?.user_metadata?.name || user?.email}
          />
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
              <div className="text-gray-500 mb-6">
                {filters.searchQuery || filters.favorites || filters.faceShape || filters.dateRange !== 'all' ? (
                  <div className="space-y-2">
                    <p>検索条件を変更して再度お試しください。</p>
                    {filters.searchQuery && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm">
                          検索候補: {searchSuggestions.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>写真をアップロードして最初の分析を始めましょう。</p>
                )}
              </div>
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