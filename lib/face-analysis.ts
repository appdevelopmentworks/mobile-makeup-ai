// Face analysis with MediaPipe fallback to image analysis
import { FaceDetection, Results as FaceDetectionResults } from '@mediapipe/face_detection'

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
      console.log('Initializing MediaPipe Face Detection...')
      
      this.faceDetection = new FaceDetection({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        }
      })

      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
        selfieMode: false
      })

      this.faceDetection.onResults(this.onResults.bind(this))
      
      // Wait for MediaPipe to fully initialize
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('MediaPipe initialization timeout'))
        }, 10000) // 10 second timeout

        // Test initialization by processing a small canvas
        const testCanvas = document.createElement('canvas')
        testCanvas.width = 100
        testCanvas.height = 100
        const ctx = testCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#f0f0f0'
          ctx.fillRect(0, 0, 100, 100)
        }

        this.faceDetection?.send({ image: testCanvas }).then(() => {
          clearTimeout(timeout)
          this.initialized = true
          console.log('MediaPipe Face Detection initialized successfully')
          resolve()
        }).catch((error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })

    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error)
      // Don't throw - allow fallback to basic analysis
      this.initialized = false
    }
  }

  private onResults(results: FaceDetectionResults) {
    // This will be called by MediaPipe when detection is complete
    this.lastResults = results
  }

  private lastResults: FaceDetectionResults | null = null

  async analyzeImage(imageElement: HTMLImageElement): Promise<FaceAnalysisResult> {
    try {
      // Try MediaPipe first, fallback to basic analysis
      if (this.initialized && this.faceDetection) {
        return await this.analyzeWithMediaPipe(imageElement)
      } else {
        // Fallback to basic image analysis
        console.log('Using fallback face analysis (no MediaPipe)')
        return await this.analyzeWithFallback(imageElement)
      }
    } catch (error) {
      console.warn('MediaPipe analysis failed, using fallback:', error)
      return await this.analyzeWithFallback(imageElement)
    }
  }

  private async analyzeWithMediaPipe(imageElement: HTMLImageElement): Promise<FaceAnalysisResult> {
    return new Promise((resolve, reject) => {
      if (!this.faceDetection) {
        reject(new Error('Face detection not initialized'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      canvas.width = imageElement.naturalWidth
      canvas.height = imageElement.naturalHeight
      ctx.drawImage(imageElement, 0, 0)

      // Set up result listener
      const resultHandler = (results: FaceDetectionResults) => {
        try {
          if (results.detections && results.detections.length > 0) {
            const detection = results.detections[0]
            
            // Get bounding box with proper type handling
            const boundingBox = detection.boundingBox || {
              xMin: 0.2,
              yMin: 0.1,
              width: 0.6,
              height: 0.8
            }

            const result: FaceAnalysisResult = {
              faceDetected: true,
              confidence: Math.max(0.7, Math.min(0.99, detection.score || 0.85)),
              boundingBox: {
                xMin: boundingBox.xMin,
                yMin: boundingBox.yMin,
                width: boundingBox.width,
                height: boundingBox.height
              },
              keypoints: detection.landmarks || []
            }

            this.analyzeFaceFeatures(canvas, result.boundingBox!, result)
            resolve(result)
          } else {
            // No face detected
            resolve({
              faceDetected: false,
              confidence: 0
            })
          }
        } catch (error) {
          console.error('Error processing MediaPipe results:', error)
          // Fallback on processing error
          this.analyzeWithFallback(imageElement).then(resolve).catch(reject)
        }
      }

      // Temporarily override the onResults handler
      this.faceDetection.onResults(resultHandler)

      this.faceDetection.send({ image: canvas }).catch((error) => {
        console.error('MediaPipe send error:', error)
        // Fallback on send error
        this.analyzeWithFallback(imageElement).then(resolve).catch(reject)
      })
    })
  }

  private async analyzeWithFallback(imageElement: HTMLImageElement): Promise<FaceAnalysisResult> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not create canvas context')
    }

    canvas.width = imageElement.naturalWidth
    canvas.height = imageElement.naturalHeight
    ctx.drawImage(imageElement, 0, 0)

    // Basic image analysis for face-like properties
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasFaceProperties = this.detectFaceProperties(imageData, canvas.width, canvas.height)

    if (hasFaceProperties.detected) {
      const result: FaceAnalysisResult = {
        faceDetected: true,
        confidence: hasFaceProperties.confidence,
        boundingBox: {
          xMin: 0.15,
          yMin: 0.1,
          width: 0.7,
          height: 0.8
        }
      }

      this.analyzeFaceFeatures(canvas, result.boundingBox!, result)
      return result
    }

    return {
      faceDetected: false,
      confidence: 0
    }
  }

  private detectFaceProperties(imageData: ImageData, width: number, height: number): { detected: boolean, confidence: number } {
    // Simple heuristics for face detection
    const data = imageData.data
    let skinColorPixels = 0
    let totalPixels = 0
    let centerBrightness = 0
    let edgeBrightness = 0

    // Analyze center region (where face would be)
    const centerX = width / 2
    const centerY = height / 2
    const regionSize = Math.min(width, height) / 4

    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const index = (y * width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        
        totalPixels++
        
        // Check if pixel looks like skin tone
        if (this.isSkinTone(r, g, b)) {
          skinColorPixels++
        }

        // Measure brightness in center vs edges
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const brightness = (r + g + b) / 3
        
        if (distFromCenter < regionSize) {
          centerBrightness += brightness
        } else if (distFromCenter > regionSize * 2) {
          edgeBrightness += brightness
        }
      }
    }

    const skinRatio = skinColorPixels / totalPixels
    const aspectRatio = width / height
    
    // Face detection heuristics
    const hasSkinTone = skinRatio > 0.15 && skinRatio < 0.8
    const goodAspectRatio = aspectRatio > 0.5 && aspectRatio < 2.0
    const reasonableSize = width > 200 && height > 200
    const centerBrighter = centerBrightness > edgeBrightness * 0.8

    const confidence = (
      (hasSkinTone ? 0.3 : 0) +
      (goodAspectRatio ? 0.2 : 0) +
      (reasonableSize ? 0.2 : 0) +
      (centerBrighter ? 0.3 : 0)
    )

    return {
      detected: confidence > 0.6,
      confidence: Math.min(0.95, confidence)
    }
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Simple skin tone detection based on RGB values
    const skinMin = [95, 40, 20]
    const skinMax = [255, 220, 170]
    
    return r >= skinMin[0] && r <= skinMax[0] &&
           g >= skinMin[1] && g <= skinMax[1] &&
           b >= skinMin[2] && b <= skinMax[2] &&
           r > g && g > b // Typical skin tone characteristic
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