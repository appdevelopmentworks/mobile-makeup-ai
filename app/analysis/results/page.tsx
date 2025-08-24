'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { FaceShapeDisplay } from '@/components/analysis/face-shape-display'
import { SkinToneDisplay } from '@/components/analysis/skin-tone-display'
import { MakeupRecommendations } from '@/components/analysis/makeup-recommendations'
import { AIImageGenerator } from '@/components/analysis/ai-image-generator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Share2, 
  Save, 
  RotateCcw,
  Sparkles,
  Crown,
  Star,
  Download,
  Heart
} from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import { mockAnalysisResult } from '@/types/analysis'
import type { AnalysisResult } from '@/types/analysis'

export default function AnalysisResultsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get analysis data from sessionStorage (from upload page)
    const storedData = sessionStorage.getItem('analysisData')
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setOriginalImage(parsed.imageData)
        
        // Use mock data for now (in real implementation, this would come from API)
        setAnalysisData(mockAnalysisResult)
      } catch (error) {
        console.error('Error parsing analysis data:', error)
        toast({
          variant: 'destructive',
          title: 'データエラー',
          description: '分析データの読み込みに失敗しました。',
        })
        router.push('/upload')
        return
      }
    } else {
      toast({
        variant: 'destructive',
        title: '分析データがありません',
        description: '新しく分析を開始してください。',
      })
      router.push('/upload')
      return
    }

    setLoading(false)
  }, [router, toast])

  const handleSaveResults = async () => {
    try {
      // TODO: Implement save to database
      setSaved(true)
      toast({
        title: '分析結果を保存しました',
        description: '履歴ページから確認できます。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存エラー',
        description: '分析結果の保存に失敗しました。',
      })
    }
  }

  const handleShareResults = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MakeupAI分析結果',
          text: 'AIがあなたに最適なメイクを提案しました！',
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'リンクをコピーしました',
          description: 'URLがクリップボードにコピーされました。',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'シェアエラー',
        description: 'シェアに失敗しました。',
      })
    }
  }

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisData')
    router.push('/upload')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">分析結果を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">分析データが見つかりません</p>
            <Button asChild>
              <Link href="/upload">新しく分析を開始</Link>
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
                <Sparkles className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  分析結果
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                確信度 {Math.round(analysisData.confidence * 100)}%
              </Badge>
              <Badge variant="secondary">無料プラン</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Success Banner */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Sparkles className="h-5 w-5" />
              分析完了！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              あなたの顔型と肌色を分析し、最適なメイク提案を作成しました。
              結果を参考に、より魅力的なメイクを楽しんでください。
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSaveResults}
                disabled={saved}
                variant="outline"
                size="sm"
              >
                {saved ? (
                  <>
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    保存済み
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    結果を保存
                  </>
                )}
              </Button>
              <Button
                onClick={handleShareResults}
                variant="outline"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                シェア
              </Button>
              <Button
                onClick={handleNewAnalysis}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                新しい分析
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <FaceShapeDisplay faceShape={analysisData.faceShape} />
            <SkinToneDisplay skinTone={analysisData.skinTone} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIImageGenerator 
              originalImage={originalImage}
              analysisData={{
                faceShape: analysisData.faceShape.type,
                skinTone: analysisData.skinTone.type,
                selectedStyle: analysisData.selectedStyle
              }}
              isPremium={false} // Set to true for premium users
            />
            
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  総合スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(analysisData.confidence * 100)}/100
                  </div>
                  <p className="text-gray-600">
                    分析の精度が高く、信頼性のある結果です
                  </p>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      💡 より正確な分析のために、異なる角度や照明での写真も試してみてください。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width Recommendations */}
        <div className="mt-8">
          <MakeupRecommendations recommendations={analysisData.recommendations} />
        </div>

        {/* Premium CTA */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  もっと詳しい分析をお求めですか？
                </h3>
                <p className="text-yellow-800 mb-4">
                  プレミアムプランで、AI画像生成、詳細分析レポート、無制限の分析をお楽しみください。
                </p>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
                asChild
              >
                <Link href="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  プレミアムプランを見る
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}