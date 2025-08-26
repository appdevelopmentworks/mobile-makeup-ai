'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  FileText, 
  BarChart3, 
  User,
  Loader2,
  CheckCircle
} from 'lucide-react'
import type { HistoryItem, UserStats } from '@/types/history'

interface PDFExportProps {
  historyItems: HistoryItem[]
  userStats: UserStats
  userId: string
  userName?: string
}

interface ExportOptions {
  includeImages: boolean
  includeStats: boolean
  includeAnalysisDetails: boolean
  includeCharts: boolean
  selectedItems: string[]
}

export function PDFExport({ historyItems, userStats, userName }: Omit<PDFExportProps, 'userId'>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [options, setOptions] = useState<ExportOptions>({
    includeImages: true,
    includeStats: true,
    includeAnalysisDetails: true,
    includeCharts: false,
    selectedItems: []
  })

  const handleExportPDF = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Dynamic import for client-side only
      const jsPDF = (await import('jspdf')).default
      // const html2canvas = (await import('html2canvas')).default

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 20

      // Set font
      pdf.setFont('helvetica')
      
      // Title Page
      setExportProgress(10)
      pdf.setFontSize(24)
      pdf.text('MakeupAI 分析レポート', pageWidth / 2, 40, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.text(`ユーザー: ${userName || 'Unknown'}`, pageWidth / 2, 60, { align: 'center' })
      pdf.text(`出力日時: ${new Date().toLocaleDateString('ja-JP')}`, pageWidth / 2, 70, { align: 'center' })

      // User Stats
      if (options.includeStats) {
        setExportProgress(25)
        let yPos = 100
        
        pdf.setFontSize(18)
        pdf.text('利用統計', margin, yPos)
        yPos += 15
        
        pdf.setFontSize(12)
        pdf.text(`総分析回数: ${userStats.totalAnalyses}回`, margin, yPos)
        yPos += 8
        pdf.text(`今月の分析: ${userStats.currentMonthUsage}回`, margin, yPos)
        yPos += 8
        pdf.text(`お気に入り: ${userStats.favoriteCount}件`, margin, yPos)
        yPos += 8
        pdf.text(`好きなスタイル: ${userStats.mostUsedStyle}`, margin, yPos)
        yPos += 15
      }

      // Analysis History
      setExportProgress(50)
      const itemsToExport = options.selectedItems.length > 0 
        ? historyItems.filter(item => options.selectedItems.includes(item.id))
        : historyItems

      if (itemsToExport.length > 0) {
        // Add new page for analysis history
        pdf.addPage()
        let yPos = 30
        
        pdf.setFontSize(18)
        pdf.text('分析履歴', margin, yPos)
        yPos += 20

        for (let i = 0; i < itemsToExport.length; i++) {
          const item = itemsToExport[i]
          setExportProgress(50 + (i / itemsToExport.length) * 40)

          // Check if we need a new page
          if (yPos > pageHeight - 60) {
            pdf.addPage()
            yPos = 30
          }

          // Analysis item header
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`分析 ${i + 1}: ${item.styleName}`, margin, yPos)
          yPos += 10

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          
          // Analysis details
          if (options.includeAnalysisDetails) {
            pdf.text(`日時: ${new Date(item.createdAt).toLocaleString('ja-JP')}`, margin, yPos)
            yPos += 6
            pdf.text(`顔型: ${item.faceShape}`, margin, yPos)
            yPos += 6
            pdf.text(`肌色: ${item.skinTone}`, margin, yPos)
            yPos += 6
            pdf.text(`信頼度: ${item.confidence}%`, margin, yPos)
            yPos += 6
            
            if (item.tags && item.tags.length > 0) {
              pdf.text(`タグ: ${item.tags.join(', ')}`, margin, yPos)
              yPos += 6
            }
            
            if (item.isFavorite) {
              pdf.text('♥ お気に入り', margin, yPos)
              yPos += 6
            }
          }

          // Add image if requested (placeholder for now)
          if (options.includeImages) {
            pdf.setFontSize(8)
            pdf.text('[画像: メイク分析結果]', margin, yPos)
            yPos += 6
          }

          yPos += 10
        }
      }

      // Summary page
      setExportProgress(90)
      pdf.addPage()
      let yPos = 30
      
      pdf.setFontSize(18)
      pdf.text('まとめ', margin, yPos)
      yPos += 20

      pdf.setFontSize(12)
      pdf.text(`このレポートには ${itemsToExport.length}件の分析結果が含まれています。`, margin, yPos)
      yPos += 10
      
      const favoriteCount = itemsToExport.filter(item => item.isFavorite).length
      if (favoriteCount > 0) {
        pdf.text(`そのうち ${favoriteCount}件がお気に入りに登録されています。`, margin, yPos)
        yPos += 10
      }

      pdf.text('MakeupAIをご利用いただき、ありがとうございます。', margin, yPos)

      // Save PDF
      setExportProgress(100)
      const fileName = `MakeupAI_Report_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      setTimeout(() => {
        setIsExporting(false)
        setIsOpen(false)
        setExportProgress(0)
      }, 1000)

    } catch (error) {
      console.error('PDF export error:', error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          PDFエクスポート
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDFレポート作成
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-pink-500" />
              <p className="font-medium">PDFを生成中...</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>

            {exportProgress === 100 && (
              <div className="text-center text-green-600">
                <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm">完了しました</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                含める内容
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stats"
                    checked={options.includeStats}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeStats: !!checked})
                    }
                  />
                  <label htmlFor="stats" className="text-sm">
                    利用統計情報
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="details"
                    checked={options.includeAnalysisDetails}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeAnalysisDetails: !!checked})
                    }
                  />
                  <label htmlFor="details" className="text-sm">
                    分析詳細情報
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="images"
                    checked={options.includeImages}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeImages: !!checked})
                    }
                  />
                  <label htmlFor="images" className="text-sm">
                    画像 (プレースホルダー)
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <User className="h-4 w-4" />
                  レポートサマリー
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>分析件数:</span>
                  <Badge variant="secondary">{historyItems.length}件</Badge>
                </div>
                <div className="flex justify-between">
                  <span>お気に入り:</span>
                  <Badge variant="secondary">
                    {historyItems.filter(item => item.isFavorite).length}件
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>期間:</span>
                  <span className="text-xs text-gray-600">
                    {historyItems.length > 0 ? 
                      `${new Date(historyItems[historyItems.length - 1]?.createdAt).toLocaleDateString('ja-JP')} 〜` 
                      : '履歴なし'
                    }
                  </span>
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
                onClick={handleExportPDF}
                disabled={historyItems.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                PDFダウンロード
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}