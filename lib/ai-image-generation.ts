// Enhanced AI Image Generation with multiple providers
import { FaceAnalysisResult } from './face-analysis'
import { MakeupPlan } from './makeup-suggestions'

export interface ImageGenerationOptions {
  style: 'natural' | 'glamorous' | 'bold' | 'vintage' | 'korean' | 'western'
  occasion: 'daily' | 'business' | 'party' | 'date' | 'wedding'
  quality: 'standard' | 'hd' | 'premium'
  aspectRatio: '1:1' | '3:4' | '16:9'
  engine?: 'google-imagen' | 'openai-dalle' | 'auto'
}

export interface ImageGenerationRequest {
  originalImage?: string // Base64 or URL
  faceShape: string
  skinTone: string
  makeupStyle: 'natural' | 'glamour' | 'cute' | 'mature'
  region: string
  analysisResult?: FaceAnalysisResult
  makeupPlan?: MakeupPlan
  options?: ImageGenerationOptions
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  engine: 'google-imagen' | 'openai-dalle' | 'mock'
  quality: string
  generatedAt: string
  metadata?: {
    seed?: number
    steps?: number
    guidance?: number
  }
}

export interface ImageGenerationResult {
  success: boolean
  generatedImage?: string // Legacy support
  images: GeneratedImage[]
  confidence: number
  processingTime: number
  prompt: string
  error?: string
}

export interface GenerationProgress {
  stage: string
  progress: number
  message: string
}

export class AIImageGenerator {
  private googleApiKey: string | null
  private openaiApiKey: string | null
  private googleBaseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  private openaiBaseUrl = 'https://api.openai.com/v1'

  constructor() {
    this.googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || null
    this.openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null
  }

  async generateMakeupImage(
    request: ImageGenerationRequest,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now()
    const options = request.options || {
      style: 'natural',
      occasion: 'daily',
      quality: 'standard',
      aspectRatio: '1:1'
    }

    try {
      // Stage 1: Analyze and prepare
      onProgress?.({
        stage: 'analysis',
        progress: 20,
        message: '分析結果を準備中...'
      })

      const prompt = request.analysisResult && request.makeupPlan 
        ? this.createEnhancedPrompt(request.analysisResult, request.makeupPlan, options)
        : this.generatePrompt(request)

      // Stage 2: Choose generation engine
      const preferredEngine = options.engine || 'auto'
      let result: ImageGenerationResult

      onProgress?.({
        stage: 'generation',
        progress: 40,
        message: 'AI画像を生成中...'
      })

      // Try engines in order of preference
      if (preferredEngine === 'google-imagen' && this.googleApiKey) {
        result = await this.generateWithGoogleImagen(request, prompt, options, onProgress)
      } else if (preferredEngine === 'openai-dalle' && this.openaiApiKey) {
        result = await this.generateWithOpenAI(request, prompt, options, onProgress)
      } else {
        // Auto mode: try Google first, then OpenAI, then mock
        if (this.googleApiKey) {
          result = await this.generateWithGoogleImagen(request, prompt, options, onProgress)
        } else if (this.openaiApiKey) {
          result = await this.generateWithOpenAI(request, prompt, options, onProgress)
        } else {
          result = await this.generateMockImage(request, onProgress)
        }
      }

      // If preferred engine fails, try fallback
      if (!result.success && preferredEngine !== 'auto') {
        if (this.googleApiKey && preferredEngine !== 'google-imagen') {
          result = await this.generateWithGoogleImagen(request, prompt, options, onProgress)
        } else if (this.openaiApiKey && preferredEngine !== 'openai-dalle') {
          result = await this.generateWithOpenAI(request, prompt, options, onProgress)
        } else {
          result = await this.generateMockImage(request, onProgress)
        }
      }

      result.processingTime = Date.now() - startTime
      
      // Legacy support
      if (result.success && result.images.length > 0) {
        result.generatedImage = result.images[0].url
      }

      return result

    } catch (error) {
      console.error('AI image generation error:', error)
      
      // Final fallback
      const fallback = await this.generateMockImage(request, onProgress)
      fallback.processingTime = Date.now() - startTime
      return fallback
    }
  }

  private async generateWithGoogleImagen(
    request: ImageGenerationRequest,
    prompt: string,
    options: ImageGenerationOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    try {
      onProgress?.({
        stage: 'generation',
        progress: 60,
        message: 'Google Imagen で生成中...'
      })

      const response = await fetch(`${this.googleBaseUrl}/models/imagen-3.0-generate-001:generateImages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.googleApiKey}`
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
            image: request.originalImage ? {
              bytesBase64Encoded: request.originalImage.split(',')[1] || request.originalImage
            } : undefined
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: options.aspectRatio || "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`)
      }

      const data = await response.json()
      const generatedImage = data.predictions?.[0]?.bytesBase64Encoded

      if (!generatedImage) {
        throw new Error('No image in Google API response')
      }

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '完了！'
      })

