'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface StaffUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  auth_user_id: string
}

interface UseAuthReturn {
  user: StaffUser | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<StaffUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const { data: staffUser, error: staffError } = await supabase
          .from('staff_users')
          .select('id, email, name, role, auth_user_id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (staffError) {
          setError(staffError.message)
          setUser(null)
        } else {
          setUser(staffUser)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [supabase])

  return {
    user,
    isAdmin: user?.role === 'admin' || user?.email === 'domesticandforeignab@gmail.com',
    isLoading,
    error
  }
}
