import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, UserPlus, GraduationCap, School, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react'

export default function Register() {
  const [step, setStep] = useState(1) // 1: Select plan, 2: Form
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [phone, setPhone] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      icon: '🎁',
      price: '0 FCFA',
      description: 'Decouvrir EduSen',
      features: ['3 experiences labo', 'Acces limite'],
      color: 'border-gray-300 hover:border-gray-400',
      selected: 'border-gray-500 bg-gray-50',
    },
    {
      id: 'student',
      name: 'Etudiant',
      icon: '🎓',
      price: '5,000 FCFA/mois',
      description: 'Acces complet',
      features: ['Labo illimite', 'Tuteur IA', 'Bourses', 'Examens'],
      color: 'border-purple-300 hover:border-purple-400',
      selected: 'border-purple-500 bg-purple-50',
      popular: true,
    },
    {
      id: 'school',
      name: 'Ecole',
      icon: '🏫',
      price: '150,000 FCFA/an',
      description: 'Pour etablissements',
      features: ['Labo complet', 'Dashboard prof', 'Suivi eleves'],
      color: 'border-blue-300 hover:border-blue-400',
      selected: 'border-blue-500 bg-blue-50',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedPlan === 'school') {
      // School contact form - send to admin
      setLoading(true)
      // TODO: Send to your email or save to database
      toast.success('Demande envoyee! Nous vous contacterons bientot.')
      setLoading(false)
      navigate('/login')
      return
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, fullName, {
      plan: selectedPlan,
      level: level,
      phone: phone,
    })

    if (error) {
      toast.error(error.message || "Erreur lors de l'inscription")
    } else {
      if (selectedPlan === 'student') {
        // Account created - go to login
          toast.success('Compte cree! Verifiez votre email.')
          navigate('/login')
      } else {
        toast.success('Compte cree! Verifiez votre email.')
        navigate('/login')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EduSen</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Choisissez votre formule' : 'Creez votre compte'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
          <div className={`w-16 h-1 ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
        </div>

        {/* Step 1: Select Plan */}
        {step === 1 && (
          <div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${selectedPlan === plan.id ? plan.selected : plan.color}`}

                >
                  {plan.popular && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} /> Top
                    </div>
                  )}
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-purple-600 font-semibold text-sm">{plan.price}</p>
                  <p className="text-gray-500 text-xs mt-1">{plan.description}</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedPlan && setStep(2)}
              disabled={!selectedPlan}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuer</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={16} />
              <span>Changer de formule</span>
            </button>

            {/* Selected plan badge */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4 flex items-center gap-3">
              <span className="text-2xl">{plans.find(p => p.id === selectedPlan)?.icon}</span>
              <div>
                <p className="font-semibold">{plans.find(p => p.id === selectedPlan)?.name}</p>
                <p className="text-sm text-purple-600">{plans.find(p => p.id === selectedPlan)?.price}</p>
              </div>
            </div>

            {/* School-specific form */}
            {selectedPlan === 'school' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'etablissement
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Lycee Example"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personne de contact
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Prenom Nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="contact@ecole.sn"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telephone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+221 77 123 45 67"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mail size={20} />
                  <span>{loading ? 'Envoi...' : 'Demander un devis'}</span>
                </button>
              </>
            ) : (
              /* Student form (free or paid) */
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Prenom Nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau scolaire
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Selectionnez...</option>
                    <option value="6eme">6eme</option>
                    <option value="5eme">5eme</option>
                    <option value="4eme">4eme</option>
                    <option value="3eme">3eme (BFEM)</option>
                    <option value="2nde">Seconde</option>
                    <option value="1ere">Premiere</option>
                    <option value="terminale">Terminale (Bac)</option>
                    <option value="universite">Universite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caracteres</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus size={20} />
                  <span>
                    {loading 
                      ? 'Inscription...' 
                      : selectedPlan === 'student' 
                        ? "S'inscrire et payer" 
                        : "S'inscrire gratuitement"
                    }
                  </span>
                </button>
              </>
            )}
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Deja un compte?{' '}
          <Link to="/login" className="text-senegal-green font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

