import Link from 'next/link'
import { Sparkles, Twitter, Instagram, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {/* ブランド情報 */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <h3 className="text-xl font-bold" style={{
                background: 'linear-gradient(to right, #ec4899, #9333ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                MakeupAI
              </h3>
            </Link>
            <p className="text-gray-600 mb-4">
              AIが提案するあなただけのメイク。
              顔写真をアップロードするだけで、パーソナライズされたメイク提案を受けることができます。
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/makeup-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-600" />
              </a>
              <a 
                href="https://instagram.com/makeup-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-600" />
              </a>
              <a 
                href="mailto:support@makeup-ai.com"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* サービス */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">サービス</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-pink-600 transition-colors">
                  メイク分析
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-pink-600 transition-colors">
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-gray-600 hover:text-pink-600 transition-colors">
                  履歴管理
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-pink-600 transition-colors">
                  料金プラン
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">サポート</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-pink-600 transition-colors">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-pink-600 transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-pink-600 transition-colors">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-600 hover:text-pink-600 transition-colors">
                  使い方ガイド
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">法的情報</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-pink-600 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-pink-600 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Cookie ポリシー
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-600 hover:text-pink-600 transition-colors">
                  セキュリティ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600">
            &copy; 2024 MakeupAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/sitemap" className="text-gray-600 hover:text-pink-600 transition-colors">
              サイトマップ
            </Link>
            <Link href="/accessibility" className="text-gray-600 hover:text-pink-600 transition-colors">
              アクセシビリティ
            </Link>
            <span className="text-gray-400">
              Made with ❤️ in Japan
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}