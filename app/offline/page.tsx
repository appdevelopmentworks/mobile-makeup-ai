'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Camera,
  History,
  Sparkles
} from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      router.back()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Status Icon */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            {isOnline ? (
              <Sparkles className="w-12 h-12 text-green-500" />
            ) : (
              <WifiOff className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {isOnline ? 'インターネットに再接続しました' : 'オフラインです'}
            </CardTitle>
            <p className="text-gray-600">
              {isOnline 
                ? 'インターネット接続が復旧しました。ページを再読み込みしてください。'
                : 'インターネット接続を確認してください。一部の機能は利用できません。'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className={`p-4 rounded-lg text-center ${
              isOnline 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                isOnline ? 'text-green-800' : 'text-red-800'
              }`}>
                {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full"
                variant={isOnline ? "default" : "outline"}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isOnline ? '再読み込み' : '再試行'}
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </div>

            {/* Offline Features */}
            {!isOnline && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">オフラインで利用可能:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span>撮影した写真の確認</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <History className="w-4 h-4" />
                    <span>過去の分析結果の閲覧</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4" />
                    <span>基本的なメイクアドバイス</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">接続のヒント:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Wi-Fi接続を確認してください</li>
                <li>• モバイルデータ通信がオンになっているか確認</li>
                <li>• 別のネットワークに接続してみてください</li>
                <li>• しばらく時間をおいて再度お試しください</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            MakeupAI は PWA として動作し、オフラインでも一部機能をご利用いただけます
          </p>
        </div>
      </div>
    </div>
  )
}