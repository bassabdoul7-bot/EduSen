import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { authService, profileService, supabase } from '../services/supabase'

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

  // Load profile - non-blocking, with timeout
  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile load timeout')), 3000)
      )
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
      
      if (error) {
        console.log('Profile load error, using default:', error)
        setProfile({ id: userId, plan: 'free' })
      } else if (data) {
        setProfile({ ...data, plan: data.plan || 'free' })
      } else {
        setProfile({ id: userId, plan: 'free' })
      }
    } catch (err) {
      console.log('Profile error/timeout, using default:', err)
      setProfile({ id: userId, plan: 'free' })
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('AuthProvider: Starting auth check...')
    
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        console.log('Current user:', user?.id)
        
        if (mounted) {
          setUser(user)
          if (user) {
            await loadProfile(user.id)
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Failsafe timeout
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('Auth timeout - forcing load complete')
        setLoading(false)
      }
    }, 5000)

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        const currentUser = session?.user ?? null
        
        if (mounted) {
          setUser(currentUser)
          if (currentUser) {
            loadProfile(currentUser.id)  // Don't await
          } else {
            setProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription?.unsubscribe()
    }
  }, [])

  // Online status tracking
  const onlineIntervalRef = useRef(null)

  useEffect(() => {
    if (user) {
      // Set online
      profileService.updateOnlineStatus(user.id, true)

      // Heartbeat every 60 seconds
      onlineIntervalRef.current = setInterval(() => {
        profileService.updateOnlineStatus(user.id, true)
      }, 60000)

      // Set offline on tab close/hide
      const handleVisibility = () => {
        if (document.hidden) {
          profileService.updateOnlineStatus(user.id, false)
        } else {
          profileService.updateOnlineStatus(user.id, true)
        }
      }

      const handleBeforeUnload = () => {
        profileService.updateOnlineStatus(user.id, false)
      }

      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        clearInterval(onlineIntervalRef.current)
        document.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        profileService.updateOnlineStatus(user.id, false)
      }
    } else {
      clearInterval(onlineIntervalRef.current)
    }
  }, [user])

  const signUp = async (email, password, fullName, extra = {}) => {
    const { data, error } = await authService.signUp(email, password, fullName)
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password)
    return { data, error }
  }

  const signOut = async () => {
    if (user) await profileService.updateOnlineStatus(user.id, false)
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
    refreshProfile: () => user && loadProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