      return {
        success: true,
        images: [{
          id: `google-${Date.now()}`,
          url: `data:image/jpeg;base64,${generatedImage}`,
          prompt,
          engine: 'google-imagen',
          quality: options.quality,
          generatedAt: new Date().toISOString()
        }],
        confidence: 0.95,
        processingTime: 0,
        prompt
      }
    } catch (error) {
      console.error('Google Imagen generation failed:', error)
      return {
        success: false,
        images: [],
        confidence: 0,
        processingTime: 0,
        prompt,
        error: 'Google Imagen generation failed'
      }
    }
  }

  private async generateWithOpenAI(
    _request: ImageGenerationRequest,
    prompt: string,
    options: ImageGenerationOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<ImageGenerationResult> {
    try {
      onProgress?.({
        stage: 'generation',
        progress: 60,
        message: 'DALL-E で生成中...'
      })

      const size = options.quality === 'premium' ? '1024x1024' : '512x512'
      
      const response = await fetch(`${this.openaiBaseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: size,
          response_format: 'url'
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0) {
        throw new Error('No image in OpenAI API response')
      }

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '完了！'
      })

      return {
        success: true,
        images: data.data.map((item: any, index: number) => ({
          id: `openai-${Date.now()}-${index}`,
          url: item.url,
          prompt,
          engine: 'openai-dalle' as const,
          quality: options.quality,
          generatedAt: new Date().toISOString()
        })),
        confidence: 0.90,
        processingTime: 0,
        prompt
      }
    } catch (error) {
      console.error('OpenAI DALL-E generation failed:', error)
      return {
        success: false,
        images: [],
        confidence: 0,
        processingTime: 0,
        prompt,
        error: 'OpenAI DALL-E generation failed'
      }
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

  // Enhanced prompt creation using analysis result and makeup plan
  private createEnhancedPrompt(
    analysisResult: FaceAnalysisResult,
    makeupPlan: MakeupPlan,
    options: ImageGenerationOptions
  ): string {
    const { style, occasion } = options
    
    // Base description
    let prompt = 'A professional high-quality portrait of a person with '

    // Face shape
    const faceShapeMap = {
      oval: 'oval face shape',
      round: 'round face shape',
      square: 'square face shape with defined jawline',
      heart: 'heart-shaped face with wider forehead',
      oblong: 'oblong face shape'
    }
    prompt += faceShapeMap[analysisResult.faceShape || 'oval'] + ', '

    // Skin tone
    const skinToneMap = {
      light: 'fair complexion',
      medium: 'medium skin tone',
      dark: 'olive complexion',
      deep: 'rich deep skin tone'
    }
    prompt += skinToneMap[analysisResult.skinTone || 'medium'] + ', '

    // Style-specific makeup description
    const styleDescriptions = {
      natural: 'natural everyday makeup with subtle enhancement, soft tones, minimal contouring',
      glamorous: 'glamorous makeup with dramatic eyes, bold lashes, highlighted cheekbones, perfect contouring',
      bold: 'bold and vibrant makeup with striking colors, strong eye makeup, defined lips',
      vintage: 'vintage-inspired makeup with winged eyeliner, red lips, classic Hollywood glamour',
      korean: 'Korean beauty style with dewy skin, gradient lips, straight brows, soft aegyo sal',
      western: 'Western beauty standards with sculpted features, bronzed skin, defined eyebrows'
    }

    prompt += styleDescriptions[style] + ', '

    // Occasion-specific details
    const occasionDetails = {
      daily: 'suitable for everyday wear, fresh and approachable',
      business: 'professional and polished, appropriate for workplace',
      party: 'party-ready with extra glamour and sparkle',
      date: 'romantic and alluring, perfect for date night',
      wedding: 'bridal makeup that is timeless and photograph-ready'
    }

    prompt += occasionDetails[occasion] + ', '

    // Add makeup plan specifics if available
    if (makeupPlan && makeupPlan.suggestions.length > 0) {
      const makeupDetails = makeupPlan.suggestions.map(suggestion => {
        if (suggestion.category === 'foundation') {
          return 'flawless base makeup'
        } else if (suggestion.category === 'eyes') {
          return 'beautifully defined eyes'
        } else if (suggestion.category === 'lips') {
          return 'perfectly shaped lips'
        } else if (suggestion.category === 'cheeks') {
          return 'naturally flushed cheeks'
        }
        return ''
      }).filter(Boolean).join(', ')

      if (makeupDetails) {
        prompt += makeupDetails + ', '
      }
    }

    // Technical specifications
    prompt += 'professional photography, studio lighting, high resolution, beauty photography, looking directly at camera, neutral background, photorealistic'

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

    // Create a simple colored rectangle as a placeholder
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Create a gradient background based on makeup style
      const styleColors = {
        natural: ['#ffb3ba', '#bae1ff'],
        glamour: ['#ff6b6b', '#feca57'],
        cute: ['#ff9ff3', '#54a0ff'],
        mature: ['#5f27cd', '#341f97']
      }

      const colors = styleColors[request.makeupStyle as keyof typeof styleColors] || styleColors.natural
      const gradient = ctx.createLinearGradient(0, 0, 512, 512)
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1])

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)

      // Add some text
      ctx.fillStyle = 'white'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('AI Generated Makeup', 256, 220)
      ctx.fillText(`Style: ${request.makeupStyle}`, 256, 260)
      ctx.fillText(`Region: ${request.region}`, 256, 300)
    }

    // Return mock result with enhanced structure
    return {
      success: true,
      generatedImage: canvas.toDataURL('image/png'), // Legacy support
      images: [{
        id: `mock-${Date.now()}`,
        url: canvas.toDataURL('image/png'),
        prompt: request.analysisResult && request.makeupPlan 
          ? this.createEnhancedPrompt(request.analysisResult, request.makeupPlan, request.options || {
              style: 'natural',
              occasion: 'daily',
              quality: 'standard',
              aspectRatio: '1:1'
            })
          : this.generatePrompt(request),
        engine: 'mock',
        quality: request.options?.quality || 'standard',
        generatedAt: new Date().toISOString(),
        metadata: {
          seed: Math.floor(Math.random() * 10000),
          steps: 30,
          guidance: 7.5
        }
      }],
      confidence: 0.92,
      processingTime: Date.now() - startTime,
      prompt: this.generatePrompt(request)
    }
  }

  private getMockImage(_style: string): string {
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

  // Get available engines based on API key configuration
  getAvailableEngines(): Array<'google-imagen' | 'openai-dalle' | 'mock'> {
    const engines: Array<'google-imagen' | 'openai-dalle' | 'mock'> = []
    
    if (this.googleApiKey) engines.push('google-imagen')
    if (this.openaiApiKey) engines.push('openai-dalle')
    engines.push('mock') // Always available for demo

    return engines
  }

  // Check if any real AI engines are available
  hasRealAIEngine(): boolean {
    return !!(this.googleApiKey || this.openaiApiKey)
  }

  // Check if specific API is available
  isApiAvailable(engine?: 'google-imagen' | 'openai-dalle'): boolean {
    if (!engine) {
      return !!(this.googleApiKey || this.openaiApiKey)
    }
    
    switch (engine) {
      case 'google-imagen':
        return !!this.googleApiKey
      case 'openai-dalle':
        return !!this.openaiApiKey
      default:
        return false
    }
  }

  // Get estimated processing time
  getEstimatedTime(hasOriginalImage: boolean, engine?: string): number {
    // Estimated time in seconds
    const baseTime = hasOriginalImage ? 15 : 10
    
    switch (engine) {
      case 'google-imagen':
        return baseTime + 5 // Google typically slower
      case 'openai-dalle':
        return baseTime
      case 'mock':
        return 3 // Mock is fast
      default:
        return baseTime
    }
  }

  // Get engine capabilities
  getEngineCapabilities(engine: 'google-imagen' | 'openai-dalle' | 'mock') {
    const capabilities = {
      'google-imagen': {
        maxResolution: '1024x1024',
        supportsFaceEditing: true,
        supportsImageToImage: true,
        maxPromptLength: 1000,
        qualityLevels: ['standard', 'hd', 'premium']
      },
      'openai-dalle': {
        maxResolution: '1024x1024',
        supportsFaceEditing: false,
        supportsImageToImage: false,
        maxPromptLength: 400,
        qualityLevels: ['standard', 'hd']
      },
      'mock': {
        maxResolution: '512x512',
        supportsFaceEditing: true,
        supportsImageToImage: true,
        maxPromptLength: 2000,
        qualityLevels: ['standard', 'hd', 'premium']
      }
    }

    return capabilities[engine]
  }
}

// Singleton instance
export const aiImageGenerator = new AIImageGenerator()

// Export types for component usage (types already exported above)