'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { resetPassword } from '@/lib/auth'
import { useToast } from '../../../hooks/use-toast'
import { MainLayout } from '../../../components/layout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'パスワードリセットエラー',
          description: error.message,
        })
        return
      }

      setEmailSent(true)
      toast({
        title: 'リセットメール送信完了',
        description: 'パスワードリセット用のメールを送信しました。',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '予期しないエラー',
        description: 'パスワードリセット処理中にエラーが発生しました。',
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <MainLayout showHeader={false} showFooter={false} showBottomNav={false}>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mobile-card">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                メールを送信しました
              </CardTitle>
              <CardDescription className="text-base">
                {email} にパスワードリセット用のリンクを送信しました。
                メールをご確認ください。
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">次の手順</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. メールボックスを確認してください</li>
                  <li>2. 「パスワードをリセット」ボタンをクリック</li>
                  <li>3. 新しいパスワードを設定してください</li>
                </ol>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500">
                  メールが届かない場合は、スパムフォルダもご確認ください
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full touch-target"
                >
                  別のメールアドレスで試す
                </Button>
              </div>

              <div className="text-center">
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

  return (
    <MainLayout showHeader={false} showFooter={false} showBottomNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mobile-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              パスワードをお忘れですか？
            </CardTitle>
            <CardDescription>
              メールアドレスを入力すると、パスワードリセット用のリンクをお送りします
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordReset} className="mobile-form">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 mobile-input"
                    placeholder="your@example.com"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary touch-target"
                disabled={loading}
              >
                {loading ? '送信中...' : 'リセットメールを送信'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                パスワードを思い出しましたか？
              </p>
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