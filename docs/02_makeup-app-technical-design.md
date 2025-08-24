# メイク指導アプリ 技術実装詳細設計書

## 1. システムアーキテクチャ

### 1.1 全体構成
```
┌─────────────────────────────────────────────────┐
│                  Client (Browser)                │
│  ┌─────────────────────────────────────────┐    │
│  │     Next.js App (Vercel Hosting)        │    │
│  │  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │   React     │  │  TailwindCSS │     │    │
│  │  │  Components │  │   shadcn/ui  │     │    │
│  │  └─────────────┘  └─────────────┘     │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│              API Routes (Next.js)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Auth    │  │  Makeup  │  │  Payment │     │
│  │  Routes  │  │  Analysis│  │  Routes  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │  AI APIs     │ │    Stripe    │
│  - Auth      │ │  - Google    │ │   Payment    │
│  - Database  │ │  - OpenAI    │ │              │
│  - Storage   │ │  - MediaPipe │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 データフロー
1. ユーザーが写真をアップロード → クライアントでMediaPipe処理
2. 顔分析結果 → API Route経由でSupabaseに保存
3. メイク提案生成 → AI APIを呼び出し
4. 画像生成 → Google/OpenAI APIで処理
5. 結果表示 → クライアントに返却、端末保存オプション提供

## 2. プロジェクト構造

```
makeup-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証関連ページ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # ダッシュボード（要認証）
│   │   ├── analysis/             # 分析ページ
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── history/              # 履歴ページ
│   │   │   └── page.tsx
│   │   ├── settings/             # 設定ページ
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...supabase]/
│   │   │       └── route.ts
│   │   ├── analysis/
│   │   │   ├── face/
│   │   │   │   └── route.ts
│   │   │   └── makeup/
│   │   │       └── route.ts
│   │   ├── generate/
│   │   │   └── image/
│   │   │       └── route.ts
│   │   ├── trends/
│   │   │   └── route.ts
│   │   └── payment/
│   │       ├── checkout/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                  # ホームページ
│   └── globals.css              # グローバルスタイル
├── components/                   # Reactコンポーネント
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── features/                # 機能別コンポーネント
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx
│   │   │   └── PhotoUpload.tsx
│   │   ├── analysis/
│   │   │   ├── FaceAnalyzer.tsx
│   │   │   ├── MakeupSuggestion.tsx
│   │   │   └── ResultDisplay.tsx
│   │   ├── generation/
│   │   │   ├── ImageGenerator.tsx
│   │   │   └── GeneratedPreview.tsx
│   │   └── trends/
│   │       ├── TrendSelector.tsx
│   │       └── TrendDisplay.tsx
│   └── layout/                 # レイアウトコンポーネント
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
├── lib/                         # ユーティリティ・設定
│   ├── supabase/
│   │   ├── client.ts           # Supabaseクライアント
│   │   ├── server.ts           # Supabaseサーバー
│   │   └── middleware.ts       # 認証ミドルウェア
│   ├── ai/
│   │   ├── mediapipe.ts        # MediaPipe設定
│   │   ├── imagen.ts           # Google Imagen API
│   │   └── openai.ts           # OpenAI API
│   ├── payment/
│   │   └── stripe.ts           # Stripe設定
│   ├── utils/
│   │   ├── image.ts            # 画像処理ユーティリティ
│   │   ├── validation.ts       # バリデーション
│   │   └── constants.ts        # 定数定義
│   └── hooks/                  # カスタムフック
│       ├── useAuth.ts
│       ├── useAnalysis.ts
│       └── useSubscription.ts
├── types/                       # TypeScript型定義
│   ├── database.ts
│   ├── api.ts
│   └── components.ts
├── public/                      # 静的ファイル
│   └── images/
├── middleware.ts                # Next.jsミドルウェア
├── .env.local                   # 環境変数
├── next.config.js              # Next.js設定
├── tailwind.config.ts          # Tailwind設定
├── package.json
└── tsconfig.json               # TypeScript設定
```

## 3. データベース設計（Supabase）

### 3.1 テーブル構造

```sql
-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium'
  subscription_end_date TIMESTAMP,
  monthly_usage_count INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preferences JSONB DEFAULT '{}', -- 好み設定
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分析履歴
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT, -- 将来的な実装用
  face_data JSONB NOT NULL, -- MediaPipe分析結果
  skin_analysis JSONB, -- 肌分析結果
  makeup_suggestions JSONB, -- メイク提案内容
  selected_trend TEXT, -- 選択されたトレンド地域
  generated_image_data TEXT, -- Base64エンコード画像（一時保存）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トレンド情報（月次更新）
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL, -- 'japan', 'korea', 'western', etc.
  trend_data JSONB NOT NULL, -- トレンド詳細
  month DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region, month)
);

-- 支払い履歴
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS) ポリシー
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own analysis" ON analysis_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payment_history
  FOR ALL USING (auth.uid() = user_id);
