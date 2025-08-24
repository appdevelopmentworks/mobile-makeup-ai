'use client'

import { createContext, useContext, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: AuthError | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user for development
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'user@example.com',
    user_metadata: { name: 'テストユーザー' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    role: 'authenticated',
    updated_at: '2024-01-01T00:00:00.000Z'
  } as User

  const [user] = useState<User | null>(mockUser)
  const [loading] = useState(false)
  const [error] = useState<AuthError | null>(null)

  const handleSignOut = async () => {
    // Mock sign out - in real app, this would call supabase.auth.signOut()
    console.log('Mock sign out')
  }

  const value = {
    user,
    loading,
    error,
    signOut: handleSignOut,
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