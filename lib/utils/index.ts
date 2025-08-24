import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * This ensures Tailwind CSS classes are properly merged without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | Date, locale = 'ja-JP'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date, locale = 'ja-JP'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (days > 0) return rtf.format(-days, 'day')
  if (hours > 0) return rtf.format(-hours, 'hour')
  if (minutes > 0) return rtf.format(-minutes, 'minute')
  return rtf.format(-seconds, 'second')
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'JPY', locale = 'ja-JP'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) {
    const clonedArr: any[] = []
    obj.forEach((element) => {
      clonedArr.push(deepClone(element))
    })
    return clonedArr as unknown as T
  }
  if (obj instanceof Object) {
    const clonedObj: { [key: string]: any } = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('パスワードは8文字以上必要です')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を1文字以上含めてください')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を1文字以上含めてください')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('数字を1文字以上含めてください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Convert file to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Convert Base64 to Blob
 */
export function base64ToBlob(base64: string, contentType = ''): Blob {
  const byteCharacters = atob(base64.split(',')[1])
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get query parameters from URL
 */
export function getQueryParams(url?: string): Record<string, string> {
  const queryString = url ? new URL(url).search : window.location.search
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}