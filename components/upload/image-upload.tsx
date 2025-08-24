'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Camera, 
  X, 
  Check, 
  AlertCircle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { validateImageFile, processImage, createImagePreview, getImageMetadata } from '@/lib/image-utils'
import { useToast } from '../../hooks/use-toast'

export interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  maxSize?: number
  className?: string
}

interface UploadedImage {
  file: File
  preview: string
  metadata?: {
    width: number
    height: number
    size: number
    type: string
  }
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const processAndSetImage = async (file: File) => {
    setProcessing(true)
    setUploadProgress(0)

    try {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast({
          variant: 'destructive',
          title: 'ファイルエラー',
          description: validation.error,
        })
        return
      }

      setUploadProgress(25)

      // Get metadata
      const metadata = await getImageMetadata(file)
      setUploadProgress(50)

      // Process image (resize/compress if needed)
      const processedFile = await processImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        format: 'jpeg'
      })
      setUploadProgress(75)

      // Create preview
      const preview = createImagePreview(processedFile)
      
      const imageData: UploadedImage = {
        file: processedFile,
        preview,
        metadata
      }

      setUploadedImage(imageData)
      onImageSelect(processedFile)
      setUploadProgress(100)

      toast({
        title: '画像アップロード完了',
        description: '画像が正常にアップロードされました',
      })

    } catch (error) {
      console.error('Image processing error:', error)
      toast({
        variant: 'destructive',
        title: '画像処理エラー',
        description: '画像の処理中にエラーが発生しました',
      })
    } finally {
      setProcessing(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleImageRemove = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.preview)
      setUploadedImage(null)
      onImageRemove()
      
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processAndSetImage(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize,
    disabled: processing
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processAndSetImage(file)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processAndSetImage(file)
    }
  }

  if (uploadedImage) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div className="relative">
          <img
            src={uploadedImage.preview}
            alt="アップロードされた画像"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleImageRemove}
              className="mr-2"
            >
              <X className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center text-green-600 mb-2">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">アップロード完了</span>
          </div>
          
          {uploadedImage.metadata && (
            <div className="text-xs text-gray-500 space-y-1">
              <div>サイズ: {uploadedImage.metadata.width} × {uploadedImage.metadata.height}</div>
              <div>ファイルサイズ: {(uploadedImage.metadata.size / 1024 / 1024).toFixed(2)} MB</div>
              <div>形式: {uploadedImage.metadata.type}</div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Drag & Drop Area */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-pink-400 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
          }
          ${processing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {processing ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  画像を処理中...
                </p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-pink-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive 
                    ? 'ここに画像をドロップしてください' 
                    : '画像をドラッグ&ドロップまたはクリックしてアップロード'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, WebP形式 (最大5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={processing}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            ファイルを選択
          </Button>
        </div>

        <div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleCameraCapture}
            className="hidden"
            disabled={processing}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => cameraInputRef.current?.click()}
            disabled={processing}
          >
            <Camera className="h-4 w-4 mr-2" />
            カメラで撮影
          </Button>
        </div>
      </div>

      {/* Tips */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">📸 撮影のポイント</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 正面を向いて撮影してください</li>
                <li>• 明るい場所で撮影してください</li>
                <li>• 顔全体が写るように撮影してください</li>
                <li>• メイクの有無は問いません</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}