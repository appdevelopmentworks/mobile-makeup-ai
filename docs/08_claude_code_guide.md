# Claude Code 実装開始ガイド

## 🚀 Claude Codeでの実装手順

このドキュメントは、Claude Codeを使用してMakeupAIアプリケーションの実装を開始するためのガイドです。

## 📋 事前準備

### 1. 必要なアカウント作成
- [ ] Supabaseアカウント
- [ ] Stripeアカウント  
- [ ] Google Cloud Platformアカウント
- [ ] Vercelアカウント（デプロイ用）

### 2. APIキーの取得
各サービスのダッシュボードから必要なAPIキーを取得してください：
- Supabase: Project URL, Anon Key, Service Role Key
- Stripe: Publishable Key, Secret Key
- Google: Cloud API Key（Imagen API用）

## 🎯 実装の優先順位

### Phase 1: 基本セットアップ（最初に実行）
```bash
# 1. プロジェクト初期化
npx create-next-app@latest makeup-ai --typescript --tailwind --app

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.local.example .env.local
# .env.localファイルを編集して実際のAPIキーを設定
```

### Phase 2: Supabase設定
```bash
# Supabase CLIインストール
npm install -g supabase

# Supabaseプロジェクト初期化
supabase init

# データベースマイグレーション実行
supabase db push
```

### Phase 3: 基本機能実装順序

1. **認証システム** (Week 1)
   - `/app/(auth)/login/page.tsx`
   - `/app/(auth)/register/page.tsx`
   - `/lib/supabase/client.ts`
   - `/middleware.ts`

2. **ダッシュボード** (Week 1-2)
   - `/app/(dashboard)/layout.tsx`
   - `/app/(dashboard)/page.tsx`
   - `/components/layout/Header.tsx`
   - `/components/layout/Navigation.tsx`

3. **顔分析機能** (Week 2-3)
   - `/components/features/camera/PhotoUpload.tsx`
   - `/components/features/analysis/FaceAnalyzer.tsx`
   - `/app/api/analysis/face/route.ts`
   - `/lib/ai/mediapipe.ts`

4. **メイク提案** (Week 3)
   - `/components/features/analysis/MakeupSuggestion.tsx`
   - `/app/api/analysis/makeup/route.ts`
   - `/lib/utils/makeupLogic.ts`

5. **AI画像生成** (Week 4)
   - `/components/features/generation/ImageGenerator.tsx`
   - `/app/api/generate/image/route.ts`
   - `/lib/ai/imagen.ts`

## 💻 Claude Codeプロンプト例

### 基本的な実装リクエスト
```
「Next.js App Routerを使用して、Supabase認証を実装したログインページを作成してください。
要件：
- メールとパスワードでのログイン
- エラーハンドリング
- ローディング状態の表示
- /app/(auth)/login/page.tsxに配置」
```

### コンポーネント作成
```
「shadcn/uiを使用して、画像アップロードコンポーネントを作成してください。
要件：
- ドラッグ&ドロップ対応
- 画像プレビュー機能
- 5MB以下のファイルサイズ制限
- Base64エンコード
- /components/features/camera/PhotoUpload.tsxに配置」
```

### API Route作成
```
「顔分析APIエンドポイントを作成してください。
要件：
- POST /api/analysis/face
- 認証チェック
- 使用回数制限（無料ユーザーは月3回）
- MediaPipe統合
- エラーハンドリング」
```

## 🧪 テスト方法

### 開発サーバー起動
```bash
npm run dev
```

### 個別機能のテスト
1. **認証フロー**: http://localhost:3000/login
2. **ダッシュボード**: http://localhost:3000/dashboard
3. **分析機能**: http://localhost:3000/analysis
4. **API確認**: http://localhost:3000/api/[endpoint]

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### Supabase接続エラー
```
Error: Invalid Supabase URL
```
→ `.env.local`のSupabase URLとキーを確認

#### MediaPipe読み込みエラー
```
Error: Failed to load MediaPipe
```
→ CDNからの読み込みを確認、CORSの設定を確認

#### 画像生成API制限
```
Error: API rate limit exceeded
```
→ 無料枠の使用状況を確認、キャッシュ実装を検討

## 📝 実装チェックポイント

### 各機能実装後の確認事項
- [ ] TypeScriptの型エラーがないか
- [ ] ESLintエラーがないか
- [ ] レスポンシブデザインが適用されているか
- [ ] エラーハンドリングが実装されているか
- [ ] ローディング状態が表示されるか
- [ ] アクセシビリティ要件を満たしているか

## 🎨 UIコンポーネントの追加方法

### shadcn/uiコンポーネントの追加
```bash
# 例：Buttonコンポーネントの追加
npx shadcn-ui@latest add button

# 例：Cardコンポーネントの追加
npx shadcn-ui@latest add card

# 例：Dialogコンポーネントの追加
npx shadcn-ui@latest add dialog
```

## 📚 参考リソース

### 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [MediaPipe Documentation](https://mediapipe.dev)

### プロジェクト固有のドキュメント
- [要求定義書](./docs/01_requirements.md)
- [技術設計書](./docs/02_technical_design.md)
- [データベース設計](./docs/04_database_schema.md)
- [API仕様書](./docs/05_api_specification.md)
- [実装チェックリスト](./docs/07_implementation_checklist.md)

## 🤝 Claude Codeとの効果的な協働

### Do's ✅
- 具体的な要件を明確に伝える
- ファイルパスを明示する
- エラーメッセージを共有する
- 段階的に実装を進める

### Don'ts ❌
- 一度に大量の機能を要求しない
- 曖昧な指示を出さない
- エラーを無視して進めない
- テストなしで次の機能に進まない

## 🚦 実装開始の準備完了チェック

- [ ] プロジェクトフォルダが作成されている
- [ ] 必要なドキュメントが`/docs`に保存されている
- [ ] package.jsonが設定されている
- [ ] tsconfig.jsonが設定されている
- [ ] .env.localが設定されている（APIキー入力済み）
- [ ] Supabaseプロジェクトが作成されている
- [ ] このガイドを理解している

**準備が完了したら、Claude Codeで実装を開始してください！**

---

最終更新: 2024/12/22