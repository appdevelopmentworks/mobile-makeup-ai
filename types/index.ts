// Export all types
export * from './database'
export * from './api'

// Additional common types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncFunction<T = any> = () => Promise<T>

// UI Component Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Form Types
export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
}

export interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// File Types
export interface UploadedFile {
  name: string
  size: number
  type: string
  lastModified: number
  data: string // Base64
}

// Analytics Types
export interface AnalyticsEvent {
  name: string
  category: string
  properties?: Record<string, any>
  timestamp?: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Theme Types
export interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
    muted: string
    accent: string
    error: string
    warning: string
    success: string
    info: string
  }
  fonts: {
    body: string
    heading: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
}

// MediaPipe Types
export interface MediaPipeResults {
  multiFaceLandmarks?: Array<Array<{
    x: number
    y: number
    z: number
  }>>
  multiFaceGeometry?: Array<{
    mesh: Array<{
      x: number
      y: number
      z: number
    }>
  }>
}

// Image Processing Types
export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

export interface ProcessedImage {
  original: string
  thumbnail?: string
  dimensions: ImageDimensions
  size: number
  format: string
}

// Subscription Types
export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_yearly'

export interface SubscriptionFeatures {
  analysisLimit: number | 'unlimited'
  imageGeneration: boolean
  advancedFeatures: boolean
  prioritySupport: boolean
  adFree: boolean
}

// Constants
export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    analysisLimit: 3,
    imageGeneration: true,
    advancedFeatures: false,
    prioritySupport: false,
    adFree: false
  },
  premium_monthly: {
    analysisLimit: 'unlimited',
    imageGeneration: true,
    advancedFeatures: true,
    prioritySupport: true,
    adFree: true
  },
  premium_yearly: {
    analysisLimit: 'unlimited',
    imageGeneration: true,
    advancedFeatures: true,
    prioritySupport: true,
    adFree: true
  }
}