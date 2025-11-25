import { useState, useEffect } from 'react'
import { donationService } from '../services/donation'
import { Heart, Users, BookOpen, TrendingUp, Crown, DollarSign, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SponsorPage() {
  const [selectedTier, setSelectedTier] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [impactMetrics, setImpactMetrics] = useState(null)
  const [donorWall, setDonorWall] = useState([])
  const [fundingRequests, setFundingRequests] = useState([])
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    country: '',
    message: '',
    isAnonymous: false
  })

  const tiers = donationService.getTiers()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: metrics } = await donationService.getImpactMetrics()
    const { data: donors } = await donationService.getDonorWall(20)
    const { data: requests } = await donationService.getFundingRequests()
    
    setImpactMetrics(metrics)
    setDonorWall(donors || [])
    setFundingRequests(requests || [])
  }

  const handleTierSelect = (tier) => {
    setSelectedTier(tier)
    setCustomAmount('')
    setShowDonationForm(true)
  }

  const handleCustomDonation = () => {
    if (!customAmount || parseFloat(customAmount) < 5) {
      toast.error('Minimum donation is $5 or 3,000 FCFA')
      return
    }
    setSelectedTier(null)
    setShowDonationForm(true)
  }

  const getAmount = () => {
    if (customAmount) {
      return currency === 'USD' ? parseFloat(customAmount) : parseFloat(customAmount)
    }
    if (selectedTier) {
      return currency === 'USD' ? selectedTier.amountUSD : selectedTier.amountXOF
    }
    return 0
  }

  const getAmountUSD = () => {
    if (currency === 'USD') return getAmount()
    return getAmount() / 600 // Approximate conversion
  }

  const studentsToSponsor = donationService.calculateStudentsToSponsor(getAmountUSD())

  const handleDonate = async () => {
    if (!donorInfo.name || !donorInfo.email) {
      toast.error('Nom et email requis')
      return
    }

    const donationData = {
      name: donorInfo.name,
      email: donorInfo.email,
      country: donorInfo.country,
      amount: getAmount(),
      currency: currency,
      amountUSD: getAmountUSD(),
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? 'monthly' : null,
      isAnonymous: donorInfo.isAnonymous,
      message: donorInfo.message,
      studentsToSponsor: studentsToSponsor
    }

    toast.loading('Initialisation du paiement...', { id: 'payment' })

    const { data, error } = await donationService.initializePayment(donationData)

    if (error) {
      toast.error('Erreur lors du paiement', { id: 'payment' })
      return
    }

    // Initialize Flutterwave Modal
    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: data.id,
      amount: donationData.amount,
      currency: donationData.currency,
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: donationData.email,
        name: donationData.name
      },
      customizations: {
        title: 'EduSen Sponsorship',
        description: `Sponsor ${studentsToSponsor} students`,
        logo: 'https://edusen.netlify.app/logo.png'
      },
      callback: (response) => {
        toast.success('Paiement réussi! Merci! 🎉', { id: 'payment' })
        setShowDonationForm(false)
        loadData()
      },
      onclose: () => {
        toast.error('Paiement annulé', { id: 'payment' })
      }
    })
  }

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <div className='card p-8 bg-gradient-to-r from-senegal-green to-senegal-yellow text-white'>
        <div className='max-w-3xl'>
          <h1 className='text-4xl font-bold mb-4'>🌍 Sponsor a Student, Change a Life</h1>
          <p className='text-xl mb-6'>
            Help Senegalese students access world-class education through AI tutoring, scholarships, and more.
          </p>
          <div className='flex flex-wrap gap-4'>
            <button 
              onClick={() => document.getElementById('tiers').scrollIntoView({ behavior: 'smooth' })}
              className='bg-white text-senegal-green px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors'
            >
              Donate Now 💚
            </button>
            <button 
              onClick={() => document.getElementById('impact').scrollIntoView({ behavior: 'smooth' })}
              className='bg-white/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors backdrop-blur'
            >
              See Impact 📊
            </button>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      {impactMetrics && (
        <div id='impact' className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='card p-6 text-center'>
            <DollarSign className='mx-auto mb-2 text-senegal-green' size={32} />
            <div className='text-3xl font-bold text-senegal-green'>
              ${impactMetrics.total_donations_usd?.toLocaleString() || 0}
            </div>
            <div className='text-gray-600'>Total Raised</div>
          </div>
          <div className='card p-6 text-center'>
            <Users className='mx-auto mb-2 text-senegal-yellow' size={32} />
            <div className='text-3xl font-bold text-senegal-yellow'>
              {impactMetrics.total_students_helped?.toLocaleString() || 0}
            </div>
            <div className='text-gray-600'>Students Helped</div>
          </div>
          <div className='card p-6 text-center'>
            <BookOpen className='mx-auto mb-2 text-senegal-red' size={32} />
            <div className='text-3xl font-bold text-senegal-red'>
              {impactMetrics.total_messages_sent?.toLocaleString() || 0}
            </div>
            <div className='text-gray-600'>AI Tutoring Sessions</div>
          </div>
          <div className='card p-6 text-center'>
            <TrendingUp className='mx-auto mb-2 text-blue-500' size={32} />
            <div className='text-3xl font-bold text-blue-500'>
              +{impactMetrics.average_grade_improvement || 0}%
            </div>
            <div className='text-gray-600'>Avg. Grade Improvement</div>
          </div>
        </div>
      )}

      {/* Donation Tiers */}
      <div id='tiers' className='space-y-4'>
        <h2 className='text-3xl font-bold text-center mb-8'>Choose Your Impact 🎯</h2>
        
        {/* Currency Toggle */}
        <div className='flex justify-center mb-6'>
          <div className='bg-gray-100 rounded-lg p-1 flex gap-1'>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                currency === 'USD' ? 'bg-senegal-green text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌍 USD (International)
            </button>
            <button
              onClick={() => setCurrency('XOF')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                currency === 'XOF' ? 'bg-senegal-green text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇸🇳 FCFA (Local)
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => handleTierSelect(tier)}
              className='card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-senegal-green'
            >
              <div className='text-4xl mb-3 text-center'>{tier.icon}</div>
              <h3 className='text-xl font-bold text-center mb-2'>{tier.name}</h3>
              <div className='text-3xl font-bold text-center text-senegal-green mb-4'>
                {currency === 'USD' ? `$${tier.amountUSD}` : `${tier.amountXOF.toLocaleString()} FCFA`}
              </div>
              <ul className='space-y-2'>
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className='text-sm text-gray-600 flex items-start gap-2'>
                    <span className='text-senegal-green'>✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Custom Amount */}
        <div className='card p-6 max-w-md mx-auto'>
          <h3 className='text-xl font-bold mb-4 text-center'>Custom Amount 💰</h3>
          <div className='flex gap-2'>
            <input
              type='number'
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={currency === 'USD' ? 'Enter amount (min $5)' : 'Montant (min 3,000 FCFA)'}
              className='input-field flex-1'
              min={currency === 'USD' ? 5 : 3000}
            />
            <button
              onClick={handleCustomDonation}
              className='btn-primary px-6'
            >
              Donate
            </button>
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4'>Complete Your Donation 💚</h3>
            
            <div className='bg-senegal-green/10 p-4 rounded-lg mb-4'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-senegal-green'>
                  {currency === 'USD' ? `$${getAmount()}` : `${getAmount().toLocaleString()} FCFA`}
                </div>
                <div className='text-sm text-gray-600 mt-2'>
                  Will sponsor {studentsToSponsor} student{studentsToSponsor > 1 ? 's' : ''} for 1 month
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-2'>Full Name *</label>
                <input
                  type='text'
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                  className='input-field w-full'
                  placeholder='John Doe'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2'>Email *</label>
                <input
                  type='email'
                  value={donorInfo.email}
                  onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                  className='input-field w-full'
                  placeholder='john@example.com'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2'>Country</label>
                <input
                  type='text'
                  value={donorInfo.country}
                  onChange={(e) => setDonorInfo({ ...donorInfo, country: e.target.value })}
                  className='input-field w-full'
                  placeholder='USA, France, Senegal...'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2'>Message (Optional)</label>
                <textarea
                  value={donorInfo.message}
                  onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                  className='input-field w-full'
                  rows='3'
                  placeholder='Your message to students...'
                />
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='anonymous'
                  checked={donorInfo.isAnonymous}
                  onChange={(e) => setDonorInfo({ ...donorInfo, isAnonymous: e.target.checked })}
                  className='w-4 h-4'
                />
                <label htmlFor='anonymous' className='text-sm'>Donate anonymously</label>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='recurring'
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className='w-4 h-4'
                />
                <label htmlFor='recurring' className='text-sm'>Make this a monthly donation 🔄</label>
              </div>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                onClick={() => setShowDonationForm(false)}
                className='btn-secondary flex-1'
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                className='btn-primary flex-1'
              >
                <CreditCard size={18} className='inline mr-2' />
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donor Wall */}
      {donorWall.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-3xl font-bold text-center mb-8'>🌟 Our Amazing Donors</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {donorWall.map((donor) => (
              <div key={donor.id} className='card p-4 text-center'>
                <div className='text-3xl mb-2'>
                  {donor.donor_tier === 'platinum' ? '💎' : 
                   donor.donor_tier === 'gold' ? '🥇' :
                   donor.donor_tier === 'silver' ? '🥈' :
                   donor.donor_tier === 'bronze' ? '🥉' : '💚'}
                </div>
                <div className='font-bold text-sm'>{donor.display_name}</div>
                <div className='text-xs text-gray-500'>{donor.country}</div>
                <div className='text-sm text-senegal-green font-semibold mt-2'>
                  {donor.total_students_sponsored} students
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Funding Requests */}
      {fundingRequests.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-3xl font-bold text-center mb-8'>📚 Students Seeking Support</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {fundingRequests.map((request) => (
              <div key={request.id} className='card p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='text-2xl'>🎓</div>
                  <div className='text-sm text-gray-500'>{request.region}</div>
                </div>
                <h3 className='font-bold mb-2'>{request.grade_level}</h3>
                <p className='text-sm text-gray-600 mb-4'>{request.story}</p>
                <div className='mb-4'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Progress</span>
                    <span className='font-semibold'>
                      {Math.round((request.amount_raised / request.goal_amount) * 100)}%
                    </span>
                  </div>
                  <div className='bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-senegal-green rounded-full h-2 transition-all'
                      style={{ width: `${Math.min((request.amount_raised / request.goal_amount) * 100, 100)}%` }}
                    />
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {request.amount_raised.toLocaleString()} / {request.goal_amount.toLocaleString()} FCFA
                  </div>
                </div>
                <button className='btn-primary w-full text-sm'>
                  Sponsor This Student
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}