# Git ワークフローガイド

## 🌳 ブランチ戦略

### メインブランチ
- `main` - 本番環境用（保護されたブランチ）
- `develop` - 開発環境用（統合ブランチ）

### フィーチャーブランチ
- `feature/[機能名]` - 新機能開発
- `fix/[バグ名]` - バグ修正
- `hotfix/[緊急修正名]` - 本番環境の緊急修正
- `refactor/[リファクタリング対象]` - コードリファクタリング
- `docs/[ドキュメント名]` - ドキュメント更新

## 📝 コミットメッセージ規約

### フォーマット
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必須）
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（フォーマット、セミコロン追加など）
- `refactor`: リファクタリング（機能追加・バグ修正を含まない）
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `build`: ビルドシステム・外部依存関係の変更
- `ci`: CI設定ファイルの変更
- `chore`: その他の変更（ビルドツール、補助ツールの変更など）
- `revert`: コミットのリバート

### Scope（オプション）
- `auth`: 認証関連
- `analysis`: 分析機能
- `generation`: 画像生成
- `payment`: 決済
- `ui`: UIコンポーネント
- `api`: APIエンドポイント
- `db`: データベース
- `deps`: 依存関係

### Subject（必須）
- 50文字以内
- 現在形・命令形で記述
- 最初の文字は小文字
- 文末にピリオドなし

### 例
```bash
# 良い例
feat(auth): add social login with Google
fix(analysis): resolve memory leak in face detection
docs(readme): update installation instructions
style(components): format code with Prettier
refactor(api): simplify error handling logic
test(utils): add unit tests for image validation
chore(deps): update dependencies to latest versions

# 悪い例
Fixed bug  # typeがない、詳細が不明
added new feature  # typeがない、何の機能か不明
WIP  # 意味のないメッセージ
```

## 🔄 ワークフロー

### 1. 新機能開発
```bash
# developブランチから作業開始
git checkout develop
git pull origin develop

# フィーチャーブランチ作成
git checkout -b feature/user-dashboard

# 作業実施・コミット
git add .
git commit -m "feat(dashboard): add user statistics widget"

# リモートにプッシュ
git push origin feature/user-dashboard

# プルリクエスト作成（GitHub/GitLab）
# develop ← feature/user-dashboard
```

### 2. バグ修正
```bash
# developブランチから作業開始
git checkout develop
git pull origin develop

# 修正ブランチ作成
git checkout -b fix/login-error

# 修正実施・コミット
git add .
git commit -m "fix(auth): resolve login timeout error"

# リモートにプッシュ
git push origin fix/login-error

# プルリクエスト作成
# develop ← fix/login-error
```

### 3. 緊急修正（Hotfix）
```bash
# mainブランチから作業開始（本番環境の緊急修正）
git checkout main
git pull origin main

# ホットフィックスブランチ作成
git checkout -b hotfix/payment-critical-bug

# 修正実施・コミット
git add .
git commit -m "hotfix(payment): fix critical payment processing error"

# リモートにプッシュ
git push origin hotfix/payment-critical-bug

# プルリクエスト作成（2つ）
# main ← hotfix/payment-critical-bug
# develop ← hotfix/payment-critical-bug
```

## 🔍 コードレビュー

### レビュー前チェックリスト
- [ ] コードがビルドできる
- [ ] テストが全て通る
- [ ] ESLintエラーがない
- [ ] TypeScriptエラーがない
- [ ] 新機能にテストがある
- [ ] ドキュメントが更新されている

### レビューポイント
1. **機能性**: 要件を満たしているか
2. **可読性**: コードが理解しやすいか
3. **保守性**: 将来の変更が容易か
4. **パフォーマンス**: 効率的な実装か
5. **セキュリティ**: 脆弱性がないか
6. **テスト**: 適切なテストカバレッジか

## 🏷️ リリース管理

### バージョニング（Semantic Versioning）
```
MAJOR.MINOR.PATCH

例: 1.2.3
- MAJOR: 後方互換性のない変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正
```

### リリースフロー
```bash
# developからリリースブランチ作成
git checkout develop
git checkout -b release/1.2.0

# バージョン更新
npm version minor  # package.jsonのバージョン更新

# リリースノート作成
echo "## Version 1.2.0" >> CHANGELOG.md

# mainにマージ
git checkout main
git merge --no-ff release/1.2.0

# タグ付け
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# developに反映
git checkout develop
git merge --no-ff main
```

## 🛡️ ブランチ保護ルール

### main ブランチ
- 直接プッシュ禁止
- プルリクエスト必須
- レビュー承認必須（最低1人）
- CIテスト成功必須
- ブランチの最新化必須

### develop ブランチ
- 直接プッシュ禁止
- プルリクエスト必須
- CIテスト成功必須

## 📊 Git統計コマンド

```bash
# コミット数統計
git shortlog -sn

# ファイル変更統計
git diff --stat main..develop

# 特定期間のコミット
git log --since="2024-01-01" --until="2024-12-31"

# 作者別のコード行数
git ls-files | xargs -n1 git blame --line-porcelain | sed -n 's/^author //p' | sort -f | uniq -ic | sort -nr

# ブランチの可視化
git log --graph --pretty=oneline --abbrev-commit --all
```

## 🚨 トラブルシューティング

### コンフリクト解決
```bash
# マージ時のコンフリクト
git merge develop
# コンフリクトを手動で解決
git add .
git commit -m "resolve merge conflicts"
```

### コミットの取り消し
```bash
# 直前のコミットを取り消し（ファイルは保持）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消し
git reset --hard HEAD~1

# プッシュ済みのコミットを取り消し（非推奨）
git revert HEAD
```

### ブランチの削除
```bash
# ローカルブランチ削除
git branch -d feature/old-feature

# リモートブランチ削除
git push origin --delete feature/old-feature
```

## 📚 便利なGitエイリアス

`.gitconfig`に追加:
```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    df = diff
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    last = log -1 HEAD
    unstage = reset HEAD --
    amend = commit --amend --no-edit
    today = log --since=midnight --author='$(git config user.name)' --oneline
```

## 🔗 関連リンク

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)