```

### 3.2 インデックス
```sql
CREATE INDEX idx_analysis_user_created ON analysis_history(user_id, created_at DESC);
CREATE INDEX idx_trends_region_month ON trends(region, month DESC);
CREATE INDEX idx_payment_user ON payment_history(user_id);
```

## 4. API設計

### 4.1 認証API

```typescript
// app/api/auth/[...supabase]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// Supabase Auth Helpersが自動処理
// /api/auth/callback
// /api/auth/sign-in
// /api/auth/sign-out
// /api/auth/sign-up
```

### 4.2 顔分析API

```typescript
// app/api/analysis/face/route.ts
interface FaceAnalysisRequest {
  image: string; // Base64エンコード画像
}

interface FaceAnalysisResponse {
  success: boolean;
  data?: {
    faceShape: string;
    skinTone: string;
    facialFeatures: {
      eyes: object;
      nose: object;
      mouth: object;
      eyebrows: object;
    };
    landmarks: number[][];
  };
  error?: string;
}

// POST /api/analysis/face
export async function POST(req: Request): Promise<Response> {
  // 1. 認証チェック
  // 2. 使用回数チェック（無料ユーザー）
  // 3. MediaPipe処理（クライアントサイド推奨）
  // 4. 結果をSupabaseに保存
  // 5. レスポンス返却
}
```

### 4.3 メイク提案API

```typescript
// app/api/analysis/makeup/route.ts
interface MakeupSuggestionRequest {
  faceData: object;
  trendRegion?: string;
  occasion?: string; // 'daily', 'party', 'business'
}

interface MakeupSuggestionResponse {
  success: boolean;
  data?: {
    baseRecommendation: {
      foundation: string;
      concealer: string;
      powder: string;
    };
    eyeMakeup: {
      eyeshadow: string[];
      eyeliner: string;
      mascara: string;
    };
    lipMakeup: {
      color: string;
      finish: string; // 'matte', 'glossy', 'satin'
    };
    cheeks: {
      blush: string;
      highlight: string;
    };
    instructions: string[];
  };
  error?: string;
}
```

### 4.4 画像生成API

```typescript
// app/api/generate/image/route.ts
interface ImageGenerateRequest {
  originalImage: string; // Base64
  makeupStyle: object;
  intensity: number; // 0-100
}

interface ImageGenerateResponse {
  success: boolean;
  data?: {
    generatedImage: string; // Base64
    processingTime: number;
  };
  error?: string;
}

// POST /api/generate/image
export async function POST(req: Request): Promise<Response> {
  // 1. 認証・使用回数チェック
  // 2. Google Imagen or OpenAI DALL-E API呼び出し
  // 3. 画像生成
  // 4. 一時的にSupabaseに保存（24時間後削除）
  // 5. Base64でレスポンス
}
```

### 4.5 トレンド取得API

```typescript
// app/api/trends/route.ts
interface TrendRequest {
  region: 'japan' | 'korea' | 'western' | 'all';
}

