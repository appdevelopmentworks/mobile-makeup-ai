import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AuthError, User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

// Sign up with email and password
export async function signUp(data: SignUpData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      error: { message: 'Authentication is not configured', name: 'ConfigError', status: 400 } as AuthError
    }
  }

  const { email, password, name } = data
  
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        avatar_url: '',
      }
    }
  })

  return {
    user: authData.user,
    error
  }
}

// Sign in with email and password
export async function signIn(data: SignInData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      error: { message: 'Authentication is not configured', name: 'ConfigError', status: 400 } as AuthError
    }
  }

  const { email, password } = data

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return {
    user: authData.user,
    error
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle(redirectTo?: string) {
  if (!isSupabaseConfigured) {
    // For demo purposes, create a mock Google user
    const mockGoogleUser = {
      id: 'google-mock-' + Date.now(),
      email: 'user@gmail.com',
      user_metadata: { 
        name: 'Google テストユーザー',
        avatar_url: 'https://via.placeholder.com/100/4285f4/ffffff?text=G'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString()
    }
    
    // Store mock Google user
    localStorage.setItem('mockUser', JSON.stringify(mockGoogleUser))
    
    // Simulate redirect
    setTimeout(() => {
      window.location.href = redirectTo || '/dashboard'
    }, 1000)
    
    return { error: null }
  }

  const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
  
  // Add redirect destination as state parameter
  if (redirectTo) {
    const state = encodeURIComponent(JSON.stringify({ redirectTo }))
    callbackUrl.searchParams.set('state', state)
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString()
    }
  })

  return { error }
}

// Sign out
export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return { user: null, error: null }
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Send password reset email
export async function resetPassword(email: string) {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Authentication is not configured', name: 'ConfigError', status: 400 } as AuthError }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  return { error }
}

// Update user password
export async function updatePassword(password: string) {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Authentication is not configured', name: 'ConfigError', status: 400 } as AuthError }
  }

  const { error } = await supabase.auth.updateUser({
    password
  })

  return { error }
}

// Update user profile
export async function updateProfile(updates: { name?: string; avatar_url?: string }) {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Authentication is not configured', name: 'ConfigError', status: 400 } as AuthError }
  }

  const { error } = await supabase.auth.updateUser({
    data: updates
  })

  return { error }
}