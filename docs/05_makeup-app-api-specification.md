# メイク指導アプリ API仕様詳細設計書

## 1. API概要

### 1.1 基本情報
- **ベースURL**: `https://api.makeupai.app` (本番) / `http://localhost:3000` (開発)
- **APIバージョン**: v1
- **プロトコル**: HTTPS only (本番環境)
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8
- **日時フォーマット**: ISO 8601 (例: `2025-08-22T09:41:00Z`)

### 1.2 認証方式
- **方式**: Bearer Token (Supabase JWT)
- **ヘッダー**: `Authorization: Bearer <token>`
- **トークン有効期限**: 1時間（自動リフレッシュ対応）

### 1.3 共通レスポンス構造

```typescript
// 成功レスポンス
interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// エラーレスポンス
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    requestId: string;
  };
}
```

## 2. エンドポイント一覧

### 2.1 認証関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/auth/register` | 新規登録 | 不要 |
| POST | `/api/auth/login` | ログイン | 不要 |
| POST | `/api/auth/logout` | ログアウト | 必要 |
| POST | `/api/auth/refresh` | トークン更新 | 必要 |
| POST | `/api/auth/reset-password` | パスワードリセット | 不要 |
| GET | `/api/auth/me` | 現在のユーザー情報 | 必要 |

### 2.2 ユーザー関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/users/profile` | プロフィール取得 | 必要 |
| PUT | `/api/users/profile` | プロフィール更新 | 必要 |
| GET | `/api/users/preferences` | 設定取得 | 必要 |
| PUT | `/api/users/preferences` | 設定更新 | 必要 |
| GET | `/api/users/usage` | 使用状況取得 | 必要 |
| DELETE | `/api/users/account` | アカウント削除 | 必要 |

### 2.3 分析関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/analysis/face` | 顔分析実行 | 必要 |
| POST | `/api/analysis/makeup` | メイク提案生成 | 必要 |
| GET | `/api/analysis/history` | 分析履歴取得 | 必要 |
| GET | `/api/analysis/{id}` | 分析詳細取得 | 必要 |
| DELETE | `/api/analysis/{id}` | 分析削除 | 必要 |
| POST | `/api/analysis/{id}/feedback` | フィードバック送信 | 必要 |

### 2.4 画像生成関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/generate/image` | メイク後画像生成 | 必要 |
| GET | `/api/generate/{id}` | 生成画像取得 | 必要 |
| POST | `/api/generate/{id}/regenerate` | 画像再生成 | 必要 |
| POST | `/api/generate/{id}/favorite` | お気に入り登録 | 必要 |

### 2.5 トレンド関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/trends` | トレンド一覧取得 | 不要 |
| GET | `/api/trends/{region}` | 地域別トレンド取得 | 不要 |
| GET | `/api/trends/search` | トレンド検索 | 不要 |

### 2.6 支払い関連 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/payment/checkout` | 支払いセッション作成 | 必要 |
| POST | `/api/payment/webhook` | Stripe Webhook | 不要* |
| GET | `/api/payment/history` | 支払い履歴取得 | 必要 |
| POST | `/api/payment/cancel` | サブスクキャンセル | 必要 |

## 3. API詳細仕様

### 3.1 認証API

#### POST /api/auth/register
**新規ユーザー登録**

```typescript
// Request Body
interface RegisterRequest {
  email: string;          // メールアドレス
  password: string;       // パスワード（8文字以上）
  fullName?: string;      // フルネーム
  acceptTerms: boolean;   // 利用規約同意
}

// Response
interface RegisterResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string | null;
      createdAt: string;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expiresAt: string;
    };
  };
}

// Implementation (app/api/auth/register/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  fullName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: '利用規約に同意する必要があります'
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = registerSchema.parse(body);
    
    // Supabase認証
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // ユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName
        }
      }
    });
    
    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: authError.message
          }
        },
        { status: 400 }
      );
    }
    
    // プロフィール作成
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        email: validatedData.email,
        full_name: validatedData.fullName
      });
    
    if (profileError) {
      // ロールバック処理
      await supabase.auth.admin.deleteUser(authData.user!.id);
      throw profileError;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user!.id,
          email: authData.user!.email!,
          fullName: validatedData.fullName || null,
          createdAt: authData.user!.created_at
        },
        session: {
          accessToken: authData.session!.access_token,
          refreshToken: authData.session!.refresh_token,
          expiresIn: authData.session!.expires_in!,
          expiresAt: new Date(authData.session!.expires_at! * 1000).toISOString()
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'バリデーションエラー',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'サーバーエラーが発生しました'
        }
      },
      { status: 500 }
    );
  }
}
```

