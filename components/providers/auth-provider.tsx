'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { signOut as authSignOut } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  signOut: () => Promise<void>
  mockSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Check for existing session in localStorage first
    const checkStoredSession = () => {
      try {
        const storedUser = localStorage.getItem('mockUser')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setLoading(false)
          return true
        }
      } catch (error) {
        console.log('No stored session found')
      }
      return false
    }

    // If there's a stored session, use it
    if (checkStoredSession()) {
      return
    }

    // If Supabase is not configured, don't auto-login but allow manual login
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        setError(err as AuthError)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      setError(null)

      // Handle specific events
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      setLoading(true)
      
      // Clear localStorage session first
      localStorage.removeItem('mockUser')
      
      const { error } = await authSignOut()
      
      if (error) {
        setError(error)
        console.error('Sign out error:', error)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err as AuthError)
    } finally {
      setLoading(false)
    }
  }

  const mockSignIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Simple mock authentication - accept any email/password for testing
      if (email && password) {
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          email: email,
          user_metadata: { name: email.split('@')[0] },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString()
        } as User

        // Store in localStorage for persistence
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        
        setUser(mockUser)
        setError(null)
        
        return { success: true }
      } else {
        return { success: false, error: 'メールアドレスとパスワードを入力してください' }
      }
    } catch (err) {
      console.error('Mock sign in error:', err)
      return { success: false, error: 'ログインに失敗しました' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signOut: handleSignOut,
    mockSignIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}