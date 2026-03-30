import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'
import BrainLogo from '../components/BrainLogo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Email ou mot de passe incorrect')
    } else {
      toast.success('Connexion reussie!')
      navigate('/')
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Entrez votre email'); return }
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://edusen.netlify.app/reset-password'
    })
    if (error) toast.error('Erreur: ' + error.message)
    else { toast.success('Email de reinitialisation envoye!'); setShowForgotPassword(false) }
    setResetLoading(false)
  }

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.07] border border-white/10 focus:border-senegal-green/50 focus:ring-2 focus:ring-senegal-green/20 outline-none text-sm text-white placeholder-white/25"

  return (
    <div className="min-h-screen bg-[#0a1f14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-senegal-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-senegal-yellow/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <BrainLogo size="lg" className="justify-center mb-4" />
          <p className="text-white/30 text-xs">Excellence academique pour le Senegal</p>
        </div>

        {showForgotPassword ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Mot de passe oublie?</h2>
              <p className="text-xs text-white/40">Entrez votre email pour recevoir un lien de reinitialisation</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} placeholder="votre@email.com" required />
              </div>

              <button type="submit" disabled={resetLoading}
                className="w-full py-3.5 rounded-xl bg-senegal-green text-white font-bold text-sm disabled:opacity-50 hover:bg-emerald-600 transition-all">
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

              <button type="button" onClick={() => setShowForgotPassword(false)}
                className="w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 transition-all">
                <ArrowLeft size={16} /> Retour a la connexion
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputClass} placeholder="votre@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputClass} placeholder="••••••••" required />
                </div>
              </div>

              <div className="text-right">
                <button type="button" onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-senegal-green hover:text-emerald-400 transition-all">
                  Mot de passe oublie?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-senegal-green via-senegal-yellow to-senegal-red text-white font-black text-sm shadow-lg disabled:opacity-50 hover:shadow-xl transition-all">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={18} /> Se connecter
                  </span>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-white/30 text-xs">
                Pas encore de compte?{' '}
                <Link to="/register" className="text-senegal-green font-bold hover:text-emerald-400 transition-all">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
