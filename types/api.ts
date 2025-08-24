// API Request/Response Types

// Common Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp?: string
  path?: string
  requestId?: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  fullName?: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    fullName: string | null
    subscriptionStatus: 'free' | 'premium'
    monthlyUsageCount?: number
    lastLoginAt?: string
  }
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    expiresAt: string
  }
}

// Analysis Types
export interface FaceAnalysisRequest {
  image: string // Base64 encoded
  trendRegion?: string
  occasion?: string
  analysisType?: 'quick' | 'standard' | 'detailed'
}

export interface FaceAnalysisResponse {
  analysisId: string
  status: 'pending' | 'processing' | 'completed'
  faceAnalysis: FaceAnalysis
  processingTime: number
  remainingUsage?: number
}

export interface FaceAnalysis {
  shape: 'oval' | 'round' | 'square' | 'heart' | 'oblong'
  skinTone: {
    type: string
    undertone: 'warm' | 'cool' | 'neutral'
    hexCode: string
  }
  features: {
    eyes: {
      shape: string
      distance: 'normal' | 'wide' | 'close'
      size: 'small' | 'medium' | 'large'
    }
    nose: {
      shape: string
      width: 'narrow' | 'medium' | 'wide'
    }
    lips: {
      shape: string
      fullness: 'thin' | 'medium' | 'full'
    }
    eyebrows: {
      shape: string
      thickness: 'thin' | 'medium' | 'thick'
    }
  }
  landmarks: number[][]
  confidence: number
}

// Makeup Suggestion Types
export interface MakeupSuggestionRequest {
  analysisId: string
  preferences?: {
    style?: string[]
    intensity?: 'light' | 'medium' | 'heavy'
    avoidColors?: string[]
  }
}

export interface MakeupSuggestionResponse {
  suggestionId: string
  analysisId: string
  suggestions: MakeupSuggestions
  instructions: string[]
  tips: string[]
  confidence: number
}

export interface MakeupSuggestions {
  base: {
    foundation: {
      type: string
      shade: string
      finish: string
      application: string
    }
    concealer: {
      areas: string[]
      shade: string
      technique: string
    }
    powder: {
      type: string
      areas: string[]
    }
  }
  eyes: {
    eyeshadow: {
      colors: string[]
      technique: string
      placement: Record<string, string>
    }
    eyeliner: {
      type: string
      color: string
      style: string
    }
    mascara: {
      type: string
      application: string
    }
  }
  lips: {
    color: string
    finish: string
    technique: string
    liner: boolean
  }
  cheeks: {
    blush: {
      color: string
      placement: string
      intensity: string
    }
    highlighter: {
      areas: string[]
      type: string
    }
    contour?: {
      areas: string[]
      shade: string
    }
  }
}

// Image Generation Types
export interface GenerateImageRequest {
  analysisId: string
  suggestionId: string
  style?: 'natural' | 'glamorous' | 'artistic'
  intensity?: number // 0-100
  model?: 'imagen' | 'dalle'
}

export interface GenerateImageResponse {
  generationId: string
  imageUrl?: string
  imageData?: string // Base64
  status: 'pending' | 'processing' | 'completed' | 'failed'
  model: string
  generationTime: number
  expiresAt: string
}

// Trend Types
export interface TrendsListQuery {
  region?: string
  limit?: number
  offset?: number
}

export interface TrendsListResponse {
  trends: Trend[]
  total: number
  hasMore: boolean
}

export interface Trend {
  id: string
  region: string
  month: string
  themes: string[]
  popularColors: {
    lip: string[]
    eye: string[]
    cheek: string[]
  }
  techniques: string[]
  popularityScore: number
  items: TrendItem[]
}

export interface TrendItem {
  id: string
  name: string
  category: string
  description: string
  imageUrl?: string
}

// Payment Types
export interface CheckoutRequest {
  planType: 'premium_monthly' | 'premium_yearly'
  promotionCode?: string
}

export interface CheckoutResponse {
  sessionId: string
  checkoutUrl: string
  expiresAt: string
}

export interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  planType: string
  createdAt: string
}

// User Types
export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionStatus: 'free' | 'premium' | 'cancelled'
  subscriptionEndDate: string | null
  monthlyUsageCount: number
  personalColorType?: 'spring' | 'summer' | 'autumn' | 'winter'
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong'
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
}

export interface UserPreferences {
  id: string
  userId: string
  makeupPreferences: {
    style: string[]
    intensity: string
    finish: string
  }
  colorPreferences: {
    favoriteColors: string[]
    avoidedColors: string[]
  }
  avoidedIngredients: string[]
  skinConcerns: string[]
  preferredBrands: string[]
  notificationSettings: {
    email: boolean
    push: boolean
    trends: boolean
    promotions: boolean
  }
}