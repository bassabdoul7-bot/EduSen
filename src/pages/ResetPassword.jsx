import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { Lock, Check, Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for auth state changes (Supabase handles token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session)
        setVerifying(false)
        toast.success('Vous pouvez maintenant changer votre mot de passe')
      } else if (event === 'SIGNED_IN' && session) {
        setSession(session)
        setVerifying(false)
      }
    })

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setVerifying(false)
      } else {
        // Give it a moment for the auth state change to fire
        setTimeout(() => {
          setVerifying(false)
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit avoir au moins 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      toast.error('Erreur: ' + error.message)
    } else {
      toast.success('Mot de passe mis a jour!')
      await supabase.auth.signOut()
      navigate('/login')
    }

    setLoading(false)
  }

  // Show loading while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Verification du lien...</p>
        </div>
      </div>
    )
  }

  // No valid session after verification
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien invalide ou expire</h1>
          <p className="text-gray-600 mb-6">Veuillez demander un nouveau lien de reinitialisation</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Retour a la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-600 mt-2">Choisissez un nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="********"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="********"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check size={20} />
            <span>{loading ? 'Mise a jour...' : 'Mettre a jour'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}