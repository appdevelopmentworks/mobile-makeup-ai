'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Info } from 'lucide-react'
import type { FaceShape } from '@/types/analysis'

interface FaceShapeDisplayProps {
  faceShape: FaceShape
}

const FACE_SHAPE_INFO = {
  oval: {
    emoji: '⭐',
    title: '卵型',
    features: ['バランスの取れた輪郭', '理想的なプロポーション', '多様なスタイルが似合う'],
    tips: ['どんなメイクスタイルも挑戦できます', 'チークは頬骨に沿って自然に', '眉毛は自然なアーチを保つ']
  },
  round: {
    emoji: '🌸',
    title: '丸型',
    features: ['やわらかい印象', '可愛らしい輪郭', '若々しい印象'],
    tips: ['縦のラインを強調', 'シェーディングで立体感を', 'アイラインは長めに']
  },
  square: {
    emoji: '💎',
    title: '四角型',
    features: ['しっかりとした輪郭', 'クールな印象', '意志の強さを表現'],
    tips: ['角を柔らかく見せる', 'チークは丸く入れる', '眉毛はアーチ型に']
  },
  heart: {
    emoji: '💕',
    title: 'ハート型',
    features: ['上部が広い', '顎がシャープ', '華やかな印象'],
    tips: ['下部にボリュームを', 'チークは低めの位置に', '唇にポイントを']
  },
  oblong: {
    emoji: '🌟',
    title: '面長',
    features: ['縦長の輪郭', '大人っぽい印象', 'エレガント'],
    tips: ['横幅を強調', 'チークは広めに', '眉毛は水平に近く']
  },
  diamond: {
    emoji: '💠',
    title: 'ダイヤモンド型',
    features: ['頬骨が高い', 'シャープな印象', '立体的な顔立ち'],
    tips: ['頬骨を柔らかく', '額とあごにハイライト', 'チークは控えめに']
  }
}

export function FaceShapeDisplay({ faceShape }: FaceShapeDisplayProps) {
  const shapeInfo = FACE_SHAPE_INFO[faceShape.type]
  const confidencePercentage = Math.round(faceShape.confidence * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{shapeInfo.emoji}</span>
          顔型診断
        </CardTitle>
        <CardDescription>
          AIが分析したあなたの顔型とその特徴
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Face Shape Result */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-pink-600">
              {shapeInfo.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {faceShape.description}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            確信度 {confidencePercentage}%
          </Badge>
        </div>

        {/* Confidence Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>分析の確信度</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} />
        </div>

        {/* Face Shape Features */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            顔型の特徴
          </h4>
          <div className="grid gap-2">
            {shapeInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Makeup Tips */}
        <div className="bg-pink-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-pink-900">
            💡 {shapeInfo.title}に似合うメイクのコツ
          </h4>
          <div className="space-y-2">
            {shapeInfo.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-pink-800">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}