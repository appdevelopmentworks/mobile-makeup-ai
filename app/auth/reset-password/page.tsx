'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { updatePassword } from '@/lib/auth'
import { useToast } from '../../../hooks/use-toast'
import { MainLayout } from '../../../components/layout'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'パスワードが一致しません',
        description: 'パスワードと確認パスワードが一致していません。',
      })
      return
    }

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'パスワードが短すぎます',
        description: 'パスワードは8文字以上で入力してください。',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await updatePassword(password)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'パスワード更新エラー',
          description: error.message,
        })
        return
      }

      toast({
        title: 'パスワード更新完了',
        description: 'パスワードが正常に更新されました。',
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '予期しないエラー',
        description: 'パスワード更新中にエラーが発生しました。',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout showHeader={false} showFooter={false} showBottomNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mobile-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              新しいパスワードを設定
            </CardTitle>
            <CardDescription>
              安全な新しいパスワードを入力してください
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordReset} className="mobile-form">
              <div className="space-y-2">
                <Label htmlFor="password">新しいパスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 mobile-input"
                    placeholder="新しいパスワードを入力"
                    required
                    minLength={8}
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
                <p className="text-xs text-gray-500">
                  8文字以上で入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 mobile-input"
                    placeholder="パスワードを再入力"
                    required
                    minLength={8}
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

              <Button
                type="submit"
                className="w-full btn-primary touch-target"
                disabled={loading}
              >
                {loading ? 'パスワード更新中...' : 'パスワードを更新'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ログインページに戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}