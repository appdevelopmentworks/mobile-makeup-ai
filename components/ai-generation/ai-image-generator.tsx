'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  Download, 
  Wand2, 
  Loader2, 
  AlertTriangle,
  Info,
  Zap,
  Star,
  Settings
} from 'lucide-react'
import { FaceAnalysisResult } from '@/lib/face-analysis'
import { MakeupPlan } from '@/lib/makeup-suggestions'
import { 
  aiImageGenerator, 
  ImageGenerationResult, 
  GenerationProgress,
  ImageGenerationOptions,
  GeneratedImage
} from '@/lib/ai-image-generation'
import { useToast } from '@/hooks/use-toast'

interface AIImageGeneratorProps {
  originalImage: string // base64 image
  analysisResult: FaceAnalysisResult
  makeupPlan: MakeupPlan | null
  onImageGenerated?: (result: ImageGenerationResult) => void
  className?: string
}

export function AIImageGeneratorComponent({ 
  originalImage, 
  analysisResult, 
  makeupPlan,
  onImageGenerated,
  className = '' 
}: AIImageGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { toast } = useToast()

  // Generation options
  const [options, setOptions] = useState<ImageGenerationOptions>({
    style: 'natural',
    occasion: 'daily',
    quality: 'standard',
    aspectRatio: '1:1',
    engine: 'auto'
  })

  const availableEngines = aiImageGenerator.getAvailableEngines()
  const hasRealAI = aiImageGenerator.hasRealAIEngine()

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setProgress(null)
    setGenerationResult(null)
    setSelectedImage(null)

    try {
      const result = await aiImageGenerator.generateMakeupImage(
        {
          originalImage,
          faceShape: analysisResult.faceShape || 'oval',
          skinTone: analysisResult.skinTone || 'medium',
          makeupStyle: options.style === 'glamorous' ? 'glamour' : 
                      options.style === 'natural' ? 'natural' : 'cute',
          region: 'japan', // Default region
          analysisResult,
          makeupPlan: makeupPlan || undefined,
          options
        },
        (progressData) => {
          setProgress(progressData)
        }
      )

      setGenerationResult(result)
      
      if (result.success && result.images.length > 0) {
        setSelectedImage(result.images[0])
        toast({
          title: '画像生成完了！',
          description: `${result.images.length}枚の画像が生成されました`,
        })
        onImageGenerated?.(result)
      } else {
        toast({
          variant: 'destructive',
          title: '生成に失敗しました',
          description: result.error || '不明なエラーが発生しました',
        })
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        variant: 'destructive',
        title: '生成エラー',
        description: '画像の生成中にエラーが発生しました',
      })
    } finally {
      setGenerating(false)
      setProgress(null)
    }
  }, [originalImage, analysisResult, makeupPlan, options, onImageGenerated, toast])

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `makeup-ai-${image.engine}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'ダウンロード開始',
      description: '生成された画像をダウンロードしています',
    })
  }

  const updateOption = <K extends keyof ImageGenerationOptions>(
    key: K, 
    value: ImageGenerationOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" />
            AI画像生成
            {!hasRealAI && (
              <Badge variant="secondary" className="text-xs">
                デモモード
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="style">メイクスタイル</Label>
              <Select 
                value={options.style} 
                onValueChange={(value) => updateOption('style', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">ナチュラル</SelectItem>
                  <SelectItem value="glamorous">グラマラス</SelectItem>
                  <SelectItem value="bold">ボールド</SelectItem>
                  <SelectItem value="vintage">ヴィンテージ</SelectItem>
                  <SelectItem value="korean">韓国風</SelectItem>
                  <SelectItem value="western">欧米風</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="occasion">場面</Label>
              <Select 
                value={options.occasion} 
                onValueChange={(value) => updateOption('occasion', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">日常</SelectItem>
                  <SelectItem value="business">ビジネス</SelectItem>
                  <SelectItem value="party">パーティー</SelectItem>
                  <SelectItem value="date">デート</SelectItem>
                  <SelectItem value="wedding">ウェディング</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="advanced" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              詳細設定
            </Label>
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4 border-t pt-4"
              >
                <div>
                  <Label htmlFor="quality">品質</Label>
                  <Select 
                    value={options.quality} 
                    onValueChange={(value) => updateOption('quality', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">標準</SelectItem>
                      <SelectItem value="hd">高品質</SelectItem>
                      <SelectItem value="premium">プレミアム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="engine">生成エンジン</Label>
                  <Select 
                    value={options.engine || 'auto'} 
                    onValueChange={(value) => updateOption('engine', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">自動選択</SelectItem>
                      {availableEngines.map(engine => (
                        <SelectItem key={engine} value={engine}>
                          {engine === 'google-imagen' ? 'Google Imagen' :
                           engine === 'openai-dalle' ? 'DALL-E' : 'デモ'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Engine Status */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            {hasRealAI ? (
              <span>実際のAIエンジンが利用可能です</span>
            ) : (
              <span>デモモードで動作中（API キーが設定されていません）</span>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                画像を生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      <AnimatePresence>
        {generating && progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{progress.message}</span>
                        <span className="text-sm text-gray-500">{progress.progress}%</span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    推定残り時間: {Math.max(0, Math.round((100 - progress.progress) / 10))}秒
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Results */}
      <AnimatePresence>
        {generationResult && generationResult.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  生成結果
                  <Badge variant="secondary">
                    {generationResult.images[0]?.engine || 'unknown'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generationResult.images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={`Generated makeup ${index + 1}`}
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="absolute top-2 right-2 space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(image)}
                          className="bg-white/90 text-gray-800 hover:bg-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline">{image.quality}</Badge>
                        <span>信頼度: {Math.round(generationResult.confidence * 100)}%</span>
                        <span>処理時間: {(generationResult.processingTime / 1000).toFixed(1)}秒</span>
                      </div>
                      
                      {image.metadata && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">技術詳細</summary>
                          <div className="mt-2 space-y-1 pl-4">
                            {image.metadata.seed && <div>シード: {image.metadata.seed}</div>}
                            {image.metadata.steps && <div>ステップ数: {image.metadata.steps}</div>}
                            {image.metadata.guidance && <div>ガイダンス: {image.metadata.guidance}</div>}
                          </div>
                        </details>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {generationResult && !generationResult.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">生成に失敗しました</h3>
                    <p className="text-red-800 text-sm mb-4">
                      {generationResult.error || '不明なエラーが発生しました'}
                    </p>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      再試行
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}