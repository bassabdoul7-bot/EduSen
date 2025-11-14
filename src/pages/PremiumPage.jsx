import { Check, Crown, Zap } from 'lucide-react'
import { usePremium } from '../context/PremiumContext'
import { useAuth } from '../context/AuthContext'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import { paymentService } from '../services/payment'
import toast from 'react-hot-toast'

export default function PremiumPage() {
  const { isPremium, subscription, refreshSubscription } = usePremium()
  const { user, profile } = useAuth()

  const plans = [
    {
      name: 'Mensuel',
      price: 2500,
      displayPrice: '2,500',
      period: 'par mois',
      plan: 'monthly',
      popular: false
    },
    {
      name: 'Annuel',
      price: 25000,
      displayPrice: '25,000',
      period: 'par an',
      plan: 'yearly',
      popular: true,
      savings: 'Économisez 17%'
    },
    {
      name: 'À vie',
      price: 75000,
      displayPrice: '75,000',
      period: 'paiement unique',
      plan: 'lifetime',
      popular: false
    }
  ]

  const features = [
    'Messages IA illimités',
    'Tous les 12 sujets (Math, Programmation, Médecine, etc.)',
    'Fonction Caméra - Prendre photo des devoirs',
    'Upload PDF - Questions sur vos documents',
    'Portail Bourses complet',
    'Alertes bourses par email',
    'Base de données complète universités',
    'Suivi candidatures',
    'Forum illimité',
    'Messages directs',
    'Réponses IA prioritaires',
    'Télécharger conversations en PDF',
    'Badge Premium',
    'Sans publicité'
  ]

  const handlePaymentSuccess = async (response, planType) => {
    console.log('💳 Payment successful:', response)
    
    await paymentService.recordTransaction(
      user.id,
      response.amount,
      planType,
      response.transaction_id,
      'completed'
    )
    
    const { error } = await paymentService.upgradeToPremium(user.id, planType)
    
    if (!error) {
      await refreshSubscription()
      toast.success('🎉 Félicitations! Vous êtes maintenant Premium!')
    } else {
      toast.error('Erreur lors de l activation. Contactez le support.')
    }
    
    closePaymentModal()
  }

  const handlePaymentClose = () => {
    console.log('Payment modal closed')
    closePaymentModal()
  }

  const PayButton = ({ plan }) => {
    const config = {
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'ccca3414-1ab3-4b54-b0d4-ab25aff55b20',
      tx_ref: Date.now().toString(),
      amount: plan.price,
      currency: 'XOF',
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: user?.email || 'customer@example.com',
        name: profile?.full_name || 'Student',
      },
      customizations: {
        title: 'EduSen Premium',
        description: 'Abonnement ' + plan.name,
        logo: '',
      },
    }

    const handleFlutterPayment = useFlutterwave(config)

    return (
      <button
        onClick={() => {
          console.log('🚀 Opening Flutterwave payment modal...')
          handleFlutterPayment({
            callback: (response) => handlePaymentSuccess(response, plan.plan),
            onClose: handlePaymentClose,
          })
        }}
        className={'w-full py-3 rounded-lg font-bold transition-all ' + 
          (plan.popular 
            ? 'bg-senegal-green text-white hover:bg-green-700' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          )}
      >
        <Zap className='inline mr-2' size={20} />
        S'abonner
      </button>
    )
  }

  if (isPremium) {
    return (
      <div className='max-w-4xl mx-auto text-center'>
        <div className='card bg-gradient-to-r from-senegal-green to-green-600 text-white'>
          <Crown size={64} className='mx-auto mb-4' />
          <h1 className='text-3xl font-bold mb-2'>Vous êtes Premium! 🎉</h1>
          <p className='text-green-100 mb-4'>
            Profitez de toutes les fonctionnalités illimitées
          </p>
          <div className='bg-white/10 rounded-lg p-4 inline-block'>
            <p className='text-sm'>
              Plan: <strong>Premium</strong>
            </p>
            {subscription?.expires_at && (
              <p className='text-sm mt-2'>
                Expire le: {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold mb-4'>
          Passez à Premium 👑
        </h1>
        <p className='text-xl text-gray-600'>
          Débloquez toutes les fonctionnalités et accélérez votre apprentissage
        </p>
      </div>

      <div className='grid md:grid-cols-3 gap-6 mb-12'>
        {plans.map((plan) => (
          <div
            key={plan.plan}
            className={'card relative ' + (plan.popular ? 'ring-2 ring-senegal-green scale-105 shadow-2xl' : '')}
          >
            {plan.popular && (
              <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-senegal-green text-white px-4 py-1 rounded-full text-sm font-bold'>
                ⭐ Plus populaire
              </div>
            )}
            
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
              {plan.savings && (
                <p className='text-senegal-green font-semibold mb-2'>{plan.savings}</p>
              )}
              <div className='text-4xl font-bold text-senegal-green mb-1'>
                {plan.displayPrice} <span className='text-lg'>CFA</span>
              </div>
              <p className='text-gray-600'>{plan.period}</p>
            </div>

            <PayButton plan={plan} />
          </div>
        ))}
      </div>

      <div className='card'>
        <h2 className='text-2xl font-bold mb-6 text-center'>
          Tout ce qui est inclus avec Premium
        </h2>
        <div className='grid md:grid-cols-2 gap-4'>
          {features.map((feature, index) => (
            <div key={index} className='flex items-start gap-3'>
              <Check className='text-senegal-green flex-shrink-0 mt-1' size={20} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-8 text-center'>
        <p className='text-gray-600'>
          💳 Méthodes: Orange Money, Wave, Free Money, Visa/Mastercard
        </p>
        <p className='text-sm text-gray-500 mt-2'>
          Paiement sécurisé par Flutterwave
        </p>
      </div>
    </div>
  )
}