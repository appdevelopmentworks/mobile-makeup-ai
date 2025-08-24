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
- [ ] 基本レイアウト実装
- [ ] 認証システム実装
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