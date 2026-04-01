import { supabase } from './supabase'

const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY

export const donationService = {
  // Get donation tiers
  getTiers: () => {
    return [
      {
        id: 'supporter',
        name: '💚 Supporter',
        amountUSD: 10,
        amountXOF: 6000,
        benefits: ['1 student sponsored for 1 month', 'Name on donor wall'],
        icon: '💚'
      },
      {
        id: 'bronze',
        name: '🥉 Bronze Sponsor',
        amountUSD: 50,
        amountXOF: 30000,
        benefits: ['5 students for 2 months', 'Profile badge', 'Featured on wall'],
        icon: '🥉'
      },
      {
        id: 'silver',
        name: '🥈 Silver Sponsor',
        amountUSD: 100,
        amountXOF: 60000,
        benefits: ['10 students for 2 months', 'School mentions you', 'Impact report'],
        icon: '🥈'
      },
      {
        id: 'gold',
        name: '🥇 Gold Sponsor',
        amountUSD: 500,
        amountXOF: 300000,
        benefits: ['30 students classroom', 'Direct student connection', 'Quarterly updates'],
        icon: '🥇'
      },
      {
        id: 'platinum',
        name: '💎 Platinum Partner',
        amountUSD: 1000,
        amountXOF: 600000,
        benefits: ['100+ students', 'School partnership', 'Your name on platform'],
        icon: '💎'
      }
    ]
  },

  // Initialize Flutterwave payment
  initializePayment: async (donationData) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .insert({
          donor_name: donationData.name,
          donor_email: donationData.email,
          donor_country: donationData.country,
          amount: donationData.amount,
          currency: donationData.currency,
          amount_usd: donationData.amountUSD,
          is_recurring: donationData.isRecurring || false,
          recurring_frequency: donationData.recurringFrequency,
          is_anonymous: donationData.isAnonymous || false,
          message: donationData.message,
          payment_method: 'flutterwave',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Initialize Flutterwave
      const paymentData = {
        tx_ref: data.id,
        amount: donationData.amount,
        currency: donationData.currency,
        payment_options: 'card,ussd,mobilemoney',
        customer: {
          email: donationData.email,
          name: donationData.name
        },
        customizations: {
          title: 'KanGam Sponsorship',
          description: `Sponsor students with KanGam`,
          logo: 'https://kangam.click/logo.png'
        },
        redirect_url: `${window.location.origin}/sponsor/success`
      }

      return { data: { ...data, paymentData }, error: null }
    } catch (error) {
      console.error('Error creating donation:', error)
      return { data: null, error }
    }
  },

  // Get impact metrics
  getImpactMetrics: async () => {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .single()

    return { data, error }
  },

  // Get donor wall
  getDonorWall: async (limit = 50) => {
    const { data, error } = await supabase
      .from('donor_profiles')
      .select('*')
      .eq('show_on_wall', true)
      .order('total_donated_usd', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Get funding requests
  getFundingRequests: async () => {
    const { data, error } = await supabase
      .from('student_funding_requests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Calculate students to sponsor based on amount
  calculateStudentsToSponsor: (amountUSD) => {
    const costPerMonth = 5 // $5 per student per month
    return Math.floor(amountUSD / costPerMonth)
  }
}