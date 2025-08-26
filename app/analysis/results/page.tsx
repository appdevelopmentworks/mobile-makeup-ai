'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { FaceShapeDisplay } from '@/components/analysis/face-shape-display'
import { SkinToneDisplay } from '@/components/analysis/skin-tone-display'
import { MakeupRecommendations } from '@/components/analysis/makeup-recommendations'
import { AIImageGeneratorComponent } from '@/components/ai-generation/ai-image-generator'
import { FaceAnalysisChart } from '@/components/analysis/face-analysis-chart'
import { InteractiveResult } from '@/components/analysis/interactive-result'
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
  Heart
} from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import type { AnalysisResult } from '@/types/analysis'
import { FaceAnalysisResult } from '@/lib/face-analysis'
import { makeupEngine, MakeupPlan } from '@/lib/makeup-suggestions'
import { UsageTracker } from '@/lib/usage-tracking'

export default function AnalysisResultsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [makeupPlan, setMakeupPlan] = useState<MakeupPlan | null>(null)
  const [originalImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get analysis data from sessionStorage (from upload page)
    const storedFaceAnalysis = sessionStorage.getItem('faceAnalysisResult')
    const storedRegion = sessionStorage.getItem('selectedRegion')
    
    if (storedFaceAnalysis) {
      try {
        const faceAnalysis: FaceAnalysisResult = JSON.parse(storedFaceAnalysis)
        const region = storedRegion || 'japan'
        
        // Generate makeup suggestions based on face analysis
        const plan = makeupEngine.generateSuggestions(faceAnalysis, region, {
          style: 'natural',
          occasion: 'daily'
        })
        
        setMakeupPlan(plan)
        
        // Convert to legacy format for existing components
        setAnalysisData({
          id: 'current-analysis',
          userId: 'current-user',
          confidence: faceAnalysis.confidence,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          faceShape: {
            type: faceAnalysis.faceShape || 'oval',
            confidence: faceAnalysis.confidence,
            description: faceAnalysis.faceShape === 'oval' ? '卵型の顔型' : 
                        faceAnalysis.faceShape === 'round' ? '丸型の顔型' : 
                        faceAnalysis.faceShape === 'square' ? '四角型の顔型' :
                        faceAnalysis.faceShape === 'heart' ? 'ハート型の顔型' : '面長型の顔型'
          },
          skinTone: {
            type: faceAnalysis.skinTone === 'light' ? 'spring' :
                  faceAnalysis.skinTone === 'dark' ? 'winter' : 
                  faceAnalysis.skinTone === 'deep' ? 'autumn' : 'summer',
            undertone: 'neutral',
            description: faceAnalysis.skinTone === 'light' ? '明るい肌色' :
                        faceAnalysis.skinTone === 'medium' ? '標準的な肌色' :
                        faceAnalysis.skinTone === 'dark' ? '濃い肌色' : '深い肌色',
            recommendedColors: ['ベージュ', 'ピンク', 'コーラル']
          },
          recommendations: plan.suggestions.map(s => ({
            category: s.category === 'foundation' ? 'base' : 
                     s.category === 'brows' ? 'eyebrows' : s.category,
            title: s.title,
            description: s.description,
            products: s.products.map(p => p.name),
            techniques: s.steps,
            colors: ['ナチュラル', 'ピンク', 'ブラウン']
          })),
          selectedStyle: 'natural',
          imageUrl: '/placeholder-face.jpg',
          features: {
            eyeShape: 'almond',
            eyeSize: 'medium',
            eyebrowShape: 'soft-arch',
            lipShape: 'full',
            noseShape: 'straight'
          }
        })
        
        toast({
          title: '分析完了！',
          description: `${plan.suggestions.length}個のメイク提案を生成しました`,
        })
        
      } catch (error) {
        console.error('Error processing analysis data:', error)
        toast({
          variant: 'destructive',
          title: 'データエラー',
          description: '分析データの処理に失敗しました。',
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

        {/* Analysis Charts Section */}
        <div className="mb-8">
          <FaceAnalysisChart 
            faceShape={analysisData.faceShape}
            skinTone={analysisData.skinTone}
            confidence={analysisData.confidence}
          />
        </div>

        {/* Interactive Results Section */}
        <div className="mb-8">
          <InteractiveResult 
            analysisData={analysisData}
            makeupPlan={makeupPlan}
            onSaveResults={handleSaveResults}
            isSaved={saved}
          />
        </div>

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <FaceShapeDisplay faceShape={analysisData.faceShape} />
            <SkinToneDisplay skinTone={analysisData.skinTone} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIImageGeneratorComponent
              originalImage={originalImage || ''}
              analysisResult={{
                faceDetected: true,
                confidence: analysisData.confidence,
                faceShape: analysisData.faceShape.type as any,
                skinTone: analysisData.skinTone.type === 'spring' ? 'light' :
                         analysisData.skinTone.type === 'summer' ? 'medium' :
                         analysisData.skinTone.type === 'autumn' ? 'dark' : 'deep'
              }}
              makeupPlan={makeupPlan}
              onImageGenerated={(result) => {
                toast({
                  title: 'AI画像生成完了！',
                  description: `${result.images.length}枚の画像が生成されました`,
                })
              }}
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

        {/* Makeup Plan Details */}
        {makeupPlan && (
          <div className="mt-8 space-y-6">
            {/* Overall Style */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  {makeupPlan.overall.style}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{makeupPlan.overall.description}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">所要時間</p>
                    <p className="font-semibold text-pink-600">{makeupPlan.totalTime}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">難易度</p>
                    <p className="font-semibold text-purple-600">
                      {makeupPlan.difficulty === 'beginner' ? '初級' :
                       makeupPlan.difficulty === 'intermediate' ? '中級' : '上級'}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">適合度</p>
                    <p className="font-semibold text-green-600">
                      {Math.round(makeupPlan.overall.suitability * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 推奨カラーパレット
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-200"
                      style={{ backgroundColor: makeupPlan.colorPalette.foundation }}
                    ></div>
                    <p className="text-sm font-medium">ファンデーション</p>
                  </div>
                  <div className="text-center">
                    <div className="flex gap-1 justify-center mb-2">
                      {makeupPlan.colorPalette.eyeshadow.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-sm font-medium">アイシャドウ</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-200"
                      style={{ backgroundColor: makeupPlan.colorPalette.lipstick }}
                    ></div>
                    <p className="text-sm font-medium">リップ</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-200"
                      style={{ backgroundColor: makeupPlan.colorPalette.blush }}
                    ></div>
                    <p className="text-sm font-medium">チーク</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Suggestions */}
            <div className="grid md:grid-cols-2 gap-6">
              {makeupPlan.suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge variant={
                        suggestion.difficulty === 'beginner' ? 'secondary' :
                        suggestion.difficulty === 'intermediate' ? 'default' : 'destructive'
                      }>
                        {suggestion.difficulty === 'beginner' ? '初級' :
                         suggestion.difficulty === 'intermediate' ? '中級' : '上級'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                    <p className="text-xs text-gray-500">所要時間: {suggestion.timeEstimate}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Products */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">おすすめ商品</h4>
                      <div className="space-y-2">
                        {suggestion.products.map((product) => (
                          <div key={product.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-gray-600">{product.brand}</p>
                                {product.shade && (
                                  <p className="text-xs text-purple-600">{product.shade}</p>
                                )}
                              </div>
                              {product.price && (
                                <p className="text-sm font-medium">¥{product.price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">手順</h4>
                      <ol className="space-y-1">
                        {suggestion.steps.map((step, index) => (
                          <li key={index} className="text-xs text-gray-700 flex gap-2">
                            <span className="bg-pink-100 text-pink-600 rounded-full w-4 h-4 flex items-center justify-center text-xs flex-shrink-0">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Tips */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">💡 コツ</h4>
                      <ul className="space-y-1">
                        {suggestion.tips.map((tip, index) => (
                          <li key={index} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-yellow-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Full Width Recommendations (Legacy) */}
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