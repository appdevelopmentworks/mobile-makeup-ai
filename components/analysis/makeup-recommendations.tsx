'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Eye, 
  Smile, 
  Heart,
  Palette,
  ShoppingBag,
  BookOpen
} from 'lucide-react'
import type { MakeupRecommendation } from '@/types/analysis'

interface MakeupRecommendationsProps {
  recommendations: MakeupRecommendation[]
}

const CATEGORY_CONFIG = {
  base: {
    icon: Sparkles,
    title: 'ベースメイク',
    color: 'bg-pink-100 text-pink-600',
    description: '肌の土台を整える'
  },
  eyes: {
    icon: Eye,
    title: 'アイメイク',
    color: 'bg-blue-100 text-blue-600',
    description: '目元を印象的に'
  },
  eyebrows: {
    icon: Smile,
    title: 'アイブロウ',
    color: 'bg-green-100 text-green-600',
    description: '顔の印象を決める眉'
  },
  cheeks: {
    icon: Heart,
    title: 'チーク',
    color: 'bg-red-100 text-red-600',
    description: '血色感をプラス'
  },
  lips: {
    icon: Palette,
    title: 'リップ',
    color: 'bg-purple-100 text-purple-600',
    description: '魅力的な口元に'
  }
}

export function MakeupRecommendations({ recommendations }: MakeupRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          パーソナライズメイク提案
        </CardTitle>
        <CardDescription>
          あなたの顔型と肌色に最適なメイク方法
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={recommendations[0]?.category} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {recommendations.map((rec) => {
              const config = CATEGORY_CONFIG[rec.category]
              const Icon = config.icon
              return (
                <TabsTrigger 
                  key={rec.category} 
                  value={rec.category}
                  className="flex flex-col gap-1 p-2 h-auto"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{config.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {recommendations.map((rec) => {
            const config = CATEGORY_CONFIG[rec.category]
            const Icon = config.icon

            return (
              <TabsContent key={rec.category} value={rec.category} className="mt-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{rec.title}</h3>
                      <p className="text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>

                  {/* Recommended Colors */}
                  {rec.colors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        おすすめカラー
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.colors.map((color, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Techniques */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      テクニック
                    </h4>
                    <div className="space-y-2">
                      {rec.techniques.map((technique, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">{technique}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Products */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      おすすめアイテム
                    </h4>
                    <div className="grid gap-2">
                      {rec.products.map((product, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-pink-400 rounded-full" />
                          <span className="text-sm">{product}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      おすすめ商品を見る（近日公開）
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}