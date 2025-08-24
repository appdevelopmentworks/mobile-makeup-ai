# MakeupAI - AI駆動メイク指導アプリケーション

## 📱 概要

MakeupAIは、AI技術を活用して個人に最適化されたメイク提案を行うWebアプリケーションです。顔写真の分析から、パーソナライズされたメイクアドバイスとAI生成によるメイク後イメージを提供します。

### 主要機能
- 🔍 顔写真のAI分析（顔型、肌色、パーツ分析）
- 💄 パーソナライズされたメイク提案
- 🎨 AI生成によるメイク後イメージ
- 📊 地域別トレンドメイク情報
- 💳 フリーミアムモデル（無料3回/月、プレミアム無制限）

## 🚀 技術スタック

### フロントエンド
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API / Zustand

### バックエンド
- **BaaS**: Supabase (PostgreSQL, Auth, Storage)
- **API Routes**: Next.js Route Handlers
- **Payment**: Stripe

### AI/ML
- **Face Analysis**: MediaPipe
- **Image Generation**: Google Imagen API / OpenAI DALL-E
- **Trend Analysis**: Web Search API

## 📋 前提条件

- Node.js 18.x以上
- npm または yarn
- Supabaseアカウント
- Stripeアカウント
- Google Cloud Platform アカウント（Imagen API用）

## 🛠️ セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/makeup-ai.git
cd makeup-ai
```

### 2. 依存関係のインストール
```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定
`.env.local.example`を`.env.local`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.local.example .env.local
```

詳細は[環境変数設定ガイド](docs/05_environment_setup.md)を参照してください。

### 4. Supabaseのセットアップ
```bash
# Supabase CLIのインストール
npm install -g supabase

# Supabaseプロジェクトの初期化
supabase init

# マイグレーションの実行
supabase db push
```

### 5. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセスできます。

## 📁 プロジェクト構造

```
makeup-ai/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
├── lib/                    # ユーティリティ・設定
├── types/                  # TypeScript型定義
├── public/                 # 静的ファイル
├── docs/                   # ドキュメント
├── supabase/              # Supabaseマイグレーション
└── tests/                 # テストファイル
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リント
npm run lint

# フォーマット
npm run format

# テスト実行
npm run test

# 型チェック
npm run type-check
```

## 📝 開発ガイドライン

- [コーディング規約](docs/06_coding_guidelines.md)
- [Git ブランチ戦略](docs/07_git_workflow.md)
- [コンポーネント設計](docs/08_component_design.md)

## 🗺️ ロードマップ

### Phase 1: MVP (Week 1-4)
- [x] プロジェクトセットアップ
- [ ] 認証システム実装
- [ ] 顔分析機能
- [ ] メイク提案ロジック
- [ ] AI画像生成連携

### Phase 2: 機能拡張 (Month 2)
- [ ] 決済システム統合
- [ ] トレンド機能
- [ ] 履歴管理
- [ ] パフォーマンス最適化

### Phase 3: プロダクション (Month 3+)
- [ ] テスト完了
- [ ] セキュリティ監査
- [ ] デプロイ
- [ ] モニタリング設定

## 🧪 テスト

```bash
# ユニットテスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

## 📦 デプロイメント

### Vercelへのデプロイ
```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel
```

詳細は[デプロイメントガイド](docs/09_deployment.md)を参照してください。

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

[MIT](LICENSE)

## 📞 サポート

- 📧 Email: support@makeupai.app
- 📖 Documentation: [https://docs.makeupai.app](https://docs.makeupai.app)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-username/makeup-ai/issues)

## 🙏 謝辞

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting Platform
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [MediaPipe](https://mediapipe.dev) - Face Analysis