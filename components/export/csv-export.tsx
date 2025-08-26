'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Table, 
  Calendar,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import type { HistoryItem, UserStats } from '@/types/history'

interface CSVExportProps {
  historyItems: HistoryItem[]
  userStats: UserStats
  userId: string
  userName?: string
}

interface CSVExportOptions {
  includeHeaders: boolean
  includeStats: boolean
  includeOnlyFavorites: boolean
  dateFormat: 'jp' | 'iso'
}

export function CSVExport({ historyItems, userStats, userName }: Omit<CSVExportProps, 'userId'>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<CSVExportOptions>({
    includeHeaders: true,
    includeStats: true,
    includeOnlyFavorites: false,
    dateFormat: 'jp'
  })

  const escapeCSV = (value: string | number | boolean | undefined | null): string => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (options.dateFormat === 'jp') {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return date.toISOString()
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    
    try {
      const csvData: string[] = []
      
      // Add stats header if requested
      if (options.includeStats) {
        csvData.push('# MakeupAI 利用統計')
        csvData.push(`ユーザー,${escapeCSV(userName || 'Unknown')}`)
        csvData.push(`総分析回数,${userStats.totalAnalyses}`)
        csvData.push(`今月の分析,${userStats.currentMonthUsage}`)
        csvData.push(`お気に入り数,${userStats.favoriteCount}`)
        csvData.push(`好きなスタイル,${escapeCSV(userStats.mostUsedStyle)}`)
        csvData.push(`出力日時,${formatDate(new Date().toISOString())}`)
        csvData.push('') // Empty line
        csvData.push('# 分析履歴')
      }

      // Filter items if only favorites requested
      const itemsToExport = options.includeOnlyFavorites 
        ? historyItems.filter(item => item.isFavorite)
        : historyItems

      // Add headers
      if (options.includeHeaders) {
        const headers = [
          'ID',
          '分析日時',
          'スタイル名',
          '顔型',
          '肌色',
          '信頼度',
          'お気に入り',
          'タグ',
          '作成日',
          '更新日'
        ]
        csvData.push(headers.map(escapeCSV).join(','))
      }

      // Add data rows
      itemsToExport.forEach(item => {
        const row = [
          escapeCSV(item.id),
          escapeCSV(formatDate(item.createdAt)),
          escapeCSV(item.styleName),
          escapeCSV(item.faceShape),
          escapeCSV(item.skinTone),
          escapeCSV(`${item.confidence}%`),
          escapeCSV(item.isFavorite ? 'はい' : 'いいえ'),
          escapeCSV(item.tags?.join(';') || ''),
          escapeCSV(formatDate(item.createdAt)),
          escapeCSV(formatDate(item.updatedAt))
        ]
        csvData.push(row.join(','))
      })

      // Create and download file
      const csvContent = csvData.join('\n')
      const bom = '\uFEFF' // UTF-8 BOM for Excel compatibility
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `MakeupAI_Data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Show success and close
      setTimeout(() => {
        setIsExporting(false)
        setIsOpen(false)
      }, 500)

    } catch (error) {
      console.error('CSV export error:', error)
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          CSV出力
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            CSVデータ出力
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="font-medium text-green-700">CSVファイルをダウンロードしました</p>
            <p className="text-sm text-gray-600 mt-2">
              Excelやスプレッドシートで開くことができます
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Table className="h-4 w-4" />
                出力オプション
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headers"
                    checked={options.includeHeaders}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeHeaders: !!checked})
                    }
                  />
                  <label htmlFor="headers" className="text-sm">
                    ヘッダー行を含める
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stats"
                    checked={options.includeStats}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeStats: !!checked})
                    }
                  />
                  <label htmlFor="stats" className="text-sm">
                    統計情報を含める
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorites-only"
                    checked={options.includeOnlyFavorites}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeOnlyFavorites: !!checked})
                    }
                  />
                  <label htmlFor="favorites-only" className="text-sm">
                    お気に入りのみ出力
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jp-date"
                    checked={options.dateFormat === 'jp'}
                    onCheckedChange={(checked) => 
                      setOptions({...options, dateFormat: checked ? 'jp' : 'iso'})
                    }
                  />
                  <label htmlFor="jp-date" className="text-sm">
                    日本語日付フォーマット
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  出力プレビュー
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  {options.includeStats && (
                    <div className="text-green-600 mb-1"># 統計情報含む</div>
                  )}
                  {options.includeHeaders && (
                    <div className="font-bold">ID,分析日時,スタイル名,顔型,肌色,信頼度...</div>
                  )}
                  <div className="text-gray-600">
                    {options.includeOnlyFavorites ? 
                      `${historyItems.filter(item => item.isFavorite).length}件のお気に入り` :
                      `${historyItems.length}件の分析結果`
                    }
                  </div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>日付形式:</span>
                  <Badge variant="outline" className="text-xs">
                    {options.dateFormat === 'jp' ? '2024/12/25 15:30' : 'ISO 8601'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                キャンセル
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleExportCSV}
                disabled={historyItems.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                CSVダウンロード
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}