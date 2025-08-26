'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  RotateCcw, 
  X, 
  Check,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onCancel: () => void
  className?: string
}

type CameraState = 'idle' | 'initializing' | 'ready' | 'capturing' | 'captured' | 'error'

interface CameraError {
  name: string
  message: string
  constraint?: string
}

export function CameraCapture({ onCapture, onCancel, className = '' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [state, setState] = useState<CameraState>('idle')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<CameraError | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<{
    hasMultipleCameras: boolean
    deviceLabel: string
  }>({ hasMultipleCameras: false, deviceLabel: '' })

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setState('initializing')
    setError(null)

    try {
      // Check if camera access is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this device')
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      setDeviceInfo({
        hasMultipleCameras: videoDevices.length > 1,
        deviceLabel: videoDevices.find(d => d.label)?.label || 'Camera'
      })

      // Request camera access with preferred settings
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setState('ready')
        }
        await videoRef.current.play()
      }

    } catch (err: any) {
      console.error('Camera initialization error:', err)
      
      const cameraError: CameraError = {
        name: err.name || 'CameraError',
        message: getCameraErrorMessage(err),
        constraint: err.constraint
      }
      
      setError(cameraError)
      setState('error')
    }
  }, [facingMode])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setState('idle')
  }, [])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || state !== 'ready') return

    setState('capturing')

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(capturedImageUrl)
        setState('captured')
      }
    }, 'image/jpeg', 0.9)
  }, [state])

  // Confirm captured photo
  const confirmCapture = useCallback(() => {
    if (!canvasRef.current || !capturedImage) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `makeup-ai-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        
        stopCamera()
        onCapture(file)
      }
    }, 'image/jpeg', 0.9)
  }, [capturedImage, stopCamera, onCapture])

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setState('ready')
  }, [])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    
    if (streamRef.current) {
      stopCamera()
      // Re-initialize with new facing mode
      setTimeout(() => initializeCamera(), 100)
    }
  }, [facingMode, stopCamera, initializeCamera])

  // Download captured image (for testing)
  const downloadImage = useCallback(() => {
    if (capturedImage) {
      const link = document.createElement('a')
      link.href = capturedImage
      link.download = `makeup-ai-capture-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [capturedImage])

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera()
    
    return () => {
      stopCamera()
    }
  }, [initializeCamera, stopCamera])

  // Helper function to get user-friendly error messages
  const getCameraErrorMessage = (error: any): string => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'カメラへのアクセスが許可されていません。設定からカメラの使用を許可してください。'
      case 'NotFoundError':
        return 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。'
      case 'NotSupportedError':
        return 'このブラウザではカメラ機能がサポートされていません。'
      case 'NotReadableError':
        return 'カメラが他のアプリケーションで使用中です。他のアプリを閉じて再度お試しください。'
      case 'OverconstrainedError':
        return 'カメラの設定に問題があります。別のカメラをお試しください。'
      case 'SecurityError':
        return 'セキュリティ上の理由でカメラにアクセスできません。HTTPSでアクセスしてください。'
      case 'TypeError':
        return 'カメラの設定が無効です。ブラウザを更新してお試しください。'
      default:
        return error.message || 'カメラの初期化中にエラーが発生しました。'
    }
  }

  const handleCancel = useCallback(() => {
    stopCamera()
    onCancel()
  }, [stopCamera, onCancel])

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Camera View */}
          <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
            {state === 'captured' && capturedImage ? (
              // Show captured image
              <img
                src={capturedImage}
                alt="Captured"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              // Show video stream
              <video
                ref={videoRef}
                className={`max-w-full max-h-full object-contain ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
                playsInline
                muted
              />
            )}

            {/* Loading overlay */}
            {state === 'initializing' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">カメラを初期化中...</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {state === 'error' && error && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                <div className="text-center text-white max-w-sm">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="font-semibold mb-2">カメラエラー</h3>
                  <p className="text-sm mb-4">{error.message}</p>
                  <Button
                    onClick={initializeCamera}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再試行
                  </Button>
                </div>
              </div>
            )}

            {/* Camera info badge */}
            {state === 'ready' && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-black bg-opacity-50 text-white">
                  {facingMode === 'user' ? '前面カメラ' : '背面カメラ'}
                </Badge>
              </div>
            )}

            {/* Capture indicator */}
            {state === 'capturing' && (
              <div className="absolute inset-0 bg-white opacity-50 animate-pulse" />
            )}
          </div>

          {/* Control buttons */}
          <div className="p-4 bg-gray-50">
            {state === 'captured' ? (
              // Captured state controls
              <div className="flex items-center justify-between">
                <Button onClick={retakePhoto} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  撮り直す
                </Button>
                
                <div className="flex gap-2">
                  <Button onClick={downloadImage} variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button onClick={confirmCapture} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    使用する
                  </Button>
                </div>
              </div>
            ) : (
              // Camera controls
              <div className="flex items-center justify-between">
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  キャンセル
                </Button>

                <div className="flex items-center gap-2">
                  {deviceInfo.hasMultipleCameras && state === 'ready' && (
                    <Button onClick={switchCamera} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={capturePhoto}
                    disabled={state !== 'ready'}
                    size="lg"
                    className="bg-pink-600 hover:bg-pink-700 px-8"
                  >
                    {state === 'capturing' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        撮影
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Device info */}
            {deviceInfo.deviceLabel && (
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">{deviceInfo.deviceLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={1280}
          height={720}
        />
      </CardContent>
    </Card>
  )
}