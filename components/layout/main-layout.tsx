'use client'

import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { BottomNavigation } from './navigation'

interface MainLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showFooter?: boolean
  showBottomNav?: boolean
  isAuthenticated?: boolean
  isPremium?: boolean
  user?: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  className?: string
}

export function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  showBottomNav = true,
  isAuthenticated = false,
  isPremium = false,
  user,
  className = ''
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showHeader && (
        <Header 
          isAuthenticated={isAuthenticated} 
          user={user} 
        />
      )}
      
      <main className={`flex-1 ${showBottomNav && isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {showBottomNav && isAuthenticated && (
        <BottomNavigation 
          isPremium={isPremium}
        />
      )}
    </div>
  )
}