'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { ImageUpload } from '@/components/upload/image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  ArrowLeft, 
  Zap, 
  Globe,
  Crown,
  Info
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

type MakeupStyle = {
  id: string
  name: string
  description: string
  region: string
  popular?: boolean
}

const MAKEUP_STYLES: MakeupStyle[] = [
  {
    id: 'natural-jp',
    name: 'ナチュラル',
    description: '自然で上品な日本風メイク',
    region: '日本',
    popular: true
  },
  {
    id: 'korean-gradient',
    name: 'グラデーションリップ',
    description: '韓国で人気のグラデーションメイク',
    region: '韓国',
    popular: true
  },
  {
    id: 'western-bold',
    name: 'ボールドメイク',
    description: 'くっきりとした欧米風メイク',
    region: '欧米'
  },
  {
    id: 'chinese-doll',
    name: 'ドールメイク',
    description: '人形のような可愛らしい中国風メイク',
    region: '中国'
  },
  {
    id: 'evening-glam',
    name: 'イブニンググラム',
    description: 'パーティーや夜のお出かけに最適',
    region: '国際'
  },
  {
    id: 'office-professional',
    name: 'オフィスメイク',
    description: 'ビジネスシーンに適したプロフェッショナル',
    region: '日本'
  }
]

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast({
        variant: 'destructive',
        title: '画像が選択されていません',
        description: '分析する画像をアップロードしてください',
      })
      return
    }

    if (!selectedStyle) {
      toast({
        variant: 'destructive',
        title: 'メイクスタイルが選択されていません',
        description: '希望するメイクスタイルを選択してください',
      })
      return
    }

    setAnalyzing(true)

    try {
      // TODO: Implement actual face analysis
      // For now, simulate analysis process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Store analysis data in sessionStorage for the results page
      const analysisData = {
        image: selectedImage,
        style: selectedStyle,
        timestamp: Date.now()
      }

      // Convert file to base64 for storage
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem('analysisData', JSON.stringify({
          ...analysisData,
          imageData: reader.result
        }))
        
        router.push('/analysis/results')
      }
      reader.readAsDataURL(selectedImage)

    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        variant: 'destructive',
        title: '分析エラー',
        description: '画像分析中にエラーが発生しました。もう一度お試しください。',
      })
    } finally {
      setAnalyzing(false)
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
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  写真アップロード
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            メイク分析を始めましょう
          </h2>
          <p className="text-gray-600">
            写真をアップロードして、あなたに最適なメイクを見つけます
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-pink-500" />
                  ステップ 1: 写真をアップロード
                </CardTitle>
                <CardDescription>
                  顔がはっきりと写った写真をアップロードしてください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Style Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  ステップ 2: メイクスタイルを選択
                </CardTitle>
                <CardDescription>
                  希望するメイクスタイルを選んでください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="メイクスタイルを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MAKEUP_STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex items-center gap-2">
                          <span>{style.name}</span>
                          {style.popular && (
                            <Badge variant="secondary" className="text-xs">
                              人気
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">({style.region})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedStyle && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {MAKEUP_STYLES.find(s => s.id === selectedStyle)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">利用状況</h3>
                    <p className="text-sm text-blue-800">
                      今月の利用回数: <strong>0/3</strong> (無料プラン)
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      より多くの分析をご希望の場合は
                      <Link href="/pricing" className="underline font-medium">
                        プレミアムプラン
                      </Link>
                      をご検討ください
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={handleAnalyzeImage}
                  disabled={!selectedImage || !selectedStyle || analyzing}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      分析を開始
                    </>
                  )}
                </Button>

                {(!selectedImage || !selectedStyle) && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    画像とスタイルを選択してください
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Premium Feature Teaser */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-1">
                      プレミアム機能
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• 無制限の分析回数</li>
                      <li>• AI画像生成（メイク後のイメージ）</li>
                      <li>• 詳細な分析レポート</li>
                      <li>• 複数スタイルの同時比較</li>
                    </ul>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
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