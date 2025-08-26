'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Download, 
  X, 
  Smartphone,
  Monitor,
  CheckCircle
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installInstructions, setInstallInstructions] = useState<{
    browser: string
    device: string
    steps: string[]
  } | null>(null)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // Check for navigator.standalone (iOS Safari)
      if ((navigator as any).standalone) {
        setIsInstalled(true)
        return
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent
      e.preventDefault()
      setDeferredPrompt(event)
      
      // Only show prompt if not dismissed recently
      const lastDismissed = localStorage.getItem('pwa-install-dismissed')
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      
      if (!lastDismissed || now - parseInt(lastDismissed) > dayInMs) {
        setShowPrompt(true)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      onInstall?.()
    }

    // Detect browser and device for manual instructions
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
      const isChrome = /chrome/.test(userAgent)
      const isFirefox = /firefox/.test(userAgent)
      const isEdge = /edge/.test(userAgent)
      const isMobile = /mobile/.test(userAgent)

      let instructions = null

      if (isIOS && isSafari) {
        instructions = {
          browser: 'Safari',
          device: 'iOS',
          steps: [
            '画面下部の共有ボタン (□↑) をタップ',
            '「ホーム画面に追加」を選択',
            '「追加」をタップして完了'
          ]
        }
      } else if (isChrome && isMobile) {
        instructions = {
          browser: 'Chrome',
          device: 'Android',
          steps: [
            'メニュー (⋮) をタップ',
            '「ホーム画面に追加」を選択',
            '「インストール」をタップ'
          ]
        }
      } else if (isChrome && !isMobile) {
        instructions = {
          browser: 'Chrome',
          device: 'Desktop',
          steps: [
            'アドレスバー右側のインストールアイコンをクリック',
            'または メニュー → ツール → ショートカットを作成',
            '「インストール」をクリック'
          ]
        }
      } else if (isFirefox) {
        instructions = {
          browser: 'Firefox',
          device: isMobile ? 'Mobile' : 'Desktop',
          steps: [
            'メニューを開く',
            '「ホーム画面に追加」または「ページをインストール」を選択',
            '確認してインストール完了'
          ]
        }
      } else if (isEdge) {
        instructions = {
          browser: 'Edge',
          device: isMobile ? 'Mobile' : 'Desktop',
          steps: [
            'メニュー (⋯) を開く',
            '「アプリ」→「このサイトをアプリとしてインストール」',
            '「インストール」をクリック'
          ]
        }
      }

      setInstallInstructions(instructions)
    }

    detectPlatform()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual instructions if no native prompt
      setShowPrompt(true)
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        onInstall?.()
      } else {
        console.log('User dismissed the install prompt')
        handleDismiss()
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during app installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    onDismiss?.()
  }

  // Don't show anything if already installed or dismissed
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 md:max-w-md md:left-auto md:right-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              アプリをインストール
            </h3>
            <p className="text-gray-600 text-xs mb-3">
              ホーム画面から素早くアクセス！オフラインでも使用可能
            </p>
            
            {/* Installation Options */}
            <div className="space-y-2">
              {deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  今すぐインストール
                </Button>
              ) : installInstructions ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {installInstructions.device === 'iOS' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                    <span>{installInstructions.browser} での手順:</span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    {installInstructions.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  インストール方法を確認
                </Button>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>オフラインでも利用可能</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>ホーム画面から素早くアクセス</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>プッシュ通知でトレンド情報</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}