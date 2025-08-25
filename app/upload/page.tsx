'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/components/providers/auth-provider'
import { Camera, Upload, Info } from 'lucide-react'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('japan')

  const regions = [
    { id: 'japan', name: '日本', active: true },
    { id: 'korea', name: '韓国', active: false },
    { id: 'western', name: '欧米', active: false },
    { id: 'china', name: '中国', active: false },
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold">写真をアップロード</h1>
          <p className="text-pink-100 text-sm mt-1">正面から撮影してください</p>
        </motion.div>

        {/* Content */}
        <div className="p-4 pb-24 space-y-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-300 transition-colors cursor-pointer p-8"
            onClick={handleImageCapture}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                タップして撮影
              </h2>
              <p className="text-gray-500 text-sm">
                または写真を選択
              </p>
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-teal-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-teal-900 mb-2">📝 撮影のポイント</h3>
                    <ul className="text-sm text-teal-800 space-y-1">
                      <li>• 正面を向いて撮影</li>
                      <li>• 明るい場所で撮影</li>
                      <li>• 顔全体が写るように</li>
                      <li>• メイクありでもOK</li>
                    </ul>
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
            <h3 className="font-semibold text-gray-900 mb-3">メイクスタイル</h3>
            <div className="flex gap-2 flex-wrap">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === region.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Alternative Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-2"
              onClick={() => {
                // TODO: Implement gallery selection
              }}
            >
              <Upload className="mr-2 w-4 h-4" />
              過去の写真から選択
            </Button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}