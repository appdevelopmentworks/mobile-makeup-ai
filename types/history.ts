// Types for analysis history and user data

export interface HistoryItem {
  id: string
  userId: string
  imageUrl: string
  thumbnailUrl: string
  faceShape: string
  skinTone: string
  selectedStyle: string
  styleName: string
  confidence: number
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
  tags?: string[]
}

export interface HistoryFilters {
  dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'all'
  faceShape?: string
  skinTone?: string
  style?: string
  favorites?: boolean
  searchQuery?: string
}

export interface UserStats {
  totalAnalyses: number
  currentMonthUsage: number
  monthlyLimit: number
  favoriteCount: number
  mostUsedStyle: string
  joinedDate: string
}

// Mock data for development
export const mockHistoryItems: HistoryItem[] = [
  {
    id: 'hist-001',
    userId: 'user-1',
    imageUrl: '/placeholder-face-1.jpg',
    thumbnailUrl: '/placeholder-face-1-thumb.jpg',
    faceShape: '卵型',
    skinTone: 'スプリング',
    selectedStyle: 'natural-jp',
    styleName: 'ナチュラル日本風',
    confidence: 0.88,
    createdAt: '2024-12-20T10:30:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    isFavorite: true,
    tags: ['日常', 'オフィス']
  },
  {
    id: 'hist-002',
    userId: 'user-1',
    imageUrl: '/placeholder-face-2.jpg',
    thumbnailUrl: '/placeholder-face-2-thumb.jpg',
    faceShape: '卵型',
    skinTone: 'スプリング',
    selectedStyle: 'korean-gradient',
    styleName: 'グラデーションリップ',
    confidence: 0.92,
    createdAt: '2024-12-18T15:45:00Z',
    updatedAt: '2024-12-18T15:45:00Z',
    isFavorite: false,
    tags: ['トレンド', 'デート']
  },
  {
    id: 'hist-003',
    userId: 'user-1',
    imageUrl: '/placeholder-face-3.jpg',
    thumbnailUrl: '/placeholder-face-3-thumb.jpg',
    faceShape: '卵型',
    skinTone: 'スプリング',
    selectedStyle: 'evening-glam',
    styleName: 'イブニンググラム',
    confidence: 0.85,
    createdAt: '2024-12-15T18:20:00Z',
    updatedAt: '2024-12-15T18:20:00Z',
    isFavorite: true,
    tags: ['パーティー', '特別な日']
  },
  {
    id: 'hist-004',
    userId: 'user-1',
    imageUrl: '/placeholder-face-4.jpg',
    thumbnailUrl: '/placeholder-face-4-thumb.jpg',
    faceShape: '卵型',
    skinTone: 'スプリング',
    selectedStyle: 'office-professional',
    styleName: 'オフィスメイク',
    confidence: 0.90,
    createdAt: '2024-12-10T09:15:00Z',
    updatedAt: '2024-12-10T09:15:00Z',
    isFavorite: false,
    tags: ['ビジネス', 'プロフェッショナル']
  },
  {
    id: 'hist-005',
    userId: 'user-1',
    imageUrl: '/placeholder-face-5.jpg',
    thumbnailUrl: '/placeholder-face-5-thumb.jpg',
    faceShape: '卵型',
    skinTone: 'スプリング',
    selectedStyle: 'chinese-doll',
    styleName: 'ドールメイク',
    confidence: 0.87,
    createdAt: '2024-12-08T14:30:00Z',
    updatedAt: '2024-12-08T14:30:00Z',
    isFavorite: false,
    tags: ['可愛い', 'アジアン']
  }
]

export const mockUserStats: UserStats = {
  totalAnalyses: 15,
  currentMonthUsage: 5,
  monthlyLimit: 3, // For free users
  favoriteCount: 3,
  mostUsedStyle: 'ナチュラル日本風',
  joinedDate: '2024-11-15T00:00:00Z'
}