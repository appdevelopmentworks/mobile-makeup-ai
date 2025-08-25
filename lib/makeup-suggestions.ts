// Makeup suggestion engine
import { FaceAnalysisResult } from './face-analysis'

export interface MakeupSuggestion {
  id: string
  category: 'foundation' | 'eyes' | 'lips' | 'cheeks' | 'brows'
  title: string
  description: string
  products: MakeupProduct[]
  steps: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeEstimate: string
  tips: string[]
}

export interface MakeupProduct {
  id: string
  name: string
  brand: string
  shade?: string
  price?: number
  image?: string
  purchaseUrl?: string
}

export interface MakeupPlan {
  overall: {
    style: string
    description: string
    suitability: number // 0-1 score
  }
  suggestions: MakeupSuggestion[]
  colorPalette: {
    foundation: string
    eyeshadow: string[]
    lipstick: string
    blush: string
  }
  totalTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export class MakeupSuggestionEngine {
  generateSuggestions(
    faceAnalysis: FaceAnalysisResult,
    region: string = 'japan',
    preferences?: {
      style?: 'natural' | 'glamour' | 'cute' | 'mature'
      occasion?: 'daily' | 'work' | 'date' | 'party'
    }
  ): MakeupPlan {
    const { faceShape, skinTone } = faceAnalysis
    const style = preferences?.style || 'natural'

    // Base suggestions based on face analysis
    const suggestions: MakeupSuggestion[] = []

    // Foundation suggestion
    suggestions.push(this.generateFoundationSuggestion(skinTone, region))

    // Eye makeup based on face shape and region
    suggestions.push(this.generateEyeMakeupSuggestion(faceShape, region, style))

    // Lip makeup
    suggestions.push(this.generateLipMakeupSuggestion(faceShape, skinTone, style))

    // Cheek makeup
    suggestions.push(this.generateCheekMakeupSuggestion(faceShape, skinTone))

    // Eyebrow suggestion
    suggestions.push(this.generateEyebrowSuggestion(faceShape))

    // Generate color palette
    const colorPalette = this.generateColorPalette(skinTone, style)

    // Calculate overall difficulty and time
    const avgDifficulty = suggestions.reduce((acc, s) => {
      const difficultyScore = s.difficulty === 'beginner' ? 1 : 
                             s.difficulty === 'intermediate' ? 2 : 3
      return acc + difficultyScore
    }, 0) / suggestions.length

    const totalMinutes = suggestions.reduce((acc, s) => {
      const minutes = parseInt(s.timeEstimate.replace(/\D/g, ''))
      return acc + minutes
    }, 0)

    return {
      overall: {
        style: this.getStyleName(style, region),
        description: this.getStyleDescription(style, region, faceShape, skinTone),
        suitability: this.calculateSuitability(faceAnalysis, style, region)
      },
      suggestions,
      colorPalette,
      totalTime: `${totalMinutes}分`,
      difficulty: avgDifficulty <= 1.5 ? 'beginner' : avgDifficulty <= 2.5 ? 'intermediate' : 'advanced'
    }
  }

  private generateFoundationSuggestion(
    skinTone?: string,
    region: string = 'japan'
  ): MakeupSuggestion {
    const shades = {
      light: region === 'japan' ? 'ライトオークル' : 'Light',
      medium: region === 'japan' ? 'ナチュラルオークル' : 'Medium',
      dark: region === 'japan' ? 'オークル' : 'Dark',
      deep: region === 'japan' ? 'ダークオークル' : 'Deep'
    }

    const shade = skinTone ? shades[skinTone as keyof typeof shades] : 'ナチュラルオークル'

    return {
      id: 'foundation',
      category: 'foundation',
      title: 'ベースメイク',
      description: `あなたの肌色に合った${shade}系のファンデーションで自然な仕上がりに`,
      products: [
        {
          id: 'foundation-1',
          name: 'パーフェクト ファンデーション',
          brand: 'SUQQU',
          shade: shade,
          price: 6800
        }
      ],
      steps: [
        '化粧下地を顔全体に薄く伸ばします',
        'ファンデーションを少量ずつ、中心から外側に向けて伸ばします',
        'スポンジで軽くパッティングしてムラを整えます',
        'コンシーラーで気になる部分をカバーします',
        'フェイスパウダーで仕上げます'
      ],
      difficulty: 'beginner',
      timeEstimate: '10分',
      tips: [
        '薄く重ねることで自然な仕上がりになります',
        '首との境目をぼかすことを忘れずに',
        'スポンジは清潔なものを使用してください'
      ]
    }
  }

  private generateEyeMakeupSuggestion(
    faceShape?: string,
    _region: string = 'japan',
    style: string = 'natural'
  ): MakeupSuggestion {
    const techniques = {
      round: '縦幅を強調する縦割りグラデーション',
      oval: 'バランスの良い横割りグラデーション', 
      square: '柔らかい印象の丸みのあるアイメイク',
      heart: '下まぶたを強調したバランス重視のメイク',
      oblong: '横幅を強調する横長アイメイク'
    }

    const technique = faceShape ? techniques[faceShape as keyof typeof techniques] : '横割りグラデーション'

    const colors = style === 'natural' ? ['ベージュ', 'ライトブラウン'] :
                  style === 'glamour' ? ['ゴールド', 'ディープブラウン'] :
                  style === 'cute' ? ['ピンク', 'コーラル'] :
                  ['モーブ', 'プラム']

    return {
      id: 'eye-makeup',
      category: 'eyes',
      title: 'アイメイク',
      description: `${technique}で目元を魅力的に演出`,
      products: [
        {
          id: 'eyeshadow-1',
          name: 'アイシャドウ パレット',
          brand: 'LUNASOL',
          shade: colors.join(' & '),
          price: 5000
        }
      ],
      steps: [
        `${colors[0]}をアイホール全体に薄くのせます`,
        `${colors[1]}を二重幅に入れてグラデーションを作ります`,
        '下まぶたの目尻1/3に同じ色をのせます',
        'アイライナーで目のキワを引きます',
        'マスカラでまつげを上げて仕上げます'
      ],
      difficulty: 'intermediate',
      timeEstimate: '15分',
      tips: [
        'ブラシで少しずつ色をのせることが重要',
        'グラデーションは境目をぼかして自然に',
        'アイライナーは目の形に沿って引く'
      ]
    }
  }

  private generateLipMakeupSuggestion(
    _faceShape?: string,
    _skinTone?: string,
    style: string = 'natural'
  ): MakeupSuggestion {
    const colors = {
      natural: 'コーラルピンク',
      glamour: 'ディープレッド', 
      cute: 'チェリーピンク',
      mature: 'ローズベージュ'
    }

    const color = colors[style as keyof typeof colors] || 'コーラルピンク'

    return {
      id: 'lip-makeup',
      category: 'lips',
      title: 'リップメイク',
      description: `${color}で自然で魅力的な唇に`,
      products: [
        {
          id: 'lipstick-1',
          name: 'ルージュ',
          brand: 'CHANEL',
          shade: color,
          price: 4500
        }
      ],
      steps: [
        'リップバームで唇を保湿します',
        'リップライナーで唇の輪郭を整えます（オプション）',
        'リップスティックを直接、または筆で塗ります',
        'ティッシュで軽く押さえます',
        '必要に応じてグロスで仕上げます'
      ],
      difficulty: 'beginner',
      timeEstimate: '5分',
      tips: [
        '保湿を忘れずに行う',
        '輪郭をきれいに整えると上品な印象に',
        '重ね塗りで色の調整が可能'
      ]
    }
  }

  private generateCheekMakeupSuggestion(
    faceShape?: string,
    _skinTone?: string
  ): MakeupSuggestion {
    const placement = {
      round: '頬の高い位置から斜め上に向けて',
      oval: '頬骨の一番高い位置に丸く',
      square: '頬の高い位置に横長に',
      heart: '頬の中央から外側に向けて',
      oblong: '頬の広い範囲に横長に'
    }

    const method = faceShape ? placement[faceShape as keyof typeof placement] : '頬骨の一番高い位置に丸く'

    return {
      id: 'cheek-makeup',
      category: 'cheeks',
      title: 'チークメイク',
      description: `${method}入れて、健康的で立体的な印象に`,
      products: [
        {
          id: 'blush-1',
          name: 'パウダーチーク',
          brand: 'NARS',
          shade: 'オーガズム',
          price: 3800
        }
      ],
      steps: [
        'ブラシにチークを適量とります',
        '手の甲で余分な粉を落とします',
        `${method}ブラシでのせます`,
        '鏡で全体のバランスを確認します',
        '必要に応じて色を重ねて調整します'
      ],
      difficulty: 'beginner',
      timeEstimate: '5分',
      tips: [
        '薄く重ねることで自然な仕上がりに',
        '笑った時に高くなる部分にのせると自然',
        'ブラシは清潔なものを使用'
      ]
    }
  }

  private generateEyebrowSuggestion(faceShape?: string): MakeupSuggestion {
    const shapes = {
      round: '角度をつけたアーチ眉で縦のラインを強調',
      oval: 'ナチュラルなアーチ眉でバランス良く',
      square: '柔らかいカーブの眉で優しい印象に',
      heart: '水平に近い眉で下半分のバランスを取る',
      oblong: '水平眉で横のラインを強調'
    }

    const shape = faceShape ? shapes[faceShape as keyof typeof shapes] : 'ナチュラルなアーチ眉'

    return {
      id: 'eyebrow-makeup',
      category: 'brows',
      title: '眉メイク',
      description: shape,
      products: [
        {
          id: 'eyebrow-1',
          name: 'アイブロウ パウダー',
          brand: 'KATE',
          shade: 'ライトブラウン',
          price: 1200
        }
      ],
      steps: [
        'スクリューブラシで眉毛の流れを整えます',
        '眉尻から眉山に向けてパウダーをのせます',
        '眉頭は薄く、眉尻は濃くグラデーションを作ります',
        'アイブロウペンシルで足りない部分を描き足します',
        '最後にスクリューブラシで全体をぼかします'
      ],
      difficulty: 'intermediate',
      timeEstimate: '8分',
      tips: [
        '自然な眉の形を活かすことが重要',
        '左右対称になるよう鏡でチェック',
        '眉頭は薄く自然に仕上げる'
      ]
    }
  }

  private generateColorPalette(skinTone?: string, style: string = 'natural') {
    const palettes = {
      light: {
        natural: {
          foundation: '#F5D5B8',
          eyeshadow: ['#E8C4A5', '#D4A574'],
          lipstick: '#E8A298',
          blush: '#F4B2A7'
        },
        glamour: {
          foundation: '#F5D5B8',
          eyeshadow: ['#D4AF37', '#B8860B'],
          lipstick: '#DC143C',
          blush: '#CD5C5C'
        }
      },
      medium: {
        natural: {
          foundation: '#E8B896',
          eyeshadow: ['#D2B48C', '#BC9A6A'],
          lipstick: '#D2716F',
          blush: '#E8927C'
        },
        glamour: {
          foundation: '#E8B896',
          eyeshadow: ['#DAA520', '#B8860B'],
          lipstick: '#B22222',
          blush: '#A0522D'
        }
      }
    }

    const toneKey = (skinTone === 'dark' || skinTone === 'deep') ? 'medium' : (skinTone || 'light') as 'light' | 'medium'
    const styleKey = (['natural', 'glamour'].includes(style) ? style : 'natural') as 'natural' | 'glamour'

    return palettes[toneKey][styleKey]
  }

  private getStyleName(style: string, region: string): string {
    const styles = {
      japan: {
        natural: 'ナチュラル美人メイク',
        glamour: '大人グラマラスメイク',
        cute: 'キュート系メイク',
        mature: '上品大人メイク'
      },
      korea: {
        natural: 'オルチャン風ナチュラルメイク',
        glamour: 'Kビューティーグラマーメイク',
        cute: '韓国アイドル風キュートメイク',
        mature: 'エレガント韓国メイク'
      }
    }

    return styles[region as keyof typeof styles]?.[style as keyof typeof styles.japan] || 'ナチュラルメイク'
  }

  private getStyleDescription(style: string, _region: string, faceShape?: string, skinTone?: string): string {
    const base = `あなたの${faceShape === 'oval' ? '卵型' : faceShape === 'round' ? '丸型' : ''}の顔型と${skinTone}系の肌色に合わせて`
    
    switch (style) {
      case 'natural':
        return `${base}、自然な美しさを引き出すナチュラルメイクをご提案します。`
      case 'glamour':
        return `${base}、華やかで印象的なグラマラスメイクをご提案します。`
      case 'cute':
        return `${base}、愛らしくフレッシュなキュートメイクをご提案します。`
      case 'mature':
        return `${base}、上品で洗練された大人メイクをご提案します。`
      default:
        return `${base}、あなたに最適なメイクをご提案します。`
    }
  }

  private calculateSuitability(analysis: FaceAnalysisResult, _style: string, _region: string): number {
    let score = 0.8 // Base score
    
    // Add bonuses based on analysis
    if (analysis.faceDetected) score += 0.1
    if (analysis.confidence > 0.8) score += 0.1
    
    return Math.min(score, 1.0)
  }
}

// Singleton instance
export const makeupEngine = new MakeupSuggestionEngine()