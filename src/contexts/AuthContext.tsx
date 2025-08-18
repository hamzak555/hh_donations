import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthService, User } from '@/services/authService'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Use environment variable to determine if Supabase Auth is enabled
const USE_SUPABASE_AUTH = process.env.REACT_APP_SUPABASE_URL && 
                          process.env.REACT_APP_SUPABASE_URL !== 'your_supabase_project_url'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (USE_SUPABASE_AUTH) {
      // Initialize Supabase auth
      initializeAuth()
      
      // Listen for auth changes
      const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
        setUser(user)
        setIsLoading(false)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } else {
      // Fallback to localStorage auth
      const adminAuth = localStorage.getItem('adminAuth')
      if (adminAuth === 'true') {
        setUser({
          id: 'local-admin',
          email: 'admin@hhdonations.org',
          role: 'admin',
          created_at: new Date().toISOString()
        })
      }
      setIsLoading(false)
    }
  }, [])

  const initializeAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (USE_SUPABASE_AUTH) {
      setIsLoading(true)
      const result = await AuthService.signIn(email, password)
      
      if (result.user) {
        setUser(result.user)
      }
      
      setIsLoading(false)
      return { error: result.error }
    } else {
      // Fallback to simple localStorage auth
      if (email === 'admin@hhdonations.org' && password === 'admin123') {
        const localUser: User = {
          id: 'local-admin',
          email: 'admin@hhdonations.org',
          role: 'admin',
          created_at: new Date().toISOString()
        }
        setUser(localUser)
        localStorage.setItem('adminAuth', 'true')
        return { error: null }
      } else {
        return { error: 'Invalid credentials' }
      }
    }
  }

  const signOut = async (): Promise<void> => {
    if (USE_SUPABASE_AUTH) {
      await AuthService.signOut()
    } else {
      localStorage.removeItem('adminAuth')
    }
    setUser(null)
  }

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (USE_SUPABASE_AUTH) {
      setIsLoading(true)
      const result = await AuthService.signUp(email, password)
      setIsLoading(false)
      return { error: result.error }
    } else {
      return { error: 'Sign up not available in localStorage mode' }
    }
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signOut,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { User }