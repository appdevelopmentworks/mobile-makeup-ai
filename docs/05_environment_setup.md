# 環境変数設定ガイド

## 概要

このドキュメントでは、MakeupAIアプリケーションの動作に必要な環境変数の設定方法を説明します。

## 環境変数ファイル

開発環境では `.env.local` ファイルに環境変数を設定します。

## 必要な環境変数

### 1. Supabase設定

```env
# Supabase URL - Supabaseプロジェクトダッシュボードから取得
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anon Key - 公開可能な匿名キー
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key - サーバーサイドでのみ使用（秘密）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. AI API設定

```env
# Google Cloud Platform API Key（Imagen API用）
GOOGLE_API_KEY=AIzaSy...

# OpenAI API Key（DALL-E用バックアップ）
OPENAI_API_KEY=sk-...

# Google Vision API Key（顔分析用オプション）
GOOGLE_VISION_API_KEY=AIzaSy...
```

### 3. Stripe設定

```env
# Stripe Secret Key（サーバーサイド）
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key（クライアントサイド）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret（Webhook検証用）
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe価格ID
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

### 4. アプリケーション設定

```env
# アプリケーションURL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# APIベースURL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 環境
NODE_ENV=development

# ポート（オプション）
PORT=3000
```

### 5. セキュリティ設定

```env
# JWTシークレット（セッション管理用）
JWT_SECRET=your-super-secret-jwt-key-change-this

# 暗号化キー（データ暗号化用）
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 6. 外部サービス（オプション）

```env
# Sentry DSN（エラートラッキング）
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Cloudinary（画像最適化用）
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 環境変数の取得方法

### Supabase

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. Settings → API から各種キーを取得

### Google Cloud Platform

1. [Google Cloud Console](https://console.cloud.google.com)にログイン
2. APIとサービス → 認証情報
3. APIキーを作成または既存のキーを使用

### Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com)にログイン
2. 開発者 → APIキー から各種キーを取得
3. Webhookエンドポイントを設定してWebhookシークレットを取得

### OpenAI

1. [OpenAI Platform](https://platform.openai.com)にログイン
2. API Keys セクションから新しいキーを生成

## 環境別設定

### 開発環境

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ステージング環境

```env
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.makeupai.app
```

### 本番環境

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://makeupai.app
```

## セキュリティ注意事項

1. **`.env.local` ファイルは絶対にGitにコミットしない**
2. サービスロールキーやシークレットキーは**サーバーサイドでのみ使用**
3. `NEXT_PUBLIC_` プレフィックスのついた変数のみクライアントサイドで参照可能
4. 本番環境では環境変数をVercelまたはホスティングサービスの環境変数設定で管理

## 環境変数のバリデーション

起動時に環境変数の存在をチェックする設定：

```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'GOOGLE_API_KEY'
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

## トラブルシューティング

### 環境変数が読み込まれない

1. `.env.local` ファイルがプロジェクトルートに存在することを確認
2. 開発サーバーを再起動
3. 変数名のタイポをチェック

### APIキーが無効

1. APIキーの有効期限を確認
2. APIの利用制限・クォータを確認
3. 正しいプロジェクト/環境のキーを使用しているか確認

### Webhookが動作しない

1. Webhook URLが正しく設定されているか確認
2. Webhook シークレットが一致しているか確認
3. ngrokなどのトンネリングツールを使用してローカルでテスト