#### POST /api/auth/login
**ユーザーログイン**

```typescript
// Request Body
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Response
interface LoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string | null;
      subscriptionStatus: 'free' | 'premium';
      monthlyUsageCount: number;
      lastLoginAt: string;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expiresAt: string;
    };
  };
}
```

### 3.2 分析API

#### POST /api/analysis/face
**顔分析実行**

```typescript
// Request Body
interface FaceAnalysisRequest {
  image: string;                    // Base64エンコード画像
  trendRegion?: string;            // トレンド地域
  occasion?: string;               // 使用シーン
  analysisType?: 'quick' | 'standard' | 'detailed';
}

// Response
interface FaceAnalysisResponse {
  success: true;
  data: {
    analysisId: string;
    status: 'pending' | 'processing' | 'completed';
    faceAnalysis: {
      shape: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
      skinTone: {
        type: string;
        undertone: 'warm' | 'cool' | 'neutral';
        hexCode: string;
      };
      features: {
        eyes: {
          shape: string;
          distance: 'normal' | 'wide' | 'close';
          size: 'small' | 'medium' | 'large';
        };
        nose: {
          shape: string;
          width: 'narrow' | 'medium' | 'wide';
        };
        lips: {
          shape: string;
          fullness: 'thin' | 'medium' | 'full';
        };
        eyebrows: {
          shape: string;
          thickness: 'thin' | 'medium' | 'thick';
        };
      };
      landmarks: number[][];
      confidence: number;
    };
    processingTime: number;
    remainingUsage: number;  // 残り使用回数（無料プランのみ）
  };
}

// Implementation
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // ユーザー情報取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '無効なトークン' } },
        { status: 401 }
      );
    }
    
    // 使用回数チェック
    const { data: canUse, error: usageError } = await supabase
      .rpc('increment_usage_count', { p_user_id: user.id });
    
    if (!canUse) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: '月間の使用回数上限に達しました'
          }
        },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // 画像サイズチェック（5MB以下）
    const imageSize = Buffer.from(body.image.split(',')[1], 'base64').length;
    if (imageSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_TOO_LARGE',
            message: '画像サイズは5MB以下にしてください'
          }
        },
        { status: 400 }
      );
    }
    
    // 分析履歴レコード作成
    const { data: analysisRecord, error: insertError } = await supabase
      .from('analysis_history')
      .insert({
        user_id: user.id,
        original_image_data: body.image,
        selected_trend_region: body.trendRegion || 'japan',
        occasion: body.occasion,
        analysis_type: body.analysisType || 'standard',
        status: 'processing'
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // MediaPipe分析（クライアントサイド推奨だが、サーバーサイドの例）
    const startTime = Date.now();
    const faceAnalysis = await analyzeFaceWithMediaPipe(body.image);
    const processingTime = Date.now() - startTime;
    
    // 分析結果更新
    const { error: updateError } = await supabase
      .from('analysis_history')
      .update({
        face_analysis: faceAnalysis,
        status: 'completed',
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', analysisRecord.id);
    
    if (updateError) throw updateError;
    
    // 残り使用回数取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_usage_count, subscription_status')
      .eq('id', user.id)
      .single();
    
    const remainingUsage = profile?.subscription_status === 'premium' 
      ? -1 
      : Math.max(0, 3 - (profile?.monthly_usage_count || 0));
    
    return NextResponse.json({
      success: true,
      data: {
        analysisId: analysisRecord.id,
        status: 'completed',
        faceAnalysis,
        processingTime,
        remainingUsage
      }
    });
    
  } catch (error) {
    console.error('Face analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: '顔分析中にエラーが発生しました'
        }
      },
      { status: 500 }
    );
  }
}

// MediaPipe分析関数（簡略版）
async function analyzeFaceWithMediaPipe(base64Image: string): Promise<any> {
  // 実際の実装では、MediaPipeまたは他の顔認識APIを使用
  return {
    shape: 'oval',
    skinTone: {
      type: 'light',
      undertone: 'warm',
      hexCode: '#F5DEB3'
    },
    features: {
      eyes: {
        shape: 'almond',
        distance: 'normal',
        size: 'medium'
      },
      nose: {
        shape: 'straight',
        width: 'medium'
      },
      lips: {
        shape: 'heart',
        fullness: 'medium'
      },
      eyebrows: {
        shape: 'arched',
        thickness: 'medium'
      }
    },
    landmarks: [[0.5, 0.3], [0.5, 0.7]], // 簡略化
    confidence: 0.95
  };
}
```

