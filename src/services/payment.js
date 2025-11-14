import { supabase } from './supabase'

export const paymentService = {
  // Record payment transaction
  recordTransaction: async (userId, amount, plan, reference, status) => {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'XOF',
        payment_method: 'flutterwave',
        status: status,
        transaction_id: reference,
        plan: plan
      })
      .select()
      .single()
    
    return { data, error }
  },

  // Upgrade user to premium after successful payment
  upgradeToPremium: async (userId, plan) => {
    const now = new Date()
    let expiresAt = null
    
    if (plan === 'monthly') {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
    } else if (plan === 'yearly') {
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
    }
    // lifetime = no expiry
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan: 'premium',
        status: 'active',
        expires_at: expiresAt,
        payment_method: 'flutterwave',
        started_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Verify payment was successful
  verifyPayment: async (transactionId) => {
    // In production, you'd verify with Flutterwave API
    // For now, we trust the frontend response
    return { verified: true }
  }
}