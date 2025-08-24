'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { Menu, X, Sparkles, User, Settings, LogOut } from 'lucide-react'

interface HeaderProps {
  isAuthenticated?: boolean
  user?: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
}

export function Header({ isAuthenticated = false, user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // メニューを閉じる
  const closeMenu = () => setIsMenuOpen(false)

  // パスが変更されたらメニューを閉じる
  useEffect(() => {
    closeMenu()
  }, [pathname])

  return (
    <header className="border-b bg-white backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold" style={{
              background: 'linear-gradient(to right, #ec4899, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              MakeupAI
            </h1>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    pathname === '/dashboard' 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link 
                  href="/upload" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    pathname === '/upload' 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  アップロード
                </Link>
                <Link 
                  href="/history" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    pathname === '/history' 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  履歴
                </Link>
                
                {/* ユーザーメニュー */}
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </Link>
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                >
                  ログイン
                </Link>
                <Link href="/signup" className="btn-primary">
                  無料で始める
                </Link>
              </>
            )}
          </nav>

          {/* モバイルメニューボタン */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="メニュー"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      pathname === '/dashboard' 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-700 hover:text-pink-600'
                    }`}
                  >
                    ダッシュボード
                  </Link>
                  <Link 
                    href="/upload" 
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      pathname === '/upload' 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-700 hover:text-pink-600'
                    }`}
                  >
                    アップロード
                  </Link>
                  <Link 
                    href="/history" 
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      pathname === '/history' 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-700 hover:text-pink-600'
                    }`}
                  >
                    履歴
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      pathname === '/settings' 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-700 hover:text-pink-600'
                    }`}
                  >
                    設定
                  </Link>
                  <div className="border-t pt-2 mt-2">
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      ログアウト
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={closeMenu}
                    className="px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={closeMenu}
                    className="mx-3 mt-2 btn-primary text-center"
                  >
                    無料で始める
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}