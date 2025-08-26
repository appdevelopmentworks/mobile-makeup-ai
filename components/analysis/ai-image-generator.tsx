'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Wand2, 
  Download, 
  RefreshCw, 
  Loader2,
  Image as ImageIcon,
  Crown,
  Lock
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { aiImageGenerator, ImageGenerationRequest, GenerationProgress } from '@/lib/ai-image-generation'
import { UsageTracker } from '@/lib/usage-tracking'

interface AIImageGeneratorProps {
  originalImage?: string
  analysisData: {
    faceShape: string
    skinTone: string
    selectedStyle: string
  }
  isPremium?: boolean
  userId?: string
}

export function AIImageGenerator({ 
  originalImage, 
  analysisData, 
  isPremium = false,
  userId
}: AIImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleGenerateImage = async () => {
    // Check usage limits first
    const canUse = UsageTracker.canUseFeature('ai_generation', userId)
    if (!canUse.allowed) {
      toast({
        variant: 'destructive',
        title: 'AI画像生成制限',
        description: canUse.reason,
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      const request: ImageGenerationRequest = {
        originalImage: originalImage,
        faceShape: analysisData.faceShape,
        skinTone: analysisData.skinTone,
        makeupStyle: analysisData.selectedStyle as 'natural' | 'glamour' | 'cute' | 'mature',
        region: 'japan' // Could be made dynamic based on user settings
      }

      const onProgress = (progressData: GenerationProgress) => {
        setProgress(progressData.progress)
        toast({
          title: progressData.message,
          duration: 1000,
        })
      }

      // Record usage before generation
      const usageRecorded = UsageTracker.recordUsage('ai_generation', userId)
      if (!usageRecorded) {
        throw new Error('Usage recording failed')
      }

      const result = await aiImageGenerator.generateMakeupImage(request, onProgress)
      
      setGeneratedImage(result.generatedImage || null)

      toast({
        title: 'AI画像生成完了',
        description: `メイク後のイメージが生成されました！（処理時間: ${(result.processingTime / 1000).toFixed(1)}秒）`,
      })

    } catch (error) {
      console.error('Image generation error:', error)
      toast({
        variant: 'destructive',
        title: '生成エラー',
        description: 'AI画像生成中にエラーが発生しました。',
      })
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleRegenerateImage = () => {
    setGeneratedImage(null)
    handleGenerateImage()
  }

  const handleDownloadImage = () => {
    if (generatedImage) {
      // In a real implementation, this would trigger a download
      toast({
        title: '画像をダウンロード',
        description: '生成されたメイク画像をダウンロードしました。',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI画像生成
          {!isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
        </CardTitle>
        <CardDescription>
          AIがあなたにメイクを施したイメージを生成します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isPremium ? (
          /* Premium Upgrade Prompt */
          <div className="text-center p-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">
                  プレミアム機能
                </h3>
                <p className="text-yellow-800 text-sm mb-4">
                  AI画像生成機能は、プレミアムプランでご利用いただけます。<br />
                  あなたにメイクを施したリアルなイメージを生成できます。
                </p>
                <div className="space-y-2 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-sm text-yellow-700">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    高品質なAI画像生成
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yellow-700">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    複数パターンの生成
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yellow-700">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    高解像度ダウンロード
                  </div>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500">
                <Crown className="h-4 w-4 mr-2" />
                プレミアムにアップグレード
              </Button>
            </div>
          </div>
        ) : (
          /* Premium Features */
          <>
            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-center">Before</h4>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {originalImage ? (
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">元の画像</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-center">After</h4>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {isGenerating ? (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-pink-500" />
                      <span className="text-sm text-gray-600">生成中...</span>
                    </div>
                  ) : generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Generated makeup" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Wand2 className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">AI生成画像</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI画像生成中...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Analysis Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-blue-900">生成に使用する情報</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Badge variant="outline" className="justify-center">
                  顔型: {analysisData.faceShape}
                </Badge>
                <Badge variant="outline" className="justify-center">
                  肌色: {analysisData.skinTone}
                </Badge>
                <Badge variant="outline" className="justify-center">
                  スタイル: {analysisData.selectedStyle}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!generatedImage ? (
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI画像を生成する
                    </>
                  )}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleRegenerateImage}
                    variant="outline"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    再生成
                  </Button>
                  <Button
                    onClick={handleDownloadImage}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </Button>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <strong>💡 ヒント:</strong> より良い結果を得るために、明るい照明の下で正面を向いた写真を使用することをお勧めします。
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}