# Google OAuth ログイン設定ガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト名: `makeup-ai`
4. データベースパスワードを設定
5. リージョンを選択（Tokyo推奨）
6. プロジェクト作成を待つ

## 2. Supabase設定の取得

プロジェクトダッシュボードの「Settings」→「API」から以下を取得：
- Project URL
- anon public key
- service_role key (secret)

## 3. Google OAuth設定

### Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIs & Services」→「OAuth consent screen」
   - User Type: External
   - App name: MakeupAI
   - User support email: あなたのメール
   - Developer contact: あなたのメール

4. 「APIs & Services」→「Credentials」
   - 「Create Credentials」→「OAuth 2.0 Client IDs」
   - Application type: Web application
   - Name: MakeupAI Web Client
   - Authorized JavaScript origins: 
     - `http://localhost:3000`
     - `https://your-domain.com` (本番用)
   - Authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

5. Client IDとClient Secretを保存

### Supabaseでの設定

1. Supabaseダッシュボード → 「Authentication」→「Providers」
2. 「Google」を選択
3. 「Enable Google provider」をオン
4. Google Cloud ConsoleからのClient IDとClient Secretを入力
5. 「Save」をクリック

## 4. 環境変数の更新

`.env.local` ファイルを以下のように更新：

```env
# 実際のSupabase設定に置き換え
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# サイトURL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. テスト

1. アプリケーションを再起動: `npm run dev`
2. ログインページでGoogleボタンをクリック
3. Google認証フローを完了
4. ダッシュボードにリダイレクトされることを確認

## 注意事項

- 開発中は `http://localhost:3000` を使用
- 本番環境では実際のドメインを設定
- Google OAuth設定は即座に反映されない場合があります（数分待つ）
- Supabaseの無料プランでは月間アクティブユーザー50,000人まで利用可能