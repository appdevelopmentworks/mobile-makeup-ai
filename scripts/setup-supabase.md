# Supabase セットアップガイド

## クイックスタート

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com) にアクセス
2. 「New project」をクリック
3. 以下の情報を入力：
   - **Name**: `makeup-ai`
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)`
4. 「Create new project」をクリック
5. プロジェクトの準備完了まで2-3分待つ

### 2. API キーの取得

プロジェクトが作成されたら：

1. サイドバーから「Settings」→「API」をクリック
2. 以下の情報をコピー：
   - **Project URL** (例: `https://abcdefgh.supabase.co`)
   - **anon public** key (長いJWTトークン)
   - **service_role** key (長いJWTトークン、secretと書かれている)

### 3. 環境変数の更新

`.env.local` ファイルを開いて、以下の行を実際の値に置き換え：

```env
# 実際の値に置き換えてください
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

### 4. Google OAuth の設定

#### Google Cloud Console:

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成：
   - プロジェクト名: `makeup-ai`
3. 「APIs & Services」→「OAuth consent screen」：
   - User Type: External
   - App name: `MakeupAI`
   - User support email: あなたのメール
   - Developer contact information: あなたのメール
4. 「APIs & Services」→「Credentials」：
   - 「Create Credentials」→「OAuth 2.0 Client IDs」
   - Application type: Web application
   - Name: `MakeupAI Web`
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

#### Supabase側の設定:

1. Supabaseダッシュボード→「Authentication」→「Providers」
2. 「Google」をクリック
3. 「Enabled」をオンにする
4. Google Cloud ConsoleからのClient IDとClient Secretを入力
5. 「Save」をクリック

### 5. テスト

1. アプリケーションを再起動: `npm run dev`
2. http://localhost:3000 にアクセス
3. 「Googleでログイン」ボタンをテスト

## トラブルシューティング

### 「Invalid redirect URL」エラー
- Google Cloud Consoleの redirect URIs に正確なSupabase URLが設定されているか確認
- Supabaseの設定でGoogleプロバイダーが有効になっているか確認

### 「Client ID not found」エラー
- Google Cloud ConsoleのClient IDが正しくSupabaseに入力されているか確認
- APIが有効になっているか確認（Google+ API は不要）

### 環境変数が読み込まれない
- `.env.local` ファイルがプロジェクトルートにあるか確認
- アプリケーションを完全に再起動（`Ctrl+C` → `npm run dev`）