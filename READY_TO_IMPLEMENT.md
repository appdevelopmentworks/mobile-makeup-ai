# Claude Code 実装準備完了チェックリスト

## ✅ プロジェクト構造

### 作成済みファイル・ディレクトリ
- [x] `/docs` - ドキュメント一式
  - [x] 01_requirements.md - 要求定義書
  - [x] 02_technical_design.md - 技術設計書
  - [x] 03_wireframes.html - ワイヤーフレーム
  - [x] 04_database_schema.md - DB設計
  - [x] 05_api_specification.md - API仕様
  - [x] 05_environment_setup.md - 環境設定ガイド
  - [x] 06_coding_guidelines.md - コーディング規約
  - [x] 07_implementation_checklist.md - 実装チェックリスト
  - [x] 08_claude_code_guide.md - Claude Code実装ガイド
  - [x] 09_git_workflow.md - Gitワークフロー

### 設定ファイル
- [x] package.json - 依存関係とスクリプト
- [x] tsconfig.json - TypeScript設定
- [x] tailwind.config.ts - Tailwind CSS設定
- [x] next.config.js - Next.js設定
- [x] .env.local.example - 環境変数テンプレート
- [x] .gitignore - Git除外設定
- [x] .eslintrc.json - ESLint設定
- [x] .prettierrc - Prettier設定
- [x] jest.config.ts - Jest設定
- [x] jest.setup.js - Jestセットアップ
- [x] README.md - プロジェクト概要

### データベース
- [x] `/supabase` - Supabase設定
  - [x] `/migrations` - マイグレーションファイル
    - [x] 001_initial_schema.sql - 初期スキーマ
  - [x] config.toml - Supabase設定

### TypeScript型定義
- [x] `/types` - 型定義ファイル
  - [x] database.ts - データベース型
  - [x] api.ts - API型
  - [x] index.ts - 共通型とエクスポート

### ユーティリティ
- [x] `/lib` - ライブラリ
  - [x] `/utils` - ユーティリティ関数
    - [x] index.ts - 共通ユーティリティ

## 🚀 Claude Codeで実装を開始する準備

### 1. 環境セットアップ（最初に実行）
```bash
# プロジェクトディレクトリに移動
cd ~/Desktop/makeup-ai

# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
```

### 2. .env.localファイルの編集
以下の環境変数を実際の値で設定してください：
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] GOOGLE_API_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

### 3. Supabaseプロジェクトの設定
```bash
# Supabase CLIのインストール（未インストールの場合）
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトとリンク
supabase link --project-ref [your-project-ref]

# データベースマイグレーション実行
supabase db push
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 📝 実装順序（推奨）

### Week 1: 基盤構築
1. **プロジェクト初期化とレイアウト**
   - [ ] app/layout.tsx - ルートレイアウト
   - [ ] app/page.tsx - ホームページ
   - [ ] app/globals.css - グローバルスタイル

2. **認証システム**
   - [ ] lib/supabase/client.ts - Supabaseクライアント
   - [ ] app/(auth)/login/page.tsx - ログインページ
   - [ ] app/(auth)/register/page.tsx - 登録ページ
   - [ ] middleware.ts - 認証ミドルウェア

### Week 2: コア機能
3. **ダッシュボード**
   - [ ] app/(dashboard)/layout.tsx - ダッシュボードレイアウト
   - [ ] app/(dashboard)/page.tsx - ダッシュボードホーム
   - [ ] components/layout/Header.tsx - ヘッダー
   - [ ] components/layout/Navigation.tsx - ナビゲーション

4. **画像アップロード**
   - [ ] components/features/camera/PhotoUpload.tsx
   - [ ] lib/utils/image.ts - 画像処理ユーティリティ

### Week 3: 分析機能
5. **顔分析**
   - [ ] lib/ai/mediapipe.ts - MediaPipe設定
   - [ ] components/features/analysis/FaceAnalyzer.tsx
   - [ ] app/api/analysis/face/route.ts

6. **メイク提案**
   - [ ] components/features/analysis/MakeupSuggestion.tsx
   - [ ] app/api/analysis/makeup/route.ts

### Week 4: AI連携
7. **画像生成**
   - [ ] lib/ai/imagen.ts - Google Imagen設定
   - [ ] components/features/generation/ImageGenerator.tsx
   - [ ] app/api/generate/image/route.ts

## 🎯 Claude Codeプロンプト例

### 基本的な実装開始
```
"makeup-aiプロジェクトの実装を開始します。
まず、app/layout.tsx ファイルを作成して、基本的なルートレイアウトを実装してください。
要件：
- Next.js 14 App Router使用
- TypeScript対応
- TailwindCSS使用
- メタデータ設定
- フォント設定（Inter）"
```

### コンポーネント作成例
```
"PhotoUploadコンポーネントを作成してください。
パス: components/features/camera/PhotoUpload.tsx
要件：
- react-dropzoneを使用
- 画像のドラッグ&ドロップ対応
- ファイルサイズ制限（5MB）
- プレビュー表示
- Base64変換
- エラーハンドリング"
```

## ⚠️ 注意事項

1. **APIキーの管理**
   - 絶対にAPIキーをコミットしない
   - .env.localファイルはGitに含めない

2. **開発順序**
   - 基盤から順番に実装
   - 各機能をテストしてから次へ進む

3. **エラー対処**
   - エラーメッセージを詳細に記録
   - Claude Codeと共有して解決

## 🎉 準備完了！

すべての準備が整いました。Claude Codeで実装を開始してください！

質問や問題があれば、このチェックリストとドキュメントを参照してください。

---
最終更新: 2024/12/22