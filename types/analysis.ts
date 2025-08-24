// Types for face analysis and makeup suggestions

export interface FaceShape {
  type: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond'
  confidence: number
  description: string
}

export interface SkinTone {
  type: 'spring' | 'summer' | 'autumn' | 'winter'
  undertone: 'warm' | 'cool' | 'neutral'
  description: string
  recommendedColors: string[]
}

export interface FaceFeatures {
  eyeShape: 'almond' | 'round' | 'hooded' | 'monolid' | 'upturned' | 'downturned'
  eyeSize: 'small' | 'medium' | 'large'
  eyebrowShape: 'straight' | 'arched' | 'soft-arch' | 'angular'
  lipShape: 'full' | 'thin' | 'bow' | 'wide' | 'small'
  noseShape: 'straight' | 'button' | 'roman' | 'wide' | 'narrow'
}

export interface MakeupRecommendation {
  category: 'base' | 'eyes' | 'eyebrows' | 'cheeks' | 'lips'
  title: string
  description: string
  products: string[]
  techniques: string[]
  colors: string[]
}

export interface AnalysisResult {
  id: string
  userId: string
  imageUrl: string
  faceShape: FaceShape
  skinTone: SkinTone
  features: FaceFeatures
  recommendations: MakeupRecommendation[]
  selectedStyle: string
  confidence: number
  createdAt: string
  updatedAt: string
}

export interface GeneratedImage {
  id: string
  originalImageUrl: string
  generatedImageUrl: string
  prompt: string
  style: string
  createdAt: string
}

// Mock data for development
export const mockAnalysisResult: AnalysisResult = {
  id: 'analysis-1',
  userId: 'user-1',
  imageUrl: '/placeholder-face.jpg',
  faceShape: {
    type: 'oval',
    confidence: 0.85,
    description: '理想的なバランスの顔型です。どんなメイクスタイルも似合いやすいのが特徴です。'
  },
  skinTone: {
    type: 'spring',
    undertone: 'warm',
    description: 'イエローベース・スプリングタイプ',
    recommendedColors: ['コーラルピンク', 'ピーチ', 'ライトブラウン', 'ゴールド']
  },
  features: {
    eyeShape: 'almond',
    eyeSize: 'medium',
    eyebrowShape: 'soft-arch',
    lipShape: 'full',
    noseShape: 'straight'
  },
  recommendations: [
    {
      category: 'base',
      title: 'ベースメイク',
      description: '透明感のある仕上がりを目指しましょう',
      products: ['リキッドファンデーション', 'コンシーラー', 'フェイスパウダー'],
      techniques: [
        '薄く均一に伸ばす',
        'ハイライトは頬骨の高い位置に',
        'シェーディングは控えめに'
      ],
      colors: ['ピンクベージュ', 'ライトオークル']
    },
    {
      category: 'eyes',
      title: 'アイメイク',
      description: 'アーモンド型の目を活かしたナチュラルメイク',
      products: ['アイシャドウパレット', 'アイライナー', 'マスカラ'],
      techniques: [
        'ブラウン系でグラデーション',
        '細めのアイライン',
        'まつ毛はセパレート重視'
      ],
      colors: ['ライトブラウン', 'ゴールドブラウン', 'ベージュ']
    },
    {
      category: 'eyebrows',
      title: 'アイブロウ',
      description: 'ソフトアーチ型を活かした自然な眉',
      products: ['アイブロウペンシル', 'アイブロウパウダー'],
      techniques: [
        '自然なアーチを保つ',
        '毛流れに沿って描く',
        '眉尻は少し細めに'
      ],
      colors: ['ライトブラウン', 'ナチュラルブラウン']
    },
    {
      category: 'cheeks',
      title: 'チーク',
      description: '健康的な血色感をプラス',
      products: ['パウダーチーク', 'クリームチーク'],
      techniques: [
        '頬の高い位置に円を描くように',
        '笑った時の頬の盛り上がりに',
        'ふんわりとぼかす'
      ],
      colors: ['コーラルピンク', 'ピーチ']
    },
    {
      category: 'lips',
      title: 'リップメイク',
      description: 'ふっくらとした唇を活かしたメイク',
      products: ['リップスティック', 'リップグロス', 'リップライナー'],
      techniques: [
        'リップライナーで輪郭を整える',
        '中央から外側に向かって塗る',
        'グロスで艶感をプラス'
      ],
      colors: ['コーラルオレンジ', 'ピンクベージュ', 'ローズピンク']
    }
  ],
  selectedStyle: 'natural-jp',
  confidence: 0.88,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}