interface TrendResponse {
  success: boolean;
  data?: {
    trends: Array<{
      id: string;
      title: string;
      description: string;
      images: string[];
      techniques: string[];
      products: string[];
    }>;
    lastUpdated: string;
  };
  error?: string;
}
```

## 5. 主要コンポーネント設計

### 5.1 写真アップロードコンポーネント

```typescript
// components/features/camera/PhotoUpload.tsx
import { useState, useCallback } from 'react';
import { Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoUploadProps {
  onImageCapture: (image: string) => void;
  maxSize?: number; // MB
}

export function PhotoUpload({ onImageCapture, maxSize = 5 }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // バリデーション
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ファイルサイズは${maxSize}MB以下にしてください`);
      return;
    }

    // 画像読み込み・リサイズ
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas でリサイズ（1024x1024以下）
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // ... リサイズ処理
        const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(resizedImage);
        onImageCapture(resizedImage);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [maxSize, onImageCapture]);

  return (
    <div className="space-y-4">
      {/* アップロードエリア */}
      {/* プレビュー表示 */}
      {/* エラー表示 */}
    </div>
  );
}
```

### 5.2 顔分析コンポーネント（MediaPipe使用）

```typescript
// components/features/analysis/FaceAnalyzer.tsx
import { useEffect, useRef } from 'react';
import * as faceMesh from '@mediapipe/face_mesh';

interface FaceAnalyzerProps {
  image: string;
  onAnalysisComplete: (data: FaceData) => void;
}

export function FaceAnalyzer({ image, onAnalysisComplete }: FaceAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const analyzeFace = async () => {
      // MediaPipe初期化
      const face = new faceMesh.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      face.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      face.onResults((results) => {
        if (results.multiFaceLandmarks?.[0]) {
          // ランドマークから顔の特徴を分析
          const landmarks = results.multiFaceLandmarks[0];
          const analysis = analyzeLandmarks(landmarks);
          onAnalysisComplete(analysis);
        }
      });

      // 画像を送信
      const img = new Image();
      img.src = image;
      await face.send({ image: img });
    };

    analyzeFace();
  }, [image, onAnalysisComplete]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-auto" />
      {/* 分析中のローディング表示 */}
    </div>
  );
}
```

### 5.3 AI画像生成コンポーネント

```typescript
// components/features/generation/ImageGenerator.tsx
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGeneratorProps {
  originalImage: string;
  makeupStyle: MakeupStyle;
  onGenerated: (image: string) => void;
}

export function ImageGenerator({ 
  originalImage, 
  makeupStyle, 
  onGenerated 
}: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage,
          makeupStyle,
          intensity: 80
        })
      });

      const data = await response.json();
      if (data.success) {
        onGenerated(data.data.generatedImage);
      }
    } catch (error) {
      console.error('生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={generateImage} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          'メイク後イメージを生成'
        )}
      </Button>
      {isGenerating && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

## 6. 外部API連携詳細

### 6.1 Google Imagen API連携

```typescript
// lib/ai/imagen.ts
interface ImagenConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
}

class ImagenService {
  private config: ImagenConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GOOGLE_API_KEY!,
      model: 'imagen-3.0-generate-001',
      maxRetries: 3
    };
  }

  async generateMakeupImage(
    baseImage: string,
    prompt: string
  ): Promise<string> {
    // プロンプト構築
    const enhancedPrompt = `
      Apply professional makeup to this face:
      ${prompt}
      Style: Natural, professional photography
      Maintain: Original facial features and structure
      Enhance: Skin texture, makeup application
      Output: High quality, realistic result
    `;

    // API呼び出し（エラーハンドリング含む）
    try {
      // Google Imagen API呼び出し
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/imagen-3.0:generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image: baseImage,
          samples: 1,
          aspectRatio: '1:1'
        })
      });

      const data = await response.json();
      return data.images[0];
    } catch (error) {
      console.error('Imagen API Error:', error);
      throw new Error('画像生成に失敗しました');
    }
  }
}

export const imagenService = new ImagenService();
```

### 6.2 MediaPipe設定

```typescript
// lib/ai/mediapipe.ts
export const MEDIAPIPE_CONFIG = {
  faceDetection: {
    modelPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.tflite',
    maxFaces: 1,
    minConfidence: 0.5
  },
  faceMesh: {
    modelPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.tflite',
    refineLandmarks: true,
    maxFaces: 1
  }
};

export function analyzeFaceShape(landmarks: any[]): string {
  // 顔の輪郭ポイントから形状を判定
  const jawLine = extractJawLine(landmarks);
  const foreheadWidth = calculateForeheadWidth(landmarks);
  const cheekWidth = calculateCheekWidth(landmarks);
  
  // 顔型判定ロジック
  if (isOval(jawLine, foreheadWidth, cheekWidth)) return 'oval';
  if (isRound(jawLine, foreheadWidth, cheekWidth)) return 'round';
  if (isSquare(jawLine, foreheadWidth, cheekWidth)) return 'square';
  if (isHeart(jawLine, foreheadWidth, cheekWidth)) return 'heart';
  
  return 'oval'; // デフォルト
}
```

## 7. セキュリティ実装

### 7.1 認証ミドルウェア

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 保護されたルートのチェック
  const protectedPaths = ['/dashboard', '/analysis', '/history', '/settings'];
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/analysis/:path*', '/history/:path*', '/settings/:path*']
};
```

### 7.2 レート制限

```typescript
// lib/utils/rateLimit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;
        
        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          tokenCache.set(token, tokenCount);
          resolve();
        }
      }),
  };
}
```

## 8. パフォーマンス最適化

### 8.1 画像最適化

```typescript
// lib/utils/image.ts
export async function optimizeImage(
  base64Image: string,
  maxWidth: number = 1024,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // アスペクト比を保持してリサイズ
      let { width, height } = img;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // WebP形式で出力（対応ブラウザの場合）
      const outputFormat = 'image/webp';
      resolve(canvas.toDataURL(outputFormat, quality));
    };
    img.src = base64Image;
  });
}
```

### 8.2 キャッシュ戦略

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, stale-while-revalidate=300',
        },
      ],
    },
  ],
};
```

## 9. エラーハンドリング

### 9.1 グローバルエラーハンドラー

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログ送信
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-6">申し訳ございません。問題が発生しました。</p>
      <Button onClick={reset}>もう一度試す</Button>
    </div>
  );
}
```

### 9.2 APIエラーレスポンス

```typescript
// lib/utils/apiResponse.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { 
      success: false, 
      error: 'Internal Server Error' 
    },
    { status: 500 }
  );
}
```

## 10. デプロイメント設定

### 10.1 環境変数

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key

STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 10.2 Vercel設定

```json
// vercel.json
{
  "functions": {
    "app/api/generate/image/route.ts": {
      "maxDuration": 30
    },
    "app/api/analysis/face/route.ts": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```