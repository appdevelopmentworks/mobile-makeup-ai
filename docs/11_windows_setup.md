# Windows環境でのセットアップガイド

## Windows ネイティブ環境での開発

### 前提条件
- Windows 10/11
- Node.js 18.x以上
- Git for Windows
- VSCode（推奨）

### セットアップ手順

#### 1. Node.jsのインストール
1. [Node.js公式サイト](https://nodejs.org/)から最新のLTS版をダウンロード
2. インストーラーを実行（デフォルト設定でOK）
3. PowerShellで確認：
```powershell
node --version
npm --version
```

#### 2. Git for Windowsのインストール
1. [Git for Windows](https://gitforwindows.org/)をダウンロード
2. インストール時の推奨設定：
   - "Use Git from Windows Command Prompt"を選択
   - "Checkout Windows-style, commit Unix-style line endings"を選択

#### 3. プロジェクトのセットアップ
```powershell
# PowerShellで実行
cd C:\Users\YourName\Desktop\makeup-ai

# 依存関係のインストール
npm install

# 環境変数ファイルのコピー
copy .env.local.example .env.local

# 開発サーバーの起動
npm run dev
```

### Windows特有の問題と解決策

#### 問題1: パスの区切り文字
**問題**: Windowsは`\`、Unix系は`/`を使用

**解決策**: 
```javascript
// path.joinを使用して自動的に適切な区切り文字を使用
import path from 'path'
const filePath = path.join('components', 'features', 'camera', 'PhotoUpload.tsx')
```

#### 問題2: 改行コード
**問題**: WindowsはCRLF、Unix系はLF

**解決策**: 
```bash
# .gitattributesファイルで統一
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

#### 問題3: ファイル監視の制限
**問題**: Windowsのファイル監視に制限がある

**解決策**: 
```powershell
# PowerShellを管理者として実行
echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf
```

#### 問題4: 長いパス名
**問題**: Windowsの260文字パス制限

**解決策**: 
```powershell
# Windows 10/11でロングパスを有効化（管理者権限）
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### 問題5: npm scriptsでのコマンド
**問題**: Unix系コマンドが動作しない

**解決策**: cross-envパッケージを使用
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development next dev",
    "build": "cross-env NODE_ENV=production next build"
  }
}
```

### 推奨VSCode拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### PowerShellスクリプトの例

```powershell
# setup.ps1 - 初期セットアップスクリプト
Write-Host "MakeupAI Setup Script for Windows" -ForegroundColor Green

# Node.jsバージョン確認
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow

# 依存関係インストール
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# 環境変数ファイル作成
if (!(Test-Path .env.local)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "Please edit .env.local with your API keys" -ForegroundColor Red
}

# Supabase CLI インストール確認
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (!$supabaseInstalled) {
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

Write-Host "Setup complete!" -ForegroundColor Green
```

## WSL2を使う場合

### WSL2のインストール
```powershell
# PowerShell（管理者権限）で実行
wsl --install
```

### WSL2でのプロジェクトセットアップ
```bash
# WSL2のUbuntu内で実行
cd /mnt/c/Users/YourName/Desktop/makeup-ai

# より良いパフォーマンスのため、WSLファイルシステムにコピー
cp -r /mnt/c/Users/YourName/Desktop/makeup-ai ~/makeup-ai
cd ~/makeup-ai

# Node.jsインストール（nvm使用）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# プロジェクトセットアップ
npm install
npm run dev
```

### WSL2の注意点
1. **ファイルの場所**: WSLファイルシステム内（`~/`）に置く方が高速
2. **ポート**: Windows側からlocalhost:3000でアクセス可能
3. **エディタ**: Windows側のVSCodeからWSL拡張機能で編集可能

## どちらを選ぶべきか？

### Windows ネイティブを選ぶべき場合 ✅
- シンプルに開発を始めたい
- 追加の環境構築を避けたい
- Windows専用ツールと統合したい
- **MakeupAIプロジェクトはこれで十分**

### WSL2を選ぶべき場合 🐧
- Linux環境に慣れている
- 本番環境がLinuxサーバー
- Dockerを多用する
- より複雑なビルドツールを使う

## トラブルシューティング

### npm installでエラーが出る場合
```powershell
# キャッシュクリア
npm cache clean --force

# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### ポート3000が使用中の場合
```powershell
# 使用中のポートを確認
netstat -ano | findstr :3000

# プロセスを終了（PIDを確認して）
taskkill /PID [PID番号] /F
```

### 権限エラーの場合
```powershell
# PowerShellを管理者として実行するか、npmのグローバルディレクトリを変更
npm config set prefix "$env:APPDATA\npm"
```

---
最終更新: 2024/12/22