import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, UserPlus, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import BrainLogo from '../components/BrainLogo'

export default function Register() {
  const [step, setStep] = useState(1)
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
      description: 'Decouvrir KanGam',
      features: ['10 messages IA/jour', 'Concours (lecture)', 'Forum'],
    },
    {
      id: 'student',
      name: 'Etudiant',
      icon: '🎓',
      price: '1,000 FCFA/mois',
      description: 'Acces complet',
      features: ['IA illimitee', 'Concours + corriges', 'Bourses', 'Groupes d\'etude'],
      popular: true,
    },
  ]

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.07] border border-white/10 focus:border-senegal-green/50 focus:ring-2 focus:ring-senegal-green/20 outline-none text-sm text-white placeholder-white/25"

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Mot de passe: minimum 6 caracteres')
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
      toast.success('Compte cree! Verifiez votre email.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a1f14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-senegal-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-senegal-yellow/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <BrainLogo size="md" className="justify-center mb-3" />
          <p className="text-white/30 text-xs">
            {step === 1 ? 'Choisissez votre formule' : 'Creez votre compte'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-senegal-green text-white' : 'bg-white/10 text-white/30'}`}>1</div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-senegal-green' : 'bg-white/10'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-senegal-green text-white' : 'bg-white/10 text-white/30'}`}>2</div>
        </div>

        {/* Step 1: Plan */}
        {step === 1 && (
          <div className="space-y-3">
            {plans.map(plan => (
              <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all relative ${
                  selectedPlan === plan.id
                    ? 'bg-senegal-green/10 border-senegal-green/50'
                    : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.08]'
                }`}>
                {plan.popular && (
                  <span className="absolute -top-2 right-3 bg-senegal-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Populaire</span>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{plan.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                      <span className="text-xs font-bold text-senegal-green">{plan.price}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-0.5">{plan.description}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[10px] text-white/50 flex items-center gap-1">
                          <Check size={10} className="text-senegal-green" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button onClick={() => selectedPlan && setStep(2)} disabled={!selectedPlan}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-senegal-green via-senegal-yellow to-senegal-red text-white font-black text-sm shadow-lg disabled:opacity-30 flex items-center justify-center gap-2 mt-4">
              Continuer <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50">
              <ArrowLeft size={14} /> Changer de formule
            </button>

            {/* Plan badge */}
            <div className="bg-senegal-green/10 border border-senegal-green/20 rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl">{plans.find(p => p.id === selectedPlan)?.icon}</span>
              <div>
                <p className="text-xs font-bold text-white">{plans.find(p => p.id === selectedPlan)?.name}</p>
                <p className="text-[10px] text-senegal-green">{plans.find(p => p.id === selectedPlan)?.price}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <>
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className={inputClass} placeholder="Prenom Nom" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className={inputClass} placeholder="votre@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Niveau</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} required
                      className={inputClass.replace('pl-11', 'pl-4') + ' appearance-none'}>
                      <option value="" className="bg-[#0a1f14]">Selectionnez...</option>
                      <option value="6eme" className="bg-[#0a1f14]">6eme</option>
                      <option value="5eme" className="bg-[#0a1f14]">5eme</option>
                      <option value="4eme" className="bg-[#0a1f14]">4eme</option>
                      <option value="3eme" className="bg-[#0a1f14]">3eme (BFEM)</option>
                      <option value="2nde" className="bg-[#0a1f14]">Seconde</option>
                      <option value="1ere" className="bg-[#0a1f14]">Premiere</option>
                      <option value="terminale" className="bg-[#0a1f14]">Terminale (BAC)</option>
                      <option value="universite" className="bg-[#0a1f14]">Universite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className={inputClass} placeholder="••••••••" required minLength={6} />
                    </div>
                    <p className="text-[10px] text-white/20 mt-1">Minimum 6 caracteres</p>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-senegal-green via-senegal-yellow to-senegal-red text-white font-black text-sm shadow-lg disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Inscription...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <UserPlus size={18} /> S'inscrire
                      </span>
                    )}
                  </button>
                </>
            </form>
          </div>
        )}

        <p className="text-center mt-6 text-white/30 text-xs">
          Deja un compte?{' '}
          <Link to="/login" className="text-senegal-green font-bold hover:text-emerald-400">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
