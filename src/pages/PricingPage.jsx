// ============ PRICING PAGE ============
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PLANS, PLAN_INFO } from '../services/tiers'
import { usePlan } from '../hooks/usePlan'

export default function PricingPage() {
  const { plan: currentPlan } = usePlan()
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre formule
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Debloquez tout le potentiel d'EduSen pour reussir vos etudes
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-gray-200 transition">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-2xl font-bold text-gray-900">{PLAN_INFO[PLANS.FREE].name}</h3>
              <p className="text-gray-500 mt-2">{PLAN_INFO[PLANS.FREE].description}</p>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">0</span>
              <span className="text-gray-500 ml-1">FCFA</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PLAN_INFO[PLANS.FREE].features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
              <li className="flex items-center text-gray-400">
                <span className="text-red-400 mr-2">✗</span>
                Tuteur IA
              </li>
              <li className="flex items-center text-gray-400">
                <span className="text-red-400 mr-2">✗</span>
                Portail bourses
              </li>
            </ul>
            
            <button 
              disabled={currentPlan === PLANS.FREE}
              className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
            >
              {currentPlan === PLANS.FREE ? 'Plan actuel' : 'Commencer'}
            </button>
          </div>
          
          {/* Student Plan - Popular */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-500 relative transform hover:scale-105 transition">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ Populaire
              </span>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-2xl font-bold text-gray-900">{PLAN_INFO[PLANS.STUDENT].name}</h3>
              <p className="text-gray-500 mt-2">{PLAN_INFO[PLANS.STUDENT].description}</p>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-purple-600">5,000</span>
              <span className="text-gray-500 ml-1">FCFA/mois</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PLAN_INFO[PLANS.STUDENT].features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              to="/subscribe/student"
              className="block w-full py-3 rounded-xl font-semibold text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition"
            >
              S'abonner maintenant →
            </Link>
          </div>
          
          {/* School Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-blue-200 transition">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🏫</div>
              <h3 className="text-2xl font-bold text-gray-900">{PLAN_INFO[PLANS.SCHOOL].name}</h3>
              <p className="text-gray-500 mt-2">{PLAN_INFO[PLANS.SCHOOL].description}</p>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-blue-600">150,000</span>
              <span className="text-gray-500 ml-1">FCFA/an</span>
              <p className="text-sm text-gray-400">par classe</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PLAN_INFO[PLANS.SCHOOL].features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              to="/contact-sales"
              className="block w-full py-3 rounded-xl font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Contacter les ventes
            </Link>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Questions frequentes</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Comment payer?</h4>
              <p className="text-gray-600">Nous acceptons Wave, Orange Money, et les cartes bancaires.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Puis-je annuler a tout moment?</h4>
              <p className="text-gray-600">Oui, vous pouvez annuler votre abonnement a tout moment sans frais.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Y a-t-il une reduction pour les ecoles?</h4>
              <p className="text-gray-600">Oui! Contactez-nous pour un devis personnalise selon le nombre de classes.</p>
            </div>
          </div>
        </div>
        
        {/* Back Link */}
        <div className="text-center mt-8">
          <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