#### POST /api/analysis/makeup
**メイク提案生成**

```typescript
// Request Body
interface MakeupSuggestionRequest {
  analysisId: string;
  preferences?: {
    style?: string[];      // ['natural', 'bold', 'korean']
    intensity?: 'light' | 'medium' | 'heavy';
    avoidColors?: string[];
  };
}

// Response
interface MakeupSuggestionResponse {
  success: true;
  data: {
    suggestionId: string;
    analysisId: string;
    suggestions: {
      base: {
        foundation: {
          type: string;
          shade: string;
          finish: string;
          application: string;
        };
        concealer: {
          areas: string[];
          shade: string;
          technique: string;
        };
        powder: {
          type: string;
          areas: string[];
        };
      };
      eyes: {
        eyeshadow: {
          colors: string[];
          technique: string;
          placement: object;
        };
        eyeliner: {
          type: string;
          color: string;
          style: string;
        };
        mascara: {
          type: string;
          application: string;
        };
      };
      lips: {
        color: string;
        finish: string;
        technique: string;
        liner: boolean;
      };
      cheeks: {
        blush: {
          color: string;
          placement: string;
          intensity: string;
        };
        highlighter: {
          areas: string[];
          type: string;
        };
        contour?: {
          areas: string[];
          shade: string;
        };
      };
    };
    instructions: string[];
    tips: string[];
    confidence: number;
  };
}
```

### 3.3 画像生成API

#### POST /api/generate/image
**AI画像生成**

```typescript
// Request Body
interface GenerateImageRequest {
  analysisId: string;
  suggestionId: string;
  style?: 'natural' | 'glamorous' | 'artistic';
  intensity?: number;  // 0-100
  model?: 'imagen' | 'dalle';
}

// Response
interface GenerateImageResponse {
  success: true;
  data: {
    generationId: string;
    imageUrl?: string;      // 一時URL
    imageData?: string;     // Base64（端末保存用）
    status: 'pending' | 'processing' | 'completed' | 'failed';
    model: string;
    generationTime: number;
    expiresAt: string;
  };
}

// Implementation
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // 認証チェック（省略）
    
    const body = await request.json();
    const { analysisId, suggestionId, style = 'natural', intensity = 80 } = body;
    
    // 分析データ取得
    const { data: analysis } = await supabase
      .from('analysis_history')
      .select('*, makeup_suggestions(*)')
      .eq('id', analysisId)
      .single();
    
    if (!analysis) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: 'NOT_FOUND', message: '分析データが見つかりません' } 
        },
        { status: 404 }
      );
    }
    
    // プロンプト生成
    const prompt = generateMakeupPrompt(analysis, style, intensity);
    
    // AI画像生成（Google Imagen or OpenAI DALL-E）
    const startTime = Date.now();
    let generatedImage: string;
    
    if (body.model === 'dalle') {
      generatedImage = await generateWithDALLE(analysis.original_image_data, prompt);
    } else {
      generatedImage = await generateWithImagen(analysis.original_image_data, prompt);
    }
    
    const generationTime = Date.now() - startTime;
    
    // 結果保存
    const { data: imageRecord, error: saveError } = await supabase
      .from('generated_images')
      .insert({
        analysis_id: analysisId,
        generated_image_data: generatedImage,
        generation_model: body.model || 'imagen',
        generation_params: { style, intensity, prompt },
        generation_time_ms: generationTime,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();
    
    if (saveError) throw saveError;
    
    return NextResponse.json({
      success: true,
      data: {
        generationId: imageRecord.id,
        imageData: generatedImage,
        status: 'completed',
        model: imageRecord.generation_model,
        generationTime,
        expiresAt: imageRecord.expires_at
      }
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: '画像生成中にエラーが発生しました'
        }
      },
      { status: 500 }
    );
  }
}

// プロンプト生成関数
function generateMakeupPrompt(analysis: any, style: string, intensity: number): string {
  const makeupDetails = analysis.makeup_suggestions[0];
  
  return `
    Apply professional makeup to this face with the following specifications:
    Style: ${style}
    Intensity: ${intensity}%
    
    Base Makeup:
    - Foundation: ${makeupDetails.base_makeup.foundation.shade}
    - Finish: ${makeupDetails.base_makeup.foundation.finish}
    
    Eye Makeup:
    - Colors: ${makeupDetails.eye_makeup.eyeshadow.colors.join(', ')}
    - Technique: ${makeupDetails.eye_makeup.eyeshadow.technique}
    
    Lip Color: ${makeupDetails.lip_makeup.color}
    Lip Finish: ${makeupDetails.lip_makeup.finish}
    
    Maintain original facial features and structure.
    Create a photorealistic result with professional photography lighting.
  `;
}

// Google Imagen API呼び出し
async function generateWithImagen(baseImage: string, prompt: string): Promise<string> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/imagen-3.0:generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      image: baseImage,
      samples: 1,
      aspectRatio: '1:1'
    })
  });
  
  const data = await response.json();
  return data.images[0];
}

// OpenAI DALL-E API呼び出し
async function generateWithDALLE(baseImage: string, prompt: string): Promise<string> {
  // OpenAI API実装
  return 'generated_image_base64';
}
```

