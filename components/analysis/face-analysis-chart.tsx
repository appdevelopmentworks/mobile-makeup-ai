'use client'

import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Palette } from 'lucide-react'

interface FaceAnalysisChartProps {
  faceShape: {
    type: string
    confidence: number
    description: string
  }
  skinTone: {
    type: string
    undertone: string
    description: string
  }
  confidence: number
}

export function FaceAnalysisChart({ faceShape, skinTone, confidence }: FaceAnalysisChartProps) {
  // Data for confidence chart
  const confidenceData = [
    {
      name: '全体的信頼度',
      value: Math.round(confidence * 100),
      fill: '#ec4899'
    },
    {
      name: '顔型分析',
      value: Math.round(faceShape.confidence * 100),
      fill: '#8b5cf6'
    },
    {
      name: '肌色診断',
      value: 89, // Mock data
      fill: '#06b6d4'
    }
  ]

  // Data for feature distribution
  const featureData = [
    { name: '顔型', value: 35, fill: '#ec4899' },
    { name: '肌色', value: 30, fill: '#8b5cf6' },
    { name: '目元', value: 20, fill: '#06b6d4' },
    { name: '輪郭', value: 15, fill: '#f59e0b' }
  ]

  const getFaceShapeLabel = (type: string) => {
    const labels = {
      oval: '卵型',
      round: '丸型',
      square: '四角型',
      heart: 'ハート型',
      oblong: '面長'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getSkinToneLabel = (type: string) => {
    const labels = {
      spring: 'スプリング',
      summer: 'サマー',
      autumn: 'オータム',
      winter: 'ウィンター'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      {/* Main Analysis Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confidence Radial Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink-500" />
                分析精度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={confidenceData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              
              <div className="space-y-2 mt-2">
                {confidenceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                分析内訳
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={featureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {featureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-1 mt-2">
                {featureData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Face Shape Card */}
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">顔</span>
              </div>
              顔型分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-pink-700 bg-pink-200">
                {getFaceShapeLabel(faceShape.type)}
              </Badge>
              <span className="text-sm font-bold text-pink-700">
                {Math.round(faceShape.confidence * 100)}% 適合
              </span>
            </div>
            
            <p className="text-sm text-pink-800">
              {faceShape.description}
            </p>
            
            <div className="bg-white/60 p-3 rounded-lg">
              <p className="text-xs text-pink-700">
                💡 {faceShape.type === 'oval' ? '理想的な顔型です。ほとんどのメイクスタイルが似合います。' :
                   faceShape.type === 'round' ? 'シャープなラインを意識したメイクがおすすめです。' :
                   faceShape.type === 'square' ? '柔らかな印象を与えるメイクテクニックを活用しましょう。' :
                   'バランスを重視したメイクで魅力を引き出しましょう。'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skin Tone Card */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">色</span>
              </div>
              パーソナルカラー診断
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-purple-700 bg-purple-200">
                {getSkinToneLabel(skinTone.type)}
              </Badge>
              <span className="text-sm font-bold text-purple-700">
                89% 適合
              </span>
            </div>
            
            <p className="text-sm text-purple-800">
              {skinTone.description}
            </p>
            
            <div className="bg-white/60 p-3 rounded-lg">
              <p className="text-xs text-purple-700">
                🎨 {skinTone.type === 'spring' ? '明るく華やかなカラーがおすすめです。' :
                   skinTone.type === 'summer' ? '上品で涼やかなカラーが似合います。' :
                   skinTone.type === 'autumn' ? '深みのある暖色系カラーがベストです。' :
                   'クールで洗練されたカラーが魅力的です。'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">AI分析サマリー</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  あなたは<strong>{getFaceShapeLabel(faceShape.type)}</strong>の顔型で、
                  <strong>{getSkinToneLabel(skinTone.type)}</strong>タイプの肌色をお持ちです。
                  この組み合わせにより、{confidence >= 0.9 ? '非常に高い精度' : confidence >= 0.8 ? '高い精度' : '良い精度'}
                  で最適なメイクプランを作成しました。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}