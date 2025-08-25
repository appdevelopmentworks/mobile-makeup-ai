# MakeupAI - Claude Code Project Context

## プロジェクト概要
AI駆動のメイク指導アプリケーション。顔写真分析によるパーソナライズされたメイク提案とAI画像生成を提供。

## 技術スタック
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI/ML**: MediaPipe (顔分析), Google Imagen/OpenAI DALL-E (画像生成)
- **Payment**: Stripe
- **Hosting**: Vercel

## プロジェクト構造
```
makeup-ai/
├── app/                    # Next.js App Router
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・設定
├── types/                 # TypeScript型定義
├── supabase/             # DBマイグレーション
└── docs/                  # ドキュメント
```

## 現在の実装状況
- [x] プロジェクト設定完了
- [x] ドキュメント作成完了
- [x] 型定義作成完了
- [x] 基本レイアウト実装
- [x] **認証システム実装完了**
  - [x] Supabase認証統合
  - [x] Google OAuth認証
  - [x] パスワードリセット機能
  - [x] リアルタイム認証状態管理
- [ ] 顔分析機能実装
- [ ] メイク提案機能実装
- [ ] AI画像生成実装

## 主要機能
1. **顔分析**: MediaPipeで顔型・肌色・パーツ分析
2. **メイク提案**: 分析結果に基づくパーソナライズ提案
3. **AI画像生成**: メイク後のビジュアライゼーション
4. **フリーミアム**: 無料3回/月、プレミアム無制限

## 重要な制約
- 無料ユーザーは月3回まで利用可能
- 画像サイズは5MB以下
- 初期は端末保存のみ（ストレージコスト削減）

## 実装優先順位
1. 認証システム
2. 基本UI/レイアウト
3. 画像アップロード
4. 顔分析
5. メイク提案
6. AI画像生成
7. 決済システム

## 参照ドキュメント
- 要求定義: `/docs/01_requirements.md`
- 技術設計: `/docs/02_technical_design.md`
- DB設計: `/docs/04_database_schema.md`
- API仕様: `/docs/05_api_specification.md`
- 実装チェックリスト: `/docs/07_implementation_checklist.md`

## 環境変数（要設定）
- Supabase: URL, Anon Key, Service Role Key
- Google: API Key (Imagen)
- Stripe: Publishable Key, Secret Key

## 開発コマンド
```bash
npm run dev        # 開発サーバー
npm run build      # ビルド
npm run test       # テスト
npm run lint       # リント
```

## 現在の課題・TODO
- [ ] Next.jsプロジェクトの初期化
- [ ] 基本的なレイアウト実装
- [ ] Supabase接続設定
- [ ] 認証フロー実装

## コーディング規約
- TypeScript厳密モード使用
- 関数コンポーネント使用
- カスタムフックでロジック分離
- エラーハンドリング必須
- テスト作成推奨

## Git ブランチ戦略
- main: 本番環境
- develop: 開発環境
- feature/*: 新機能
- fix/*: バグ修正

## デプロイ・運用

### Netlify デプロイ設定
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: 18.x以上推奨

### 環境変数設定（本番環境）
```bash
# Supabase (認証機能に必要)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (オプション - 設定時にGoogle認証が有効)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Google AI (将来実装予定)
GOOGLE_API_KEY=your_google_api_key

# Stripe (将来実装予定)  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### デプロイ注意点
1. **環境変数未設定でも動作**: Supabase環境変数が未設定でもビルドエラーにならない設計
2. **認証機能**: 環境変数未設定時はモックデータで動作、設定時に実際の認証が有効化
3. **静的生成**: 全ページが静的生成されるため、初回アクセスが高速
4. **画像最適化**: Next.js Imageコンポーネントの使用を推奨（現在は<img>タグ使用中）

### パフォーマンス最適化
- First Load JS: ~180KB（settings page最大）
- 静的ページ生成で高速表示
- Middleware適用でセキュリティ強化

## 認証システム

### 実装機能
- **メール/パスワード認証**: Supabase Auth使用
- **Google OAuth**: ワンクリックログイン
- **パスワードリセット**: メール送信による安全なリセット
- **リアルタイム認証状態**: セッション自動管理
- **リダイレクト機能**: ログイン後の自動遷移

### 認証フロー
```
1. ユーザーアクセス → 未認証の場合 /login にリダイレクト
2. ログイン成功 → 元のページまたは /dashboard に遷移
3. Google OAuth → /auth/callback → 自動ログイン
4. パスワードリセット → メール送信 → /auth/reset-password
```

### Supabase設定手順
1. Supabaseプロジェクト作成
2. Authentication → Settings → Site URL設定
3. Google OAuth設定（オプション）
4. 環境変数を.envに追加
5. デプロイ時はNetlifyの環境変数に設定

### トラブルシューティング
- **ビルドエラー「supabaseUrl is required」**: 修正済み（フォールバック値適用）
- **TypeScriptエラー**: 未使用変数・importは自動修正済み
- **ESLintエラー**: 必要に応じてルールの調整を検討
- **Google OAuth設定**: SupabaseでAuthorized domainsにデプロイURLを追加
- **認証状態が反映されない**: ブラウザのローカルストレージ確認