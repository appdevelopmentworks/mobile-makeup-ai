'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  subscription_status: 'free' | 'premium'
  usage_count: number
  created_at: string
  updated_at: string
}

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    }
  }

  const refetch = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError

      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error('Error refetching user:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    refetch()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    refetch,
  }
}