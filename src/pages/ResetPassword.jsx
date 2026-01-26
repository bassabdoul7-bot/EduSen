import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { Lock, Check } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we have access token in URL (Supabase adds it)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (!accessToken) {
      // No token, check if already logged in via recovery
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast.error('Lien invalide ou expire')
          navigate('/login')
        }
      })
    }
  }, [navigate])

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
      navigate('/login')
    }
    
    setLoading(false)
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