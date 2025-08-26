import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { PWAManager } from '@/components/pwa/pwa-manager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'MakeupAI - AIメイク提案アプリ',
  description: 'AIがあなたに最適なメイクを提案するパーソナライズドアプリ',
  keywords: ['メイク', 'AI', '美容', '提案', 'ビジュアル化'],
  authors: [{ name: 'MakeupAI Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MakeupAI',
  },
  openGraph: {
    title: 'MakeupAI - AIメイク提案アプリ',
    description: 'AIがあなたに最適なメイクを提案',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'MakeupAI',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'MakeupAI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakeupAI - AIメイク提案アプリ',
    description: 'AIがあなたに最適なメイクを提案',
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <PWAManager />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}