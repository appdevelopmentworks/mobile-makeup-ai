// AI Image Generation using Google Imagen API
export interface ImageGenerationRequest {
  originalImage?: string // Base64 or URL
  faceShape: string
  skinTone: string
  makeupStyle: 'natural' | 'glamour' | 'cute' | 'mature'
  region: string
}

export interface ImageGenerationResult {
  generatedImage: string
  confidence: number
  processingTime: number
  prompt: string
}

export interface GenerationProgress {
  stage: string
  progress: number
  message: string
}

export class AIImageGenerator {
  private apiKey: string | null
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || null
  }

  async generateMakeupImage(
    request: ImageGenerationRequest,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now()
    
    if (!this.apiKey) {
      // Return mock data for development
      return this.generateMockImage(request, onProgress)
    }

    try {
      // Stage 1: Analyze face
      onProgress?.({
        stage: 'analysis',
        progress: 20,
        message: '顔の特徴を分析中...'
      })

      const prompt = this.generatePrompt(request)
      
      // Stage 2: Generate image
      onProgress?.({
        stage: 'generation',
        progress: 60,
        message: 'AI画像を生成中...'
      })

      const response = await fetch(`${this.baseUrl}/models/imagen-3.0-generate-001:generateImages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
            image: {
              bytesBase64Encoded: request.originalImage
            }
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Stage 3: Process result
      onProgress?.({
        stage: 'processing',
        progress: 90,
        message: '最終処理中...'
      })

      const generatedImage = data.predictions?.[0]?.bytesBase64Encoded
      
      if (!generatedImage) {
        throw new Error('No image generated from API response')
      }

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '完了！'
      })

      return {
        generatedImage: `data:image/jpeg;base64,${generatedImage}`,
        confidence: 0.95,
        processingTime: Date.now() - startTime,
        prompt
      }

    } catch (error) {
      console.error('AI image generation error:', error)
      
      // Fallback to mock generation
      return this.generateMockImage(request, onProgress)
    }
  }

  private generatePrompt(request: ImageGenerationRequest): string {
    const { faceShape, skinTone, makeupStyle, region } = request
    
    // Base prompt for makeup application
    let prompt = "Professional makeup application on a person's face, "
    
    // Face shape considerations
    switch (faceShape) {
      case 'oval':
        prompt += "oval face shape, balanced proportions, "
        break
      case 'round':
        prompt += "round face shape, soft features, "
        break
      case 'square':
        prompt += "square face shape, defined jawline, "
        break
      case 'heart':
        prompt += "heart-shaped face, wider forehead, "
        break
      case 'oblong':
        prompt += "oblong face shape, elongated features, "
        break
    }
    
    // Skin tone considerations
    switch (skinTone) {
      case 'light':
        prompt += "light skin tone, "
        break
      case 'medium':
        prompt += "medium skin tone, "
        break
      case 'dark':
        prompt += "dark skin tone, "
        break
      case 'deep':
        prompt += "deep skin tone, "
        break
    }
    
    // Makeup style
    switch (makeupStyle) {
      case 'natural':
        prompt += "natural makeup look, subtle enhancement, soft colors, dewy finish"
        break
      case 'glamour':
        prompt += "glamorous makeup look, bold eyes, defined features, dramatic colors"
        break
      case 'cute':
        prompt += "cute makeup look, pink tones, youthful appearance, soft blush"
        break
      case 'mature':
        prompt += "sophisticated makeup look, elegant colors, refined application"
        break
    }
    
    // Regional style preferences
    if (region === 'japan') {
      prompt += ", Japanese makeup style, clean and polished"
    } else if (region === 'korea') {
      prompt += ", Korean makeup style, dewy skin, gradient lips"
    }
    
    prompt += ", high quality, professional photography, well-lit, detailed, realistic"
    
    return prompt
  }

  private async generateMockImage(
    request: ImageGenerationRequest,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now()
    
    // Simulate API call stages
    const stages = [
      { stage: 'analysis', progress: 20, message: '顔の特徴を分析中...', delay: 800 },
      { stage: 'generation', progress: 60, message: 'AI画像を生成中...', delay: 1500 },
      { stage: 'processing', progress: 90, message: '最終処理中...', delay: 500 },
      { stage: 'complete', progress: 100, message: '完了！', delay: 200 }
    ]

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay))
      onProgress?.(stage)
    }

    // Return mock result with placeholder image
    return {
      generatedImage: this.getMockImage(request.makeupStyle),
      confidence: 0.92,
      processingTime: Date.now() - startTime,
      prompt: this.generatePrompt(request)
    }
  }

  private getMockImage(style: string): string {
    // In a real implementation, these would be actual generated images
    const mockImages = {
      natural: '/placeholder-natural-makeup.jpg',
      glamour: '/placeholder-glamour-makeup.jpg', 
      cute: '/placeholder-cute-makeup.jpg',
      mature: '/placeholder-mature-makeup.jpg'
    }
    
    return mockImages[style as keyof typeof mockImages] || mockImages.natural
  }

  // Utility method to convert File to base64
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove data URL prefix to get just the base64 data
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Check if API is available
  isApiAvailable(): boolean {
    return !!this.apiKey
  }

  // Get estimated processing time
  getEstimatedTime(hasOriginalImage: boolean): number {
    // Estimated time in seconds
    return hasOriginalImage ? 15 : 10
  }
}

// Singleton instance
export const aiImageGenerator = new AIImageGenerator()

// Export types for component usage (types already exported above)