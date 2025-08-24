# コーディングガイドライン

## 1. 基本原則

### DRY (Don't Repeat Yourself)
- 重複コードを避け、再利用可能なコンポーネントとユーティリティを作成する

### KISS (Keep It Simple, Stupid)
- シンプルで理解しやすいコードを書く
- 過度に複雑な実装は避ける

### YAGNI (You Aren't Gonna Need It)
- 現時点で必要ない機能は実装しない
- 将来の要件は推測せず、現在の要件に集中する

## 2. TypeScript規約

### 型定義

```typescript
// ✅ Good - 明示的な型定義
interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  subscriptionStatus: 'free' | 'premium';
}

// ❌ Bad - any型の使用
const userData: any = fetchUser();
```

### 命名規則

```typescript
// インターフェース: PascalCase、Iプレフィックスなし
interface UserProfile { }

// 型エイリアス: PascalCase
type SubscriptionStatus = 'free' | 'premium';

// 変数・関数: camelCase
const userName = 'John';
function getUserProfile() { }

// 定数: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5242880; // 5MB

// コンポーネント: PascalCase
function UserDashboard() { }

// カスタムフック: use + PascalCase
function useAuth() { }
```

## 3. React/Next.js規約

### コンポーネント構造

```typescript
// components/features/analysis/FaceAnalyzer.tsx

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// 型定義
interface FaceAnalyzerProps {
  image: string;
  onComplete: (data: AnalysisData) => void;
  className?: string;
}

// コンポーネント
export function FaceAnalyzer({ 
  image, 
  onComplete,
  className 
}: FaceAnalyzerProps) {
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Effects
  useEffect(() => {
    // 副作用
  }, []);
  
  // Event handlers
  const handleAnalysis = async () => {
    // ロジック
  };
  
  // Render
  return (
    <div className={cn('relative', className)}>
      {/* JSX */}
    </div>
  );
}
```

### Hooks使用規則

```typescript
// カスタムフックは独立したファイルに
// hooks/useAnalysis.ts
export function useAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const analyze = async (image: string) => {
    // ロジック
  };
  
  return { data, loading, error, analyze };
}
```

## 4. API Route規約

```typescript
// app/api/analysis/face/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// スキーマ定義
const requestSchema = z.object({
  image: z.string(),
  options: z.object({
    detailed: z.boolean().optional()
  }).optional()
});

// エラーレスポンス
function errorResponse(
  message: string, 
  status: number = 400
) {
  return NextResponse.json(
    { success: false, error: { message } },
    { status }
  );
}

// メインハンドラー
export async function POST(request: NextRequest) {
  try {
    // 1. 認証チェック
    const user = await authenticate(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // 2. バリデーション
    const body = await request.json();
    const data = requestSchema.parse(body);
    
    // 3. ビジネスロジック
    const result = await processAnalysis(data);
    
    // 4. レスポンス
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    // エラーハンドリング
    if (error instanceof z.ZodError) {
      return errorResponse('Validation error', 400);
    }
    
    console.error('API Error:', error);
    return errorResponse('Internal server error', 500);
  }
}
```

## 5. スタイリング規約

### TailwindCSS使用方法

```tsx
// ✅ Good - cn()ユーティリティで条件付きクラス
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />

// ❌ Bad - テンプレートリテラルで条件付きクラス
<div className={`rounded-lg p-4 ${isActive ? 'bg-blue-500' : ''}`} />
```

### コンポーネントスタイリング

```tsx
// ✅ Good - 一貫性のあるスペーシング
<div className="space-y-4">
  <header className="flex items-center justify-between p-6">
    <h1 className="text-2xl font-bold">Title</h1>
  </header>
  <main className="px-6 pb-6">
    {/* Content */}
  </main>
</div>

// ❌ Bad - 不規則なスペーシング
<div>
  <header className="p-3 mb-2">
    <h1 style={{ fontSize: '24px' }}>Title</h1>
  </header>
  <main className="pl-4 pr-6 pb-8">
    {/* Content */}
  </main>
</div>
```

