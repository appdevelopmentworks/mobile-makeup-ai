// Face analysis using MediaPipe
import { FaceDetection, Results as FaceDetectionResults } from '@mediapipe/face_detection'
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

export interface FaceAnalysisResult {
  faceDetected: boolean
  confidence: number
  boundingBox?: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
  keypoints?: Array<{
    x: number
    y: number
    z?: number
  }>
  faceShape?: 'round' | 'oval' | 'square' | 'heart' | 'oblong'
  skinTone?: 'light' | 'medium' | 'dark' | 'deep'
  features?: {
    eyeShape: 'almond' | 'round' | 'hooded' | 'monolid'
    lipShape: 'full' | 'thin' | 'wide' | 'narrow'
    faceWidth: number
    faceHeight: number
  }
}

export class FaceAnalyzer {
  private faceDetection: FaceDetection | null = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      this.faceDetection = new FaceDetection({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        }
      })

      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      })

      this.faceDetection.onResults(this.onResults.bind(this))
      this.initialized = true

      console.log('MediaPipe Face Detection initialized')
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error)
      throw error
    }
  }

  private onResults(results: FaceDetectionResults) {
    // This will be called by MediaPipe when detection is complete
    this.lastResults = results
  }

  private lastResults: FaceDetectionResults | null = null

  async analyzeImage(imageElement: HTMLImageElement): Promise<FaceAnalysisResult> {
    if (!this.initialized || !this.faceDetection) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      if (!this.faceDetection) {
        reject(new Error('Face detection not initialized'))
        return
      }

      // Create canvas for processing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      canvas.width = imageElement.naturalWidth
      canvas.height = imageElement.naturalHeight
      ctx.drawImage(imageElement, 0, 0)

      // Process with MediaPipe
      this.faceDetection.send({ image: canvas }).then(() => {
        // Wait a bit for results
        setTimeout(() => {
          if (this.lastResults && this.lastResults.detections.length > 0) {
            const result: FaceAnalysisResult = {
              faceDetected: true,
              confidence: 0.95, // Use mock data for now
              boundingBox: {
                xMin: 0.2,
                yMin: 0.1,
                width: 0.6,
                height: 0.8
              }
            }

            // Add additional analysis
            this.analyzeFaceFeatures(canvas, result.boundingBox!, result)
            resolve(result)
          } else {
            resolve({
              faceDetected: false,
              confidence: 0
            })
          }
        }, 500)
      }).catch(reject)
    })
  }

  private analyzeFaceFeatures(
    canvas: HTMLCanvasElement, 
    boundingBox: any, 
    result: FaceAnalysisResult
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Extract face region
    const faceX = boundingBox.xMin * canvas.width
    const faceY = boundingBox.yMin * canvas.height
    const faceWidth = boundingBox.width * canvas.width
    const faceHeight = boundingBox.height * canvas.height

    // Analyze face shape
    const aspectRatio = faceWidth / faceHeight
    if (aspectRatio > 0.9) {
      result.faceShape = 'round'
    } else if (aspectRatio > 0.75) {
      result.faceShape = 'oval'
    } else if (aspectRatio > 0.6) {
      result.faceShape = 'oblong'
    } else {
      result.faceShape = 'heart'
    }

    // Analyze skin tone (simplified)
    const imageData = ctx.getImageData(faceX, faceY, faceWidth, faceHeight)
    const skinTone = this.analyzeSkinTone(imageData)
    result.skinTone = skinTone

    // Store basic measurements
    result.features = {
      eyeShape: 'almond', // Default, would need more sophisticated analysis
      lipShape: 'full',   // Default, would need more sophisticated analysis
      faceWidth,
      faceHeight
    }
  }

  private analyzeSkinTone(imageData: ImageData): 'light' | 'medium' | 'dark' | 'deep' {
    const data = imageData.data
    let totalR = 0, totalG = 0, totalB = 0
    let pixelCount = 0

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      totalR += data[i]
      totalG += data[i + 1]
      totalB += data[i + 2]
      pixelCount++
    }

    const avgR = totalR / pixelCount
    const avgG = totalG / pixelCount
    const avgB = totalB / pixelCount

    // Simple brightness-based classification
    const brightness = (avgR + avgG + avgB) / 3

    if (brightness > 180) return 'light'
    if (brightness > 140) return 'medium'
    if (brightness > 100) return 'dark'
    return 'deep'
  }

  // Create analysis result with mock data for development
  createMockAnalysis(): FaceAnalysisResult {
    return {
      faceDetected: true,
      confidence: 0.95,
      boundingBox: {
        xMin: 0.2,
        yMin: 0.1,
        width: 0.6,
        height: 0.8
      },
      faceShape: 'oval',
      skinTone: 'medium',
      features: {
        eyeShape: 'almond',
        lipShape: 'full',
        faceWidth: 300,
        faceHeight: 400
      }
    }
  }
}

// Singleton instance
export const faceAnalyzer = new FaceAnalyzer()