'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/components/providers/auth-provider'
import { Camera, Info, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { ImageUpload } from '@/components/upload/image-upload'
import { CameraCapture } from '@/components/camera/camera-capture'
import { faceAnalyzer, FaceAnalysisResult } from '@/lib/face-analysis'
import { useToast } from '../../hooks/use-toast'
import { UsageDisplay } from '@/components/usage/usage-display'
import { DatabaseService } from '@/lib/database'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [selectedRegion, setSelectedRegion] = useState('japan')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const regions = [
    { id: 'japan', name: '日本', flag: '🇯🇵' },
    { id: 'korea', name: '韓国', flag: '🇰🇷' },
    { id: 'western', name: '欧米', flag: '🇺🇸' },
    { id: 'china', name: '中国', flag: '🇨🇳' },
  ]

  const handleImageSelect = async (file: File) => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'ログインが必要です',
        description: 'サービスを利用するにはログインしてください。',
      })
      return
    }

    // Check usage limits using database
    const usageCheck = await DatabaseService.canUseService(user.id)
    if (!usageCheck.allowed) {
      toast({
        variant: 'destructive',
        title: '利用制限に達しました',
        description: usageCheck.reason,
      })
      return
    }

    setUploadedImage(file)
    setAnalyzing(true)

    try {
      // Create image element for analysis
      const img = new Image()
      img.onload = async () => {
        try {
          // Initialize MediaPipe and perform real face analysis
          setInitializing(true)
          await faceAnalyzer.initialize()
          setInitializing(false)
          
          const result = await faceAnalyzer.analyzeImage(img)
          
          setAnalysisResult(result)
          
          if (result.faceDetected) {
            toast({
              title: '顔検出成功！',
              description: `信頼度: ${(result.confidence * 100).toFixed(1)}%`,
            })
          } else {
            toast({
              variant: 'destructive',
              title: '顔が検出されませんでした',
              description: '正面を向いた顔写真をアップロードしてください',
            })
          }
        } catch (error) {
          console.error('Face analysis error:', error)
          toast({
            variant: 'destructive',
            title: '分析エラー',
            description: '画像の分析中にエラーが発生しました',
          })
        } finally {
          setAnalyzing(false)
        }
      }
      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('Image processing error:', error)
      setAnalyzing(false)
      toast({
        variant: 'destructive',
        title: '画像処理エラー',
        description: '画像の処理中にエラーが発生しました',
      })
    }
  }

  const handleImageRemove = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
  }

  const handleCameraCapture = (file: File) => {
    setShowCamera(false)
    handleImageSelect(file)
  }

  const handleCameraCancel = () => {
    setShowCamera(false)
  }

  const handleShowCamera = () => {
    setShowCamera(true)
  }

  const handleProceedToAnalysis = async () => {
    if (uploadedImage && analysisResult && user?.id) {
      try {
        // Import makeup engine to generate suggestions
        const { makeupEngine } = await import('@/lib/makeup-suggestions')
        
        // Generate makeup plan
        const makeupPlan = makeupEngine.generateSuggestions(
          analysisResult, 
          selectedRegion, 
          { style: 'natural', occasion: 'daily' }
        )

        // Convert image to base64 for storage
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(uploadedImage)
        })

        // Save to database
        const analysisId = await DatabaseService.saveAnalysisResult(
          {
            user_id: user.id,
            face_analysis: analysisResult,
            selected_trend_region: selectedRegion,
            analysis_type: 'standard',
            occasion: 'daily',
            processing_time_ms: 2000 // Mock processing time
          },
          makeupPlan,
          imageData
        )

        if (analysisId) {
          // Store for next page - keep sessionStorage as backup
          sessionStorage.setItem('faceAnalysisResult', JSON.stringify(analysisResult))
          sessionStorage.setItem('selectedRegion', selectedRegion)
          sessionStorage.setItem('analysisId', analysisId)
          
          toast({
            title: '分析結果を保存しました',
            description: '履歴から後で確認できます',
          })
          
          router.push('/analysis/results')
        } else {
          throw new Error('保存に失敗しました')
        }
      } catch (error) {
        console.error('Save analysis error:', error)
        
        // Fallback to sessionStorage only
        sessionStorage.setItem('faceAnalysisResult', JSON.stringify(analysisResult))
        sessionStorage.setItem('selectedRegion', selectedRegion)
        
        toast({
          variant: 'destructive',
          title: '保存エラー',
          description: '結果は一時的に保存されています',
        })
        
        router.push('/analysis/results')
      }
    }
  }

  const handleUpgradeClick = () => {
    router.push('/pricing')
  }

  return (
    <MainLayout
      isAuthenticated={true}
      user={user ? {
        id: user.id,
        name: user.user_metadata?.name,
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url
      } : undefined}
      showHeader={false}
      showFooter={false}
      showBottomNav={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-12 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Camera className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">写真をアップロード</h1>
          </div>
          <p className="text-pink-100 text-sm">正面から撮影してください</p>
        </motion.div>

        {/* Content */}
        <div className="p-4 pb-24 space-y-6">
          {/* Usage Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <UsageDisplay
              userId={user?.id}
              onUpgradeClick={handleUpgradeClick}
              compact={false}
            />
          </motion.div>

          {/* Upload Area or Camera */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {showCamera ? (
              <CameraCapture
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
                className="shadow-lg"
              />
            ) : (
              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  className="shadow-lg"
                />
                
                {/* Camera Button */}
                <div className="text-center">
                  <Button
                    onClick={handleShowCamera}
                    variant="outline"
                    className="w-full max-w-sm mx-auto h-12 text-lg border-2 border-dashed border-gray-300 hover:border-pink-500 hover:bg-pink-50"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    カメラで撮影
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Analysis Progress */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              {initializing ? (
                <>
                  <p className="text-gray-700 font-medium">AI を初期化中...</p>
                  <p className="text-sm text-gray-500">MediaPipe顔分析エンジンを準備しています</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 font-medium">顔を分析中...</p>
                  <p className="text-sm text-gray-500">AIがあなたの顔を解析しています</p>
                </>
              )}
            </motion.div>
          )}

          {/* Analysis Result */}
          {analysisResult && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-900">分析完了！</h3>
                      <p className="text-sm text-green-700">
                        信頼度: {(analysisResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">顔型</p>
                      <p className="font-semibold text-gray-900">
                        {analysisResult.faceShape === 'oval' ? '卵型' :
                         analysisResult.faceShape === 'round' ? '丸型' :
                         analysisResult.faceShape === 'square' ? '四角型' :
                         analysisResult.faceShape === 'heart' ? 'ハート型' : '面長型'}
                      </p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">肌色</p>
                      <p className="font-semibold text-gray-900">
                        {analysisResult.skinTone === 'light' ? '明るめ' :
                         analysisResult.skinTone === 'medium' ? '標準' :
                         analysisResult.skinTone === 'dark' ? '濃いめ' : '深め'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Info className="w-5 h-5 text-teal-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                      📝 撮影のポイント
                    </h3>
                    <div className="space-y-2">
                      {[
                        "正面を向いて撮影",
                        "明るい場所で撮影", 
                        "顔全体が写るように",
                        "メイクありでもOK"
                      ].map((tip, index) => (
                        <motion.div
                          key={tip}
                          className="flex items-center gap-3 text-sm text-teal-800"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                        >
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          {tip}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Region Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🌍 メイクスタイル
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region, index) => (
                    <motion.button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 ${
                        selectedRegion === region.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl mb-2">{region.flag}</div>
                      <div className="font-medium text-sm">{region.name}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Proceed to Results Button */}
          {analysisResult && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="w-full h-14 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleProceedToAnalysis}
              >
                <Sparkles className="mr-3 w-5 h-5" />
                メイク提案を見る
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}