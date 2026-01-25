import { supabase } from './supabase'

// Bypass emails - unlimited access
const BYPASS_EMAILS = [
  'sales@getagenter.com'
]

export const subscriptionService = {
  // Get user subscription
  getSubscription: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()  // Use maybeSingle instead of single - returns null if not found
      
      return { data, error: null }
    } catch (err) {
      console.error('getSubscription error:', err)
      return { data: null, error: err }
    }
  },

  // Check if user is premium
  isPremium: async (userId) => {
    try {
      const { data, error } = await subscriptionService.getSubscription(userId)
      if (error || !data) return false
      
      // Check if premium and not expired
      if (data.plan === 'premium' && data.status === 'active') {
        if (!data.expires_at) return true // Lifetime
        if (new Date(data.expires_at) > new Date()) return true
      }
      return false
    } catch (err) {
      console.error('isPremium error:', err)
      return false
    }
  },

  // Get today's usage
  getTodayUsage: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (!data && !error) {
        // No usage record for today, create one
        const { data: newData, error: insertError } = await supabase
          .from('daily_usage')
          .insert({ user_id: userId, date: today, ai_messages_count: 0 })
          .select()
          .single()
        return { data: newData, error: insertError }
      }
      return { data, error }
    } catch (err) {
      console.error('getTodayUsage error:', err)
      return { data: { ai_messages_count: 0 }, error: null }
    }
  },

  // Increment AI message count
  incrementAIMessages: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await subscriptionService.getTodayUsage(userId)
      
      if (usage) {
        const { error: updateError } = await supabase
          .from('daily_usage')
          .update({ ai_messages_count: (usage.ai_messages_count || 0) + 1 })
          .eq('user_id', userId)
          .eq('date', today)
        return { error: updateError }
      }
      return { error: null }
    } catch (err) {
      console.error('incrementAIMessages error:', err)
      return { error: err }
    }
  },

  // Check if user can send AI message
  canSendAIMessage: async (userId) => {
    try {
      const isPremium = await subscriptionService.isPremium(userId)
      if (isPremium) return { allowed: true, remaining: -1 } // Unlimited

      // Free tier: 10 messages per day
      const { data: usage } = await subscriptionService.getTodayUsage(userId)
      if (!usage) return { allowed: true, remaining: 10 }
      
      const limit = 10
      const used = usage.ai_messages_count || 0
      const remaining = limit - used
      
      return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit
      }
    } catch (err) {
      console.error('canSendAIMessage error:', err)
      return { allowed: true, remaining: 10 }
    }
  },

  // Upgrade to premium
  upgradeToPremium: async (userId, plan, paymentMethod, transactionId) => {
    const now = new Date()
    let expiresAt = null

    if (plan === 'monthly') {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
    } else if (plan === 'yearly') {
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: 'premium',
        status: 'active',
        expires_at: expiresAt,
        payment_method: paymentMethod
      })

    if (!error) {
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          amount: plan === 'monthly' ? 2500 : plan === 'yearly' ? 25000 : 75000,
          payment_method: paymentMethod,
          status: 'completed',
          transaction_id: transactionId,
          plan: plan
        })
    }

    return { error }
  }
}
