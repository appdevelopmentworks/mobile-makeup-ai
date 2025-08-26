'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { DatabaseService } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Crown,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Settings as SettingsIcon,
  CreditCard,
  Download,
  Globe
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { signOut } from '@/lib/auth'

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar: string
  }
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
    analysisComplete: boolean
    weeklyTips: boolean
  }
  privacy: {
    profileVisible: boolean
    dataSharing: boolean
    analyticsTracking: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: 'ja' | 'en'
    imageQuality: 'standard' | 'high'
  }
  subscription: {
    plan: 'free' | 'premium'
    status: 'active' | 'cancelled' | 'expired'
    nextBilling: string
    usageCount: number
    usageLimit: number
  }
}

const mockUserSettings: UserSettings = {
  profile: {
    name: 'ユーザー名',
    email: 'user@example.com',
    avatar: ''
  },
  notifications: {
    email: true,
    push: false,
    marketing: false,
    analysisComplete: true,
    weeklyTips: true
  },
  privacy: {
    profileVisible: true,
    dataSharing: false,
    analyticsTracking: true
  },
  appearance: {
    theme: 'system',
    language: 'ja',
    imageQuality: 'standard'
  },
  subscription: {
    plan: 'free',
    status: 'active',
    nextBilling: '',
    usageCount: 2,
    usageLimit: 3
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(mockUserSettings)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const { user, loading } = useAuth()
  const { toast } = useToast()

  // Load user settings from database
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return

      setDataLoading(true)
      try {
        // Load profile data
        const profile = await DatabaseService.getProfile(user.id)
        // Load preferences
        const preferences = await DatabaseService.getUserPreferences(user.id)

        if (profile && preferences) {
          const userSettings: UserSettings = {
            profile: {
              name: profile.full_name || user.user_metadata?.name || 'ユーザー名',
              email: profile.email || user.email || '',
              avatar: profile.avatar_url || user.user_metadata?.avatar_url || ''
            },
            notifications: {
              email: preferences.notification_settings.email || true,
              push: preferences.notification_settings.push || false,
              marketing: preferences.notification_settings.promotions || false,
              analysisComplete: preferences.notification_settings.trends || true,
              weeklyTips: true
            },
            privacy: {
              profileVisible: true,
              dataSharing: false,
              analyticsTracking: true
            },
            appearance: {
              theme: 'system',
              language: preferences.language as 'ja' | 'en' || 'ja',
              imageQuality: 'standard'
            },
            subscription: {
              plan: profile.subscription_status as 'free' | 'premium',
              status: profile.subscription_status === 'premium' ? 'active' : 'active',
              nextBilling: profile.subscription_end_date || '',
              usageCount: profile.monthly_usage_count,
              usageLimit: profile.subscription_status === 'premium' ? -1 : 3
            }
          }
          
          setSettings(userSettings)
        }
      } catch (error) {
        console.error('Failed to load user settings:', error)
        toast({
          variant: 'destructive',
          title: '設定の読み込みに失敗',
          description: 'ユーザー設定の取得中にエラーが発生しました。'
        })
      } finally {
        setDataLoading(false)
      }
    }

    if (!loading) {
      loadUserSettings()
    }
  }, [user?.id, loading, toast])

  const updateSettings = <T extends keyof UserSettings>(
    section: T,
    updates: Partial<UserSettings[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Update profile in database
      const success = await DatabaseService.updateProfile(user.id, {
        full_name: settings.profile.name,
        avatar_url: settings.profile.avatar
      })

      if (success) {
        toast({
          title: 'プロフィールを更新しました',
          description: '変更内容が保存されました。',
        })
      } else {
        throw new Error('Profile update failed')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      toast({
        variant: 'destructive',
        title: '更新エラー',
        description: 'プロフィールの更新に失敗しました。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'ログアウトしました',
        description: 'ご利用ありがとうございました。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ログアウトエラー',
        description: 'ログアウトに失敗しました。',
      })
    }
  }

  const handleSaveNotifications = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Get current preferences and update notifications
      const currentPrefs = await DatabaseService.getUserPreferences(user.id)
      if (currentPrefs) {
        const updatedPrefs = {
          ...currentPrefs,
          notification_settings: {
            email: settings.notifications.email,
            push: settings.notifications.push,
            trends: settings.notifications.analysisComplete,
            promotions: settings.notifications.marketing
          }
        }

        const success = await DatabaseService.saveUserPreferences(updatedPrefs)
        if (success) {
          toast({
            title: '通知設定を更新しました',
            description: '変更内容が保存されました。',
          })
        } else {
          throw new Error('Notifications save failed')
        }
      }
    } catch (error) {
      console.error('Notifications save error:', error)
      toast({
        variant: 'destructive',
        title: '更新エラー',
        description: '通知設定の更新に失敗しました。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAppearance = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const currentPrefs = await DatabaseService.getUserPreferences(user.id)
      if (currentPrefs) {
        const updatedPrefs = {
          ...currentPrefs,
          language: settings.appearance.language
        }

        const success = await DatabaseService.saveUserPreferences(updatedPrefs)
        if (success) {
          toast({
            title: '表示設定を更新しました',
            description: '変更内容が保存されました。',
          })
        } else {
          throw new Error('Appearance save failed')
        }
      }
    } catch (error) {
      console.error('Appearance save error:', error)
      toast({
        variant: 'destructive',
        title: '更新エラー',
        description: '表示設定の更新に失敗しました。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      toast({
        title: 'アカウント削除リクエスト',
        description: 'アカウント削除の処理を開始しました。',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '削除エラー',
        description: 'アカウント削除に失敗しました。',
      })
    }
  }

  const handleExportData = () => {
    // TODO: Implement data export
    toast({
      title: 'データエクスポート',
      description: 'データのダウンロードを開始しました。',
    })
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ダッシュボード
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  設定
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {settings.subscription.plan === 'premium' ? (
                  <Crown className="h-3 w-3" />
                ) : null}
                {settings.subscription.plan === 'premium' ? 'プレミアム' : '無料プラン'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 px-2 py-3 text-xs">
              <User className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden md:inline">プロフィール</span>
              <span className="xs:hidden sm:inline md:hidden">プロフ</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 px-2 py-3 text-xs">
              <Bell className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden md:inline">通知</span>
              <span className="xs:hidden sm:inline md:hidden">通知</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex flex-col items-center gap-1 px-2 py-3 text-xs">
              <Shield className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden md:inline">プライバシー</span>
              <span className="xs:hidden sm:inline md:hidden">設定</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 px-2 py-3 text-xs">
              <Palette className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden md:inline">外観</span>
              <span className="xs:hidden sm:inline md:hidden">外観</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex flex-col items-center gap-1 px-2 py-3 text-xs">
              <CreditCard className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden md:inline">プラン</span>
              <span className="xs:hidden sm:inline md:hidden">プラン</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>プロフィール設定</CardTitle>
                <CardDescription>
                  アカウント情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {settings.profile.name.charAt(0) || 'U'}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      写真を変更
                    </Button>
                    <p className="text-sm text-gray-500">
                      JPEGまたはPNG形式、最大2MB
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSettings('profile', { name: e.target.value })}
                      placeholder="お名前を入力"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSettings('profile', { email: e.target.value })}
                        className="pl-10"
                        placeholder="メールアドレス"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">新しいパスワード</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="新しいパスワード（変更する場合のみ）"
                        className="pr-10"
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
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? '保存中...' : '変更を保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>
                  お知らせの受信設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>メール通知</Label>
                      <p className="text-sm text-gray-500">
                        重要なお知らせをメールで受信
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => 
                        updateSettings('notifications', { email: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>プッシュ通知</Label>
                      <p className="text-sm text-gray-500">
                        ブラウザでの通知を受信
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => 
                        updateSettings('notifications', { push: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>分析完了通知</Label>
                      <p className="text-sm text-gray-500">
                        分析が完了したときに通知
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.analysisComplete}
                      onCheckedChange={(checked) => 
                        updateSettings('notifications', { analysisComplete: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>週間メイクTips</Label>
                      <p className="text-sm text-gray-500">
                        メイクのコツを週1回お届け
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyTips}
                      onCheckedChange={(checked) => 
                        updateSettings('notifications', { weeklyTips: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>マーケティング情報</Label>
                      <p className="text-sm text-gray-500">
                        新機能やキャンペーン情報
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) => 
                        updateSettings('notifications', { marketing: checked })
                      }
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={handleSaveNotifications} disabled={isLoading}>
                    {isLoading ? '保存中...' : '通知設定を保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>プライバシー設定</CardTitle>
                <CardDescription>
                  データの使用とプライバシーを管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>プロフィール公開</Label>
                      <p className="text-sm text-gray-500">
                        他のユーザーがプロフィールを表示可能
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.profileVisible}
                      onCheckedChange={(checked) => 
                        updateSettings('privacy', { profileVisible: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>データ共有</Label>
                      <p className="text-sm text-gray-500">
                        サービス改善のためのデータ提供
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        updateSettings('privacy', { dataSharing: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>分析トラッキング</Label>
                      <p className="text-sm text-gray-500">
                        使用状況の分析とトラッキング
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.analyticsTracking}
                      onCheckedChange={(checked) => 
                        updateSettings('privacy', { analyticsTracking: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">データの管理</h3>
                  <div className="grid gap-3">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      データをエクスポート
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          アカウントを削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消すことができません。すべてのデータが永久に削除されます。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>外観設定</CardTitle>
                <CardDescription>
                  アプリの見た目と動作をカスタマイズします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>テーマ</Label>
                    <Select
                      value={settings.appearance.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        updateSettings('appearance', { theme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">ライト</SelectItem>
                        <SelectItem value="dark">ダーク</SelectItem>
                        <SelectItem value="system">システム設定に従う</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>言語</Label>
                    <Select
                      value={settings.appearance.language}
                      onValueChange={(value: 'ja' | 'en') => 
                        updateSettings('appearance', { language: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            日本語
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>画質設定</Label>
                    <Select
                      value={settings.appearance.imageQuality}
                      onValueChange={(value: 'standard' | 'high') => 
                        updateSettings('appearance', { imageQuality: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">標準品質</SelectItem>
                        <SelectItem value="high">高品質</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      高品質は通信量が多くなります
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={handleSaveAppearance} disabled={isLoading}>
                    {isLoading ? '保存中...' : '表示設定を保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Settings */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  サブスクリプション
                  {settings.subscription.plan === 'premium' && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  プランと請求情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {settings.subscription.plan === 'premium' ? 'プレミアムプラン' : '無料プラン'}
                      </h3>
                      <p className="text-gray-600">
                        {settings.subscription.plan === 'premium' 
                          ? '無制限の分析とAI画像生成'
                          : '月3回までの基本分析'
                        }
                      </p>
                    </div>
                    <Badge variant={settings.subscription.plan === 'premium' ? 'default' : 'secondary'}>
                      {settings.subscription.status === 'active' ? 'アクティブ' : '無効'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>今月の使用量</span>
                      <span>
                        {settings.subscription.usageCount}/{settings.subscription.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(settings.subscription.usageCount / settings.subscription.usageLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {settings.subscription.plan === 'free' ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">プレミアムプランの特典</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        無制限の分析
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        AI画像生成機能
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        詳細な分析レポート
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        優先サポート
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600" asChild>
                      <Link href="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        プレミアムにアップグレード
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>次回請求日</span>
                      <span className="font-medium">{settings.subscription.nextBilling}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline">請求履歴</Button>
                      <Button variant="outline" className="text-red-600">
                        プラン解約
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign Out */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">アカウント</h3>
                <p className="text-sm text-gray-500">
                  {settings.profile.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}