### 3.4 トレンドAPI

#### GET /api/trends
**トレンド一覧取得**

```typescript
// Query Parameters
interface TrendsListQuery {
  region?: string;        // 'japan' | 'korea' | 'western' | 'all'
  limit?: number;         // デフォルト: 10
  offset?: number;        // ページネーション用
}

// Response
interface TrendsListResponse {
  success: true;
  data: {
    trends: Array<{
      id: string;
      region: string;
      month: string;
      themes: string[];
      popularColors: {
        lip: string[];
        eye: string[];
        cheek: string[];
      };
      techniques: string[];
      popularityScore: number;
      items: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        imageUrl?: string;
      }>;
    }>;
    total: number;
    hasMore: boolean;
  };
}
```

### 3.5 支払いAPI

#### POST /api/payment/checkout
**Stripe決済セッション作成**

```typescript
// Request Body
interface CheckoutRequest {
  planType: 'premium_monthly' | 'premium_yearly';
  promotionCode?: string;
}

// Response
interface CheckoutResponse {
  success: true;
  data: {
    sessionId: string;
    checkoutUrl: string;
    expiresAt: string;
  };
}

// Implementation
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // 認証チェック（省略）
    
    const body = await request.json();
    const { planType, promotionCode } = body;
    
    // 価格設定
    const prices = {
      premium_monthly: process.env.STRIPE_PRICE_MONTHLY!,
      premium_yearly: process.env.STRIPE_PRICE_YEARLY!
    };
    
    // Stripeセッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[planType],
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planType
      },
      ...(promotionCode && {
        discounts: [{ promotion_code: promotionCode }]
      })
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url!,
        expiresAt: new Date(session.expires_at * 1000).toISOString()
      }
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: '決済セッションの作成に失敗しました'
        }
      },
      { status: 500 }
    );
  }
}
```

#### POST /api/payment/webhook
**Stripe Webhook処理**

```typescript
export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
  
  // イベント処理
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;
  
  // プロフィール更新
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'premium',
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', userId);
  
  // 支払い履歴記録
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: session.amount_total!,
      currency: session.currency!,
      status: 'succeeded',
      plan_type: session.metadata?.planType
    });
}
```

## 4. エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|--------------|------|
| `VALIDATION_ERROR` | 400 | リクエストバリデーションエラー |
| `INVALID_REQUEST` | 400 | 不正なリクエスト |
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `CONFLICT` | 409 | リソースの競合 |
| `USAGE_LIMIT_EXCEEDED` | 429 | 使用制限超過 |
| `RATE_LIMIT_EXCEEDED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |
| `SERVICE_UNAVAILABLE` | 503 | サービス利用不可 |

## 5. レート制限

```typescript
// lib/rateLimit.ts
import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  interval: number;     // ミリ秒
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (request: NextRequest, limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1]);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;

      if (isRateLimited) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'リクエスト数が制限を超えました',
              retryAfter: options.interval / 1000
            }
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': Math.max(0, limit - currentUsage).toString(),
              'X-RateLimit-Reset': new Date(Date.now() + options.interval).toISOString()
            }
          }
        );
      }

      tokenCache.set(token, tokenCount);
      return null;
    }
  };
}

// 使用例
const limiter = rateLimit({
  interval: 60 * 1000, // 1分
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  // IPアドレスまたはユーザーIDでレート制限
  const identifier = request.ip || 'anonymous';
  const rateLimitResponse = limiter.check(request, 10, identifier);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // 通常の処理
}
```

## 6. バリデーション

```typescript
// lib/validation.ts
import { z } from 'zod';

// 共通バリデーションスキーマ
export const schemas = {
  email: z.string().email('有効なメールアドレスを入力してください'),
  
  password: z.string()
    .min(8, 'パスワードは8文字以上必要です')
    .regex(/[A-Z]/, '大文字を1文字以上含めてください')
    .regex(/[a-z]/, '小文字を1文字以上含めてください')
    .regex(/[0-9]/, '数字を1文字以上含めてください'),
  
  base64Image: z.string()
    .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, '有効な画像形式ではありません')
    .transform(val => {
      const base64 = val.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        throw new Error('画像サイズは5MB以下にしてください');
      }
      return val;
    }),
  
  uuid: z.string().uuid('有効なIDではありません'),
  
  pagination: z.object({
    limit: z.number().min(1).max(100).default(10),
    offset: z.number().min(0).default(0)
  })
};

