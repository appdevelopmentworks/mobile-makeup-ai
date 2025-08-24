'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette } from 'lucide-react'
import type { SkinTone } from '@/types/analysis'

interface SkinToneDisplayProps {
  skinTone: SkinTone
}

const SKIN_TONE_INFO = {
  spring: {
    emoji: '🌸',
    title: 'スプリング',
    season: '春',
    characteristics: ['明るく鮮やかな色が似合う', '透明感のある肌', '華やかで若々しい印象'],
    avoidColors: ['くすんだ色', '暗すぎる色', 'グレーベース']
  },
  summer: {
    emoji: '🌊',
    title: 'サマー',
    season: '夏',
    characteristics: ['涼しげで上品', 'ソフトな印象', 'エレガント'],
    avoidColors: ['鮮やすぎる色', 'オレンジ系', '暖色系']
  },
  autumn: {
    emoji: '🍂',
    title: 'オータム',
    season: '秋',
    characteristics: ['深みのある色が似合う', '大人っぽい印象', 'リッチな色合い'],
    avoidColors: ['パステルカラー', '青みの強い色', '薄い色']
  },
  winter: {
    emoji: '❄️',
    title: 'ウィンター',
    season: '冬',
    characteristics: ['コントラストが似合う', 'クールで洗練された印象', 'はっきりとした色'],
    avoidColors: ['中途半端な色', 'くすんだ色', '黄みの強い色']
  }
}

const UNDERTONE_INFO = {
  warm: {
    title: 'ウォームトーン',
    description: '黄みがかった肌色',
    bestColors: ['ゴールド', 'コーラル', 'オレンジ', 'ウォームベージュ'],
    metals: ['ゴールド', 'ブロンズ']
  },
  cool: {
    title: 'クールトーン',
    description: '青みがかった肌色',
    bestColors: ['シルバー', 'ローズピンク', 'ブルーベース', 'クールベージュ'],
    metals: ['シルバー', 'プラチナ']
  },
  neutral: {
    title: 'ニュートラルトーン',
    description: 'バランスの取れた肌色',
    bestColors: ['幅広い色が似合う', 'ニュートラルベージュ', 'ソフトピンク'],
    metals: ['ゴールド', 'シルバー両方']
  }
}

export function SkinToneDisplay({ skinTone }: SkinToneDisplayProps) {
  const seasonInfo = SKIN_TONE_INFO[skinTone.type]
  const undertoneInfo = UNDERTONE_INFO[skinTone.undertone]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          パーソナルカラー診断
        </CardTitle>
        <CardDescription>
          肌の色味に基づいた最適なカラー選び
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Season Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{seasonInfo.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-purple-600">
                {seasonInfo.title} ({seasonInfo.season}タイプ)
              </h3>
              <p className="text-sm text-gray-600">{skinTone.description}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">特徴</h4>
            <div className="space-y-1">
              {seasonInfo.characteristics.map((char, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span className="text-sm text-purple-800">{char}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Undertone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">アンダートーン</h4>
            <Badge variant="outline">{undertoneInfo.title}</Badge>
          </div>
          
          <p className="text-sm text-gray-600">{undertoneInfo.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">おすすめアクセサリー:</span>
              <div className="mt-1 space-y-1">
                {undertoneInfo.metals.map((metal, index) => (
                  <div key={index} className="text-gray-600">• {metal}</div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">ベストカラー:</span>
              <div className="mt-1 space-y-1">
                {undertoneInfo.bestColors.slice(0, 2).map((color, index) => (
                  <div key={index} className="text-gray-600">• {color}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Colors */}
        <div className="space-y-3">
          <h4 className="font-medium">おすすめカラーパレット</h4>
          <div className="grid grid-cols-2 gap-2">
            {skinTone.recommendedColors.map((color, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 border text-center"
              >
                <span className="text-sm font-medium text-gray-700">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colors to Avoid */}
        <div className="bg-red-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-red-900">避けた方が良い色</h4>
          <div className="space-y-1">
            {seasonInfo.avoidColors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                <span className="text-sm text-red-800">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}