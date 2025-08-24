'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Sparkles,
  Download,
  Save,
  RefreshCw,
  Wand2,
  Palette,
  Crown,
  Image as ImageIcon,
  Sliders,
  Info
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface GenerationSettings {
  style: string
  intensity: number
  features: {
    eyeMakeup: boolean
    lipColor: boolean
    faceContour: boolean
    skinTone: boolean
  }
}

export default function GenerationPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'natural',
    intensity: 50,
    features: {
      eyeMakeup: true,
      lipColor: true,
      faceContour: true,
      skinTone: false
    }
  })
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Get image data from sessionStorage or query params
    const analysisId = searchParams.get('analysis')
    const storedData = sessionStorage.getItem('analysisData')
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setOriginalImage(parsed.imageData)
      } catch (error) {
        console.error('Error parsing analysis data:', error)
      }
    } else if (!analysisId) {
      toast({
        variant: 'destructive',
        title: '画像がありません',
        description: '先に写真をアップロードしてください。',
      })
      router.push('/upload')
    }
  }, [searchParams, router, toast])

  const handleGenerate = async () => {
    if (!originalImage) {
      toast({
        variant: 'destructive',
        title: '元画像がありません',
        description: '先に写真をアップロードしてください。',
      })
      return
    }

    setGenerating(true)

    try {
      // TODO: Implement actual AI image generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // For demo, set a placeholder
      setGeneratedImage('/api/placeholder/400/400')
      
      toast({
        title: '生成完了！',
        description: 'メイク後のイメージを生成しました。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '生成エラー',
        description: '画像生成中にエラーが発生しました。',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveImage = async () => {
    if (!generatedImage) return

    try {
      // TODO: Implement save functionality
      toast({
        title: '保存しました',
        description: '画像を保存しました。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存エラー',
        description: '画像の保存に失敗しました。',
      })
    }
  }

  const handleDownloadImage = async () => {
    if (!generatedImage) return

    try {
      // TODO: Implement download functionality
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'makeup-ai-generated.png'
      link.click()
      
      toast({
        title: 'ダウンロード開始',
        description: '画像のダウンロードを開始しました。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ダウンロードエラー',
        description: '画像のダウンロードに失敗しました。',
      })
    }
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
                <Link href="/analysis/results">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  分析結果に戻る
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-purple-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  AI画像生成
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">無料プラン</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            メイク後イメージを生成
          </h2>
          <p className="text-gray-600">
            AIがあなたの写真にバーチャルメイクを適用します
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Before
                  </CardTitle>
                  <CardDescription>元の写真</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {originalImage ? (
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generated Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500" />
                    After
                  </CardTitle>
                  <CardDescription>生成画像</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    {generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {generating ? (
                          <div className="text-center">
                            <Sparkles className="h-12 w-12 animate-spin mx-auto mb-2" />
                            <p className="text-sm">生成中...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Wand2 className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">生成待機中</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {generatedImage && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handleSaveImage}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                      <Button
                        onClick={handleDownloadImage}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        ダウンロード
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Applied Makeup Info */}
            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    適用されたメイク
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">ベースメイク</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• ナチュラルファンデーション</li>
                        <li>• ハイライト（頬骨上）</li>
                        <li>• コーラルピンクチーク</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">ポイントメイク</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• ブラウン系アイシャドウ</li>
                        <li>• ボリュームマスカラ</li>
                        <li>• グロッシーリップ</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  生成設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Style Selection */}
                <div>
                  <Label className="mb-2">メイクスタイル</Label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={settings.style}
                    onChange={(e) => setSettings({...settings, style: e.target.value})}
                  >
                    <option value="natural">ナチュラル</option>
                    <option value="korean">韓国風</option>
                    <option value="western">欧米風</option>
                    <option value="party">パーティー</option>
                    <option value="office">オフィス</option>
                  </select>
                </div>

                {/* Intensity Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>メイクの濃さ</Label>
                    <span className="text-sm text-gray-600">{settings.intensity}%</span>
                  </div>
                  <Slider
                    value={[settings.intensity]}
                    onValueChange={(value) => setSettings({...settings, intensity: value[0]})}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  <Label>適用する部分</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eye-makeup" className="text-sm font-normal">
                        アイメイク
                      </Label>
                      <Switch
                        id="eye-makeup"
                        checked={settings.features.eyeMakeup}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings, 
                            features: {...settings.features, eyeMakeup: checked}
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lip-color" className="text-sm font-normal">
                        リップカラー
                      </Label>
                      <Switch
                        id="lip-color"
                        checked={settings.features.lipColor}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings, 
                            features: {...settings.features, lipColor: checked}
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="face-contour" className="text-sm font-normal">
                        フェイスコントゥア
                      </Label>
                      <Switch
                        id="face-contour"
                        checked={settings.features.faceContour}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings, 
                            features: {...settings.features, faceContour: checked}
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="skin-tone" className="text-sm font-normal">
                        肌色補正
                      </Label>
                      <Switch
                        id="skin-tone"
                        checked={settings.features.skinTone}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings, 
                            features: {...settings.features, skinTone: checked}
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!originalImage || generating}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : generatedImage ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      再生成
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      生成開始
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      生成のコツ
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 正面を向いた写真が最適です</li>
                      <li>• 明るい照明の写真を使用</li>
                      <li>• 複数のスタイルを試してみて</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium CTA */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-1">
                      プレミアム機能
                    </h3>
                    <p className="text-sm text-yellow-800 mb-2">
                      高解像度生成、複数パターン同時生成
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/pricing">
                        詳細を見る
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}