## 6. ファイル・フォルダ構造

```
components/
├── ui/                 # 基本UIコンポーネント（shadcn/ui）
│   ├── button.tsx
│   └── card.tsx
├── features/          # 機能別コンポーネント
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── analysis/
│       ├── FaceAnalyzer.tsx
│       └── ResultDisplay.tsx
└── layout/            # レイアウトコンポーネント
    ├── Header.tsx
    └── Footer.tsx

lib/
├── api/              # API関連ユーティリティ
├── hooks/            # カスタムフック
├── utils/            # ユーティリティ関数
└── validations/      # バリデーションスキーマ
```

## 7. エラーハンドリング

```typescript
// ✅ Good - 適切なエラーハンドリング
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  // エラーログ
  console.error('Error fetching data:', error);
  
  // ユーザー向けエラー処理
  if (error instanceof NetworkError) {
    showToast('ネットワークエラーが発生しました');
  } else {
    showToast('予期しないエラーが発生しました');
  }
  
  // エラー報告（本番環境）
  if (process.env.NODE_ENV === 'production') {
    reportToSentry(error);
  }
  
  throw error; // 必要に応じて再スロー
}

// ❌ Bad - エラーを握りつぶす
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  // 何もしない
}
```

## 8. パフォーマンス最適化

### 画像最適化

```tsx
import Image from 'next/image';

// ✅ Good - Next.js Image使用
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
  loading="lazy"
/>

// ❌ Bad - 通常のimg要素
<img src="/avatar.jpg" alt="User avatar" />
```

### メモ化

```tsx
// ✅ Good - 適切なメモ化
const MemoizedComponent = memo(ExpensiveComponent);

const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
);

const memoizedCallback = useCallback(
  () => doSomething(a, b),
  [a, b]
);
```

## 9. テスト規約

```typescript
// __tests__/components/FaceAnalyzer.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaceAnalyzer } from '@/components/features/analysis/FaceAnalyzer';

describe('FaceAnalyzer', () => {
  it('should analyze face when image is provided', async () => {
    const onComplete = jest.fn();
    
    render(
      <FaceAnalyzer 
        image="base64..." 
        onComplete={onComplete}
      />
    );
    
    const analyzeButton = screen.getByRole('button', { 
      name: /分析開始/i 
    });
    
    await userEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          faceShape: expect.any(String)
        })
      );
    });
  });
});
```

## 10. Git コミットメッセージ

```bash
# Format: <type>(<scope>): <subject>

# Types:
# - feat: 新機能
# - fix: バグ修正
# - docs: ドキュメント変更
# - style: コードスタイル変更
# - refactor: リファクタリング
# - test: テスト追加・修正
# - chore: ビルドツール・補助ツール変更

# Examples:
feat(auth): Add social login with Google
fix(analysis): Resolve memory leak in face detection
docs(readme): Update installation instructions
style(components): Format code with Prettier
refactor(api): Simplify error handling logic
test(utils): Add unit tests for image validation
chore(deps): Update dependencies to latest versions
```

## 11. セキュリティ

```typescript
// ✅ Good - 入力のサニタイズ
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// ✅ Good - 環境変数の適切な使用
const apiKey = process.env.STRIPE_SECRET_KEY; // サーバーサイドのみ
const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY; // クライアントOK

// ❌ Bad - シークレットの露出
const apiKey = "sk_test_abcd1234"; // ハードコード禁止
```

## 12. アクセシビリティ

```tsx
// ✅ Good - アクセシブルなコンポーネント
<button
  aria-label="メニューを開く"
  aria-expanded={isOpen}
  onClick={toggleMenu}
>
  <MenuIcon aria-hidden="true" />
</button>

<img 
  src="/chart.png" 
  alt="2024年の売上推移グラフ。1月から12月にかけて右肩上がりの成長を示している"
/>

// ❌ Bad - アクセシビリティ無視
<div onClick={handleClick}>クリック</div>
<img src="/chart.png" alt="グラフ" />
```