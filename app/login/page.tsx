'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/lib/auth'
import { useToast } from '../../hooks/use-toast'
import { MainLayout } from '../../components/layout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const errorParam = searchParams.get('error')
  const { toast } = useToast()

  // Show error message from URL parameters (e.g., from OAuth callback)
  useEffect(() => {
    if (errorParam) {
      toast({
        variant: 'destructive',
        title: '認証エラー',
        description: decodeURIComponent(errorParam),
      })
    }
  }, [errorParam, toast])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { user, error } = await signIn({ email, password })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'ログインエラー',
          description: error.message,
        })
        return
      }

      if (user) {
        toast({
          title: 'ログイン成功',
          description: 'ダッシュボードに移動します',
        })
        router.push(redirectTo)
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'ログインエラー',
        description: '予期せぬエラーが発生しました',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const { error } = await signInWithGoogle(redirectTo)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Googleログインエラー',
          description: error.message,
        })
        setLoading(false)
      }
      // Don't set loading to false here if successful, as we're redirecting
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'ログインエラー',
        description: '予期せぬエラーが発生しました',
      })
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="mobile-card bg-white/80 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <motion.div 
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  MakeupAI
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  アカウントにログインしてください
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.form 
                onSubmit={handleEmailLogin} 
                className="mobile-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">メールアドレス</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 mobile-input border-gray-200 focus:border-pink-400 focus:ring-pink-400 transition-all duration-200"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">パスワード</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 mobile-input border-gray-200 focus:border-pink-400 focus:ring-pink-400 transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-pink-50"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-pink-600 hover:text-pink-700 hover:underline transition-colors"
                  >
                    パスワードを忘れた方
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] touch-target"
                    disabled={loading}
                  >
                    <motion.span
                      animate={loading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                      transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
                    >
                      {loading ? 'ログイン中...' : 'ログイン'}
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.form>

              <motion.div 
                className="relative my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 font-medium">または</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] touch-target"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="mr-3 h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Googleでログイン</span>
                </Button>
              </motion.div>

              <motion.div 
                className="text-center text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                <span className="text-gray-600">アカウントをお持ちでない方は</span>{' '}
                <Link 
                  href="/signup" 
                  className="font-semibold text-pink-600 hover:text-pink-700 hover:underline transition-colors"
                >
                  新規登録
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  )
}