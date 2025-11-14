import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 AuthProvider: Starting auth check...')
    
    authService.getCurrentUser()
      .then((user) => {
        console.log('👤 Current user:', user)
        setUser(user)
        // Skip profile loading for now - just set loading to false
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Auth error:', err)
        setLoading(false)
      })

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event)
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await authService.signUp(email, password, fullName)
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => {},
  }

  console.log('🎯 Auth state:', { user: !!user, profile: !!profile, loading })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}