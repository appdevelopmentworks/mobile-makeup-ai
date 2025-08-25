'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Camera, Palette, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '../components/layout'

export default function HomePage() {
  return (
    <MainLayout className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div 
          className="text-center space-y-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              AIが提案する<br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                あなただけのメイク
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            顔写真をアップロードするだけで、AIがあなたの顔型や肌色を分析し、
            パーソナライズされたメイク提案を行います。
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Link href="/upload">
                <Camera className="mr-2 h-5 w-5" />
                写真をアップロード
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
              <Link href="#features">
                <Sparkles className="mr-2 h-5 w-5" />
                機能を見る
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              3ステップで理想のメイクを発見
            </h2>
            <p className="text-lg text-gray-600">
              シンプルで直感的な操作で、あなたにぴったりのメイクを見つけましょう
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="w-8 h-8" />,
                title: "簡単アップロード",
                description: "顔写真を1枚アップロードするだけで分析が始まります",
                gradient: "from-pink-500 to-rose-500",
                delay: 0.2
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "AI分析",
                description: "顔型、肌色、パーツを詳細に分析してパーソナライズ提案",
                gradient: "from-purple-500 to-indigo-500",
                delay: 0.4
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "ビジュアライゼーション",
                description: "メイク後のあなたをAIが生成してプレビュー表示",
                gradient: "from-blue-500 to-cyan-500",
                delay: 0.6
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-lg text-gray-600">
              あなたのニーズに合わせてお選びください
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">無料プラン</h3>
                    <p className="text-gray-600 mb-6">まずはお試しから</p>
                    <div className="text-4xl font-bold text-gray-900">
                      ¥0
                      <span className="text-lg font-medium text-gray-500">/月</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      "月3回まで利用可能",
                      "基本的なメイク提案",
                      "AIビジュアライゼーション"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/signup">
                      無料で始める
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  おすすめ
                </span>
              </div>
              
              <Card className="h-full bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">プレミアムプラン</h3>
                    <p className="text-gray-600 mb-6">制限なしで使い放題</p>
                    <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      ¥3,000
                      <span className="text-lg font-medium text-gray-500">/月</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      "無制限利用",
                      "高度なメイク提案",
                      "複数パターン生成",
                      "優先サポート"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <Link href="/signup?plan=premium">
                      今すぐ始める
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </section>
    </MainLayout>
  )
}