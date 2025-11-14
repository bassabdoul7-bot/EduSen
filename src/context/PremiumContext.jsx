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
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      console.log('💎 Loading subscription for user:', user.id)
      loadSubscription()
    } else {
      setIsPremium(false)
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return
    
    const { data, error } = await subscriptionService.getSubscription(user.id)
    
    console.log('💎 Subscription data:', { data, error })
    
    if (!error && data) {
      setSubscription(data)
      const premium = await subscriptionService.isPremium(user.id)
      console.log('💎 Is Premium:', premium)
      setIsPremium(premium)
    } else {
      console.log('⚠️ No subscription found or error:', error)
    }
    
    setLoading(false)
  }

  const checkCanSendMessage = async () => {
    if (!user) return { allowed: false, remaining: 0 }
    const result = await subscriptionService.canSendAIMessage(user.id)
    console.log('💬 Can send message:', result)
    return result
  }

  const incrementMessageCount = async () => {
    if (!user) return
    console.log('📈 Incrementing message count')
    await subscriptionService.incrementAIMessages(user.id)
  }

  const value = {
    isPremium,
    subscription,
    loading,
    checkCanSendMessage,
    incrementMessageCount,
    refreshSubscription: loadSubscription
  }

  console.log('💎 Premium context value:', { isPremium, subscription, loading })

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
}