// Image validation and processing utilities
export interface ImageValidationResult {
  valid: boolean
  error?: string
  file?: File
}

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

// Validate image file
export function validateImageFile(file: File): ImageValidationResult {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'サポートされていないファイル形式です。JPEG、PNG、WebPファイルをアップロードしてください。'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'ファイルサイズが大きすぎます。5MB以下のファイルをアップロードしてください。'
    }
  }

  return {
    valid: true,
    file
  }
}

// Resize and compress image
export function processImage(
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
      format = 'jpeg'
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              })
              resolve(processedFile)
            } else {
              reject(new Error('画像処理に失敗しました'))
            }
          },
          `image/${format}`,
          quality
        )
      } else {
        reject(new Error('Canvas context could not be created'))
      }
    }

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Create image preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// Clean up preview URL
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}

// Extract image metadata
export function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type
      })
    }

    img.onerror = () => {
      reject(new Error('画像メタデータの取得に失敗しました'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Check if image contains a face (basic detection)
export function detectFaceInImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve(false)
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Simple heuristic: check image dimensions and aspect ratio
      // For more accurate face detection, we'll use MediaPipe in the analysis phase
      const aspectRatio = img.width / img.height
      const isPortrait = aspectRatio >= 0.5 && aspectRatio <= 2.0
      const isReasonableSize = img.width >= 200 && img.height >= 200

      resolve(isPortrait && isReasonableSize)
    }

    img.onerror = () => {
      resolve(false)
    }

    img.src = URL.createObjectURL(file)
  })
}