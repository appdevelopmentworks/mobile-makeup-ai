import Link from 'next/link'
import { MainLayout } from '../components/layout'

export default function HomePage() {
  return (
    <MainLayout className="bg-gradient-to-br">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl font-bold text-gray-900" style={{fontSize: 'clamp(2rem, 5vw, 4rem)'}}>
            AIが提案する<br />
            <span style={{
              background: 'linear-gradient(to right, #ec4899, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              あなただけのメイク
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            顔写真をアップロードするだけで、AIがあなたの顔型や肌色を分析し、
            パーソナライズされたメイク提案を行います。
          </p>
          <div className="flex gap-4 justify-center" style={{flexWrap: 'wrap'}}>
            <Link href="/upload" className="btn-primary">
              📤 写真をアップロード
            </Link>
            <Link href="#features" className="btn-outline">
              機能を見る
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="grid gap-8 mb-16" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
          <div className="text-center bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 mx-auto bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <span style={{fontSize: '24px'}}>📤</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">簡単アップロード</h3>
            <p className="text-gray-600">
              顔写真を1枚アップロードするだけで分析が始まります
            </p>
          </div>

          <div className="text-center bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span style={{fontSize: '24px'}}>✨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI分析</h3>
            <p className="text-gray-600">
              顔型、肌色、パーツを詳細に分析してパーソナライズ提案
            </p>
          </div>

          <div className="text-center bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span style={{fontSize: '24px'}}>🖼️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">ビジュアライゼーション</h3>
            <p className="text-gray-600">
              メイク後のあなたをAIが生成してプレビュー表示
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="text-center space-y-8">
          <h3 className="text-3xl font-bold text-gray-900">シンプルな料金プラン</h3>
          <div className="grid gap-8 max-w-4xl mx-auto" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
            <div className="bg-white border-2 rounded-lg p-6">
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-2">無料プラン</h4>
                <p className="text-gray-600 mb-4">まずはお試しから</p>
                <div className="text-3xl font-bold">¥0<span className="text-base font-medium">/月</span></div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>月3回まで利用可能</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>基本的なメイク提案</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>AIビジュアライゼーション</span>
                </div>
              </div>
              <Link href="/signup" className="w-full block text-center btn-outline">
                無料で始める
              </Link>
            </div>

            <div className="bg-white border-2 border-pink-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform bg-pink-500 text-white px-4 py-1 rounded-full" style={{fontSize: '14px'}}>
                おすすめ
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-2">プレミアムプラン</h4>
                <p className="text-gray-600 mb-4">制限なしで使い放題</p>
                <div className="text-3xl font-bold">¥3,000<span className="text-base font-medium">/月</span></div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>無制限利用</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>高度なメイク提案</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>複数パターン生成</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>優先サポート</span>
                </div>
              </div>
              <Link href="/signup?plan=premium" className="w-full block text-center btn-primary">
                今すぐ始める
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}