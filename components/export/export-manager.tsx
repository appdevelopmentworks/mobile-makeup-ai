'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Share2,
  Copy,
  Mail,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { PDFExport } from './pdf-export'
import { CSVExport } from './csv-export'
import { useToast } from '../../hooks/use-toast'
import type { HistoryItem, UserStats } from '@/types/history'

interface ExportManagerProps {
  historyItems: HistoryItem[]
  userStats: UserStats
  userId: string
  userName?: string
  className?: string
}

export function ExportManager({ 
  historyItems, 
  userStats, 
  userName, 
  className = '' 
}: Omit<ExportManagerProps, 'userId'>) {
  const [activeTab, setActiveTab] = useState('download')
  const { toast } = useToast()

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/dashboard' : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'リンクをコピーしました',
        description: 'URLがクリップボードに保存されました',
      })
    } catch (error) {
      console.error('Copy link error:', error)
      toast({
        variant: 'destructive',
        title: 'コピーエラー',
        description: 'リンクのコピーに失敗しました',
      })
    }
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MakeupAI - 私のメイク分析結果',
          text: `${historyItems.length}回の分析でメイクが上達しました！`,
          url: shareUrl
        })
      } catch (error) {
        console.error('Native share error:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleShareEmail = () => {
    const subject = 'MakeupAI 分析結果共有'
    const body = `私はMakeupAIで${historyItems.length}回の顔分析を行い、パーソナライズされたメイク提案を受けました。\n\n詳しくはこちら: ${shareUrl}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleShareSocial = (platform: string) => {
    const text = `MakeupAIで${historyItems.length}回の分析を完了！AIがあなたにぴったりのメイクを提案します。`
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    }
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  const getExportSummary = () => {
    const favoriteCount = historyItems.filter(item => item.isFavorite).length
    const mostRecentAnalysis = historyItems[0]
    
    return {
      totalAnalyses: historyItems.length,
      favoriteCount,
      lastAnalysisDate: mostRecentAnalysis?.createdAt,
      mostUsedStyle: userStats.mostUsedStyle || 'ナチュラル'
    }
  }

  const summary = getExportSummary()

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-pink-500" />
            データエクスポート・共有
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="download" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ダウンロード
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                シェア
              </TabsTrigger>
            </TabsList>

            <TabsContent value="download" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {summary.totalAnalyses}
                        </div>
                        <div className="text-blue-700">総分析回数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {summary.favoriteCount}
                        </div>
                        <div className="text-purple-700">お気に入り</div>
                      </div>
                    </div>
                    
                    {summary.lastAnalysisDate && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-600 text-center">
                          最終分析: {new Date(summary.lastAnalysisDate).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Download Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">形式を選択してダウンロード</h4>
                  
                  <div className="grid gap-3">
                    {/* PDF Export */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-red-800">PDF レポート</p>
                          <p className="text-xs text-red-600">
                            詳細なレポート形式（画像、グラフ含む）
                          </p>
                        </div>
                      </div>
                      <PDFExport 
                        historyItems={historyItems}
                        userStats={userStats}
                        userName={userName}
                      />
                    </motion.div>

                    {/* CSV Export */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">CSV データ</p>
                          <p className="text-xs text-green-600">
                            Excel・スプレッドシート用データ
                          </p>
                        </div>
                      </div>
                      <CSVExport 
                        historyItems={historyItems}
                        userStats={userStats}
                        userName={userName}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Export Tips */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-3">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                      💡 エクスポートのコツ
                    </h5>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• PDF: 印刷やプレゼンテーションに最適</li>
                      <li>• CSV: データ分析やバックアップに最適</li>
                      <li>• 定期的にバックアップを取ることをお勧めします</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="share" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">結果をシェア</h4>

                  {/* Quick Share */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareNative}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      シェア
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      リンクコピー
                    </Button>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">SNSでシェア</h5>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareSocial('twitter')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareSocial('facebook')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareSocial('line')}
                        className="text-green-500 hover:text-green-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">その他</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareEmail}
                      className="w-full flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      メールで送信
                    </Button>
                  </div>

                  {/* Share Preview */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-3">
                      <h5 className="font-medium text-gray-800 mb-2">シェア内容プレビュー</h5>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                        <p className="font-medium">MakeupAI - 私のメイク分析結果</p>
                        <p className="mt-1">
                          {summary.totalAnalyses}回の分析でメイクが上達しました！
                          AIがあなたにぴったりのメイクを提案します。
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {summary.mostUsedStyle} スタイルがお気に入り
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}