'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  Palette, 
  Sparkles, 
  Heart, 
  Save,
  Share2,
  Star,
  Info,
  Zap
} from 'lucide-react'
import type { AnalysisResult } from '@/types/analysis'
import { MakeupPlan } from '@/lib/makeup-suggestions'

interface InteractiveResultProps {
  analysisData: AnalysisResult
  makeupPlan: MakeupPlan | null
  onSaveResults: () => void
  isSaved: boolean
}

export function InteractiveResult({ 
  analysisData, 
  makeupPlan, 
  onSaveResults, 
  isSaved 
}: InteractiveResultProps) {
  const [activeTab, setActiveTab] = useState('analysis')
  const [likedSuggestions, setLikedSuggestions] = useState<string[]>([])

  const handleLikeSuggestion = (suggestionId: string) => {
    setLikedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    )
  }

  const shareResults = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'MakeupAI 分析結果',
        text: `私の顔型は${analysisData.faceShape.type}、パーソナルカラーは${analysisData.skinTone.type}でした！`,
        url: window.location.href
      })
    }
  }

  const getFaceShapeEmoji = (type: string) => {
    const emojis = {
      oval: '🥚',
      round: '⭕',
      square: '⬜',
      heart: '💖',
      oblong: '📏'
    }
    return emojis[type as keyof typeof emojis] || '✨'
  }

  const getSkinToneEmoji = (type: string) => {
    const emojis = {
      spring: '🌸',
      summer: '🌺',
      autumn: '🍂',
      winter: '❄️'
    }
    return emojis[type as keyof typeof emojis] || '🎨'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Quick Results Summary */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink-500" />
              <span className="text-xl">あなたの分析結果</span>
            </div>
            <Badge variant="secondary" className="bg-pink-100 text-pink-700">
              信頼度 {Math.round(analysisData.confidence * 100)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              className="bg-white/60 p-4 rounded-xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl mb-2">
                {getFaceShapeEmoji(analysisData.faceShape.type)}
              </div>
              <h3 className="font-bold text-pink-700 mb-1">顔型</h3>
              <p className="text-sm text-pink-600">
                {analysisData.faceShape.type === 'oval' ? '卵型' :
                 analysisData.faceShape.type === 'round' ? '丸型' :
                 analysisData.faceShape.type === 'square' ? '四角型' :
                 analysisData.faceShape.type === 'heart' ? 'ハート型' : '面長型'}
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/60 p-4 rounded-xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl mb-2">
                {getSkinToneEmoji(analysisData.skinTone.type)}
              </div>
              <h3 className="font-bold text-purple-700 mb-1">パーソナルカラー</h3>
              <p className="text-sm text-purple-600">
                {analysisData.skinTone.type === 'spring' ? 'スプリング' :
                 analysisData.skinTone.type === 'summer' ? 'サマー' :
                 analysisData.skinTone.type === 'autumn' ? 'オータム' : 'ウィンター'}
              </p>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onSaveResults}
              disabled={isSaved}
              variant={isSaved ? "secondary" : "default"}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isSaved ? (
                <>
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  保存済み
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  結果を保存
                </>
              )}
            </Button>
            <Button
              onClick={shareResults}
              variant="outline"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              シェア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Tabs */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">詳細分析</span>
                <span className="sm:hidden">分析</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">メイク提案</span>
                <span className="sm:hidden">提案</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">インサイト</span>
                <span className="sm:hidden">洞察</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="p-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  詳細分析結果
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">顔型の特徴</h4>
                    <p className="text-sm text-blue-700">
                      {analysisData.faceShape.description}
                    </p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-blue-600">
                        適合度: {Math.round(analysisData.faceShape.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">肌色の特徴</h4>
                    <p className="text-sm text-purple-700">
                      {analysisData.skinTone.description}
                    </p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-purple-600">
                        アンダートーン: {analysisData.skinTone.undertone}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">AIからのアドバイス</h4>
                      <p className="text-sm text-yellow-700">
                        あなたの{analysisData.faceShape.type}型の顔型と{analysisData.skinTone.type}タイプの肌色の組み合わせは、
                        バランスの取れたナチュラルメイクが特に似合います。特に温かみのある色合いを選ぶことで、
                        自然な美しさを引き出すことができます。
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="suggestions" className="p-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-500" />
                  パーソナライズメイク提案
                </h3>

                {makeupPlan ? (
                  <div className="space-y-4">
                    {makeupPlan.suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600">{suggestion.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeSuggestion(suggestion.id)}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                likedSuggestions.includes(suggestion.id) 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                        </div>

                        <div className="text-sm text-gray-700">
                          <p><strong>難易度:</strong> {
                            suggestion.difficulty === 'beginner' ? '初級' :
                            suggestion.difficulty === 'intermediate' ? '中級' : '上級'
                          }</p>
                          <p><strong>所要時間:</strong> {suggestion.timeEstimate}</p>
                        </div>

                        {suggestion.products.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">推奨商品:</p>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.products.slice(0, 2).map((product) => (
                                <Badge key={product.id} variant="secondary" className="text-xs">
                                  {product.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>メイク提案を生成中...</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="p-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  パーソナルインサイト
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎯 あなたの強み</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• バランスの取れた顔立ち</li>
                      <li>• 自然な美しさ</li>
                      <li>• 多様なメイクスタイルに対応</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">✨ おすすめポイント</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• ナチュラルメイクがベスト</li>
                      <li>• 温かみのある色合いを選択</li>
                      <li>• 骨格を活かしたコントゥアリング</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-3">📊 分析サマリー</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(analysisData.confidence * 100)}%
                      </div>
                      <div className="text-xs text-orange-700">分析精度</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {makeupPlan?.suggestions.length || 0}
                      </div>
                      <div className="text-xs text-red-700">メイク提案</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        <Star className="w-6 h-6 mx-auto" />
                      </div>
                      <div className="text-xs text-yellow-700">プレミアム対応</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}