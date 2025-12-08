import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscriptionService } from '../services/subscription'

const PremiumContext = createContext({})

export const usePremium = () => {
  const context = useContext(PremiumContext)
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider')
  }
  return context
}

export const PremiumProvider = ({ children }) => {
  const { user, profile } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)  // Start with false!

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setSubscription(null)
      return
    }

    // Check profile plan first (new tier system)
    if (profile?.plan === 'student') {
      setIsPremium(true)
    }

    // Load subscription in background - don't block UI
    const loadSub = async () => {
      try {
        const { data } = await subscriptionService.getSubscription(user.id)
        if (data) {
          setSubscription(data)
          if (data.plan === 'premium' && data.status === 'active') {
            setIsPremium(true)
          }
        }
      } catch (err) {
        console.error('Subscription error:', err)
      }
    }
    
    loadSub()
  }, [user, profile])

  const checkCanSendMessage = async () => {
    if (!user) return { allowed: false, remaining: 0 }
    if (isPremium || profile?.plan === 'student') {
      return { allowed: true, remaining: 999 }
    }
    
    try {
      return await subscriptionService.canSendAIMessage(user.id)
    } catch {
      return { allowed: true, remaining: 10 }
    }
  }

  const incrementMessageCount = async () => {
    if (!user || isPremium || profile?.plan === 'student') return
    try {
      await subscriptionService.incrementAIMessages(user.id)
    } catch (err) {
      console.error('Increment error:', err)
    }
  }

  const value = {
    isPremium,
    subscription,
    loading,
    checkCanSendMessage,
    incrementMessageCount,
    refreshSubscription: () => {}
  }

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
}
