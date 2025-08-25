'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Camera, 
  History, 
  Settings, 
 
  BarChart3, 
  Palette,
  Crown,
  Upload
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  requireAuth?: boolean
  requirePremium?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    label: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    label: 'ダッシュボード',
    href: '/dashboard',
    icon: BarChart3,
    requireAuth: true,
  },
  {
    label: 'メイク分析',
    href: '/upload',
    icon: Upload,
    requireAuth: true,
  },
  {
    label: 'AI画像生成',
    href: '/generation',
    icon: Palette,
    requireAuth: true,
    requirePremium: false,
  },
  {
    label: '履歴',
    href: '/history',
    icon: History,
    requireAuth: true,
  },
  {
    label: '設定',
    href: '/settings',
    icon: Settings,
    requireAuth: true,
  },
]

interface NavigationProps {
  isAuthenticated?: boolean
  isPremium?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Navigation({ 
  isAuthenticated = false, 
  isPremium = false,
  orientation = 'horizontal',
  className = ''
}: NavigationProps) {
  const pathname = usePathname()

  const filteredItems = navigationItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false
    return true
  })

  const baseClasses = orientation === 'horizontal' 
    ? 'flex items-center gap-2' 
    : 'flex flex-col space-y-1'

  return (
    <nav className={`${baseClasses} ${className}`}>
      {filteredItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        const isDisabled = item.requirePremium && !isPremium

        return (
          <Link
            key={item.href}
            href={isDisabled ? '#' : item.href}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-colors relative
              ${isActive 
                ? 'bg-pink-50 text-pink-600 border border-pink-200' 
                : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }
              ${orientation === 'vertical' ? 'w-full justify-start' : ''}
            `}
            onClick={isDisabled ? (e) => e.preventDefault() : undefined}
          >
            <Icon className="w-4 h-4" />
            <span className={orientation === 'horizontal' ? 'hidden lg:block' : ''}>
              {item.label}
            </span>
            
            {item.badge && (
              <span className="flex items-center gap-1 ml-1">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </span>
            )}
            
            {isDisabled && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-md" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// サイドバー用の縦型ナビゲーション
export function SidebarNavigation({ isAuthenticated, isPremium }: { 
  isAuthenticated?: boolean
  isPremium?: boolean 
}) {
  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        <Navigation 
          isAuthenticated={isAuthenticated}
          isPremium={isPremium}
          orientation="vertical"
        />
      </div>
    </aside>
  )
}

// ボトムナビゲーション（モバイル用）
export function BottomNavigation({ isPremium }: { 
  isPremium?: boolean 
}) {
  const pathname = usePathname()
  
  // モバイル用に4つのメインアイテムを定義
  const mobileItems: NavigationItem[] = [
    {
      label: 'ホーム',
      href: '/dashboard',
      icon: Home,
      requireAuth: true,
    },
    {
      label: '分析',
      href: '/upload',
      icon: Camera,
      requireAuth: true,
    },
    {
      label: '履歴',
      href: '/history',
      icon: History,
      requireAuth: true,
    },
    {
      label: '設定',
      href: '/settings',
      icon: Settings,
      requireAuth: true,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isDisabled = item.requirePremium && !isPremium

          return (
            <Link
              key={item.href}
              href={isDisabled ? '#' : item.href}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors rounded-lg min-w-[60px]
                ${isActive 
                  ? 'text-pink-600' 
                  : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500'
                }
              `}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
            >
              <div className="relative">
                <Icon className={`${isActive ? 'w-6 h-6' : 'w-5 h-5'} transition-all`} />
                {item.badge && (
                  <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}` }>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}