import { supabase } from '@/lib/supabase'
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
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  return { error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Send password reset email
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  return { error }
}

// Update user password
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password
  })

  return { error }
}

// Update user profile
export async function updateProfile(updates: { name?: string; avatar_url?: string }) {
  const { error } = await supabase.auth.updateUser({
    data: updates
  })

  return { error }
}