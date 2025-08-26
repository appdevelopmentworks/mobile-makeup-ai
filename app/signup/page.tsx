'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { signUp, signUpWithGoogle } from '@/lib/auth'
import { useToast } from '../../hooks/use-toast'
import { MainLayout } from '../../components/layout'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreeToTerms) {
      toast({
        variant: 'destructive',
        title: '利用規約への同意が必要です',
        description: '利用規約とプライバシーポリシーに同意してください',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'パスワードが一致しません',
        description: 'パスワードと確認用パスワードを同じにしてください',
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'パスワードが短すぎます',
        description: 'パスワードは6文字以上で入力してください',
      })
      return
    }

    setLoading(true)

    try {
      const { user, error } = await signUp({ email, password, name })

      if (error) {
        toast({
          variant: 'destructive',
          title: '登録エラー',
          description: error.message,
        })
        return
      }

      if (user) {
        toast({
          title: '登録完了',
          description: 'メールアドレスに確認メールを送信しました。リンクをクリックして登録を完了してください。',
        })
        router.push('/login?message=check-email')
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '登録エラー',
        description: '予期せぬエラーが発生しました',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!agreeToTerms) {
      toast({
        variant: 'destructive',
        title: '利用規約への同意が必要です',
        description: '利用規約とプライバシーポリシーに同意してください',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signUpWithGoogle('/dashboard')

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Google登録エラー',
          description: error.message,
        })
        setLoading(false)
      }
      // Don't set loading to false here if successful, as we're redirecting
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '登録エラー',
        description: '予期せぬエラーが発生しました',
      })
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <Card className="w-full max-w-md mobile-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            MakeupAI
          </CardTitle>
          <CardDescription className="text-gray-600">
            新しいアカウントを作成して<br />
            AIメイクアドバイスを始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignup} className="mobile-form">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="田中太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 mobile-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 mobile-input"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 mobile-input"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                6文字以上で入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 mobile-input"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <div className="leading-none">
                <Label 
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  <Link href="/terms" className="text-pink-600 hover:underline">
                    利用規約
                  </Link>
                  と
                  <Link href="/privacy" className="text-pink-600 hover:underline">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary touch-target"
              disabled={loading}
            >
              {loading ? '登録中...' : 'アカウントを作成'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full touch-target bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#fbbc04"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path
                fill="#ea4335"
                d="M1 1h4v4H1z"
              />
            </svg>
            <span className="font-semibold text-gray-700">
              {loading ? 'Google認証中...' : 'Googleアカウントで簡単登録'}
            </span>
          </Button>

          <div className="text-center text-xs text-gray-500 px-2">
            💡 Googleアカウントなら面倒なパスワード設定不要！わずか数秒で登録完了
          </div>

          <div className="text-center text-sm">
            すでにアカウントをお持ちの方は{' '}
            <Link 
              href="/login" 
              className="font-medium text-pink-600 hover:underline"
            >
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}