// バリデーションミドルウェア
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'バリデーションエラー',
            details: error.errors
          }
        };
      }
      throw error;
    }
  };
}
```

## 7. 認証ミドルウェア

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 保護されたAPIパス
  const protectedPaths = [
    '/api/users',
    '/api/analysis',
    '/api/generate',
    '/api/payment'
  ];

  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です'
          }
        },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '無効なトークンです'
          }
        },
        { status: 401 }
      );
    }

    // リクエストヘッダーにユーザーID追加
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return res;
}

export const config = {
  matcher: '/api/:path*'
};
```

## 8. OpenAPI仕様

```yaml
openapi: 3.0.0
info:
  title: MakeupAI API
  version: 1.0.0
  description: AI-powered makeup suggestion and image generation API

servers:
  - url: https://api.makeupai.app
    description: Production server
  - url: http://localhost:3000
    description: Development server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object

    FaceAnalysis:
      type: object
      properties:
        shape:
          type: string
          enum: [oval, round, square, heart, oblong]
        skinTone:
          type: object
          properties:
            type:
              type: string
            undertone:
              type: string
              enum: [warm, cool, neutral]
            hexCode:
              type: string
        features:
          type: object
        confidence:
          type: number
          minimum: 0
          maximum: 1

paths:
  /api/auth/register:
    post:
      summary: Register new user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - acceptTerms
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                fullName:
                  type: string
                acceptTerms:
                  type: boolean
      responses:
        200:
          description: Registration successful
        400:
          description: Validation error

  /api/analysis/face:
    post:
      summary: Analyze face from image
      tags: [Analysis]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - image
              properties:
                image:
                  type: string
                  format: base64
                trendRegion:
                  type: string
                occasion:
                  type: string
      responses:
        200:
          description: Analysis completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      analysisId:
                        type: string
                      faceAnalysis:
                        $ref: '#/components/schemas/FaceAnalysis'
        401:
          description: Unauthorized
        429:
          description: Usage limit exceeded
```

## 9. テスト用cURLコマンド

```bash
# 1. ユーザー登録
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "fullName": "Test User",
    "acceptTerms": true
  }'

# 2. ログイン
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# 3. 顔分析（トークンを置き換えてください）
curl -X POST http://localhost:3000/api/analysis/face \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "trendRegion": "japan",
    "occasion": "daily"
  }'

# 4. トレンド取得
curl -X GET "http://localhost:3000/api/trends?region=japan&limit=5" \
  -H "Content-Type: application/json"
```

## 10. SDKサンプル

```typescript
// lib/api/client.ts
class MakeupAIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  // 認証
  async register(email: string, password: string, fullName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        fullName,
        acceptTerms: true
      })
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      this.token = response.data.session.accessToken;
    }
    
    return response;
  }

  // 分析
  async analyzeFace(image: string, options?: any) {
    return this.request('/api/analysis/face', {
      method: 'POST',
      body: JSON.stringify({ image, ...options })
    });
  }

  async generateMakeupSuggestion(analysisId: string, preferences?: any) {
    return this.request('/api/analysis/makeup', {
      method: 'POST',
      body: JSON.stringify({ analysisId, preferences })
    });
  }

  // 画像生成
  async generateImage(analysisId: string, suggestionId: string, options?: any) {
    return this.request('/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ analysisId, suggestionId, ...options })
    });
  }

  // トレンド
  async getTrends(region?: string, limit: number = 10) {
    const params = new URLSearchParams({
      ...(region && { region }),
      limit: limit.toString()
    });
    
    return this.request(`/api/trends?${params}`);
  }
}

// 使用例
const client = new MakeupAIClient();

async function main() {
  // ログイン
  await client.login('user@example.com', 'password');
  
  // 顔分析
  const analysis = await client.analyzeFace(imageBase64, {
    trendRegion: 'japan',
    occasion: 'daily'
  });
  
  // メイク提案
  const suggestion = await client.generateMakeupSuggestion(
    analysis.data.analysisId
  );
  
  // 画像生成
  const image = await client.generateImage(
    analysis.data.analysisId,
    suggestion.data.suggestionId
  );
}
```