'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/components/providers/auth-provider'
import { Camera, Info, Sparkles, Image as ImageIcon } from 'lucide-react'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('japan')

  const regions = [
    { id: 'japan', name: '日本', flag: '🇯🇵' },
    { id: 'korea', name: '韓国', flag: '🇰🇷' },
    { id: 'western', name: '欧米', flag: '🇺🇸' },
    { id: 'china', name: '中国', flag: '🇨🇳' },
  ]

  const handleImageCapture = () => {
    // TODO: Implement camera/upload logic
    router.push('/analysis/results')
  }

  return (
    <MainLayout
      isAuthenticated={true}
      user={user ? {
        id: user.id,
        name: user.user_metadata?.name,
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url
      } : undefined}
      showHeader={false}
      showFooter={false}
      showBottomNav={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-12 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Camera className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">写真をアップロード</h1>
          </div>
          <p className="text-pink-100 text-sm">正面から撮影してください</p>
        </motion.div>

        {/* Content */}
        <div className="p-4 pb-24 space-y-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="border-2 border-dashed border-pink-200 hover:border-pink-400 transition-all duration-300 cursor-pointer shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden"
              onClick={handleImageCapture}
            >
              <CardContent className="p-8 text-center relative">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Camera className="w-10 h-10 text-pink-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  タップして撮影
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  または写真を選択
                </p>
                <motion.div
                  className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-full text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-4 h-4" />
                  AI分析を開始
                </motion.div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-100/30 rounded-full -translate-y-8 translate-x-8"></div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Info className="w-5 h-5 text-teal-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                      📝 撮影のポイント
                    </h3>
                    <div className="space-y-2">
                      {[
                        "正面を向いて撮影",
                        "明るい場所で撮影", 
                        "顔全体が写るように",
                        "メイクありでもOK"
                      ].map((tip, index) => (
                        <motion.div
                          key={tip}
                          className="flex items-center gap-3 text-sm text-teal-800"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                        >
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          {tip}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Region Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🌍 メイクスタイル
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region, index) => (
                    <motion.button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 ${
                        selectedRegion === region.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl mb-2">{region.flag}</div>
                      <div className="font-medium text-sm">{region.name}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-14 rounded-xl border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 shadow-lg"
              onClick={() => {
                // TODO: Implement gallery selection
              }}
            >
              <ImageIcon className="mr-3 w-5 h-5" />
              <span className="font-semibold">過去の写真から選択</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}