import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'MakeupAI - AIメイク提案アプリ',
  description: 'AIがあなたに最適なメイクを提案するパーソナライズドアプリ',
  keywords: ['メイク', 'AI', '美容', '提案', 'ビジュアル化'],
  authors: [{ name: 'MakeupAI Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
  },
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
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}