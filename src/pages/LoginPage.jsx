import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    
    if (error) {
      toast.error('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      toast.success('Connexion réussie!')
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='flex items-center space-x-2 justify-center mb-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red rounded-lg flex items-center justify-center'>
              <Star size={28} className='text-white fill-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-senegal-green mb-2'>EduSen</h1>
          <p className='text-gray-600'>Votre plateforme éducative sénégalaise</p>
        </div>

        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='votre@email.com'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Mot de passe
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-senegal-green to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50'
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className='mt-6 text-center space-y-2'>
          <p className='text-sm text-gray-600'>
            Pas encore de compte?{' '}
            <Link to='/register' className='text-senegal-green font-semibold hover:underline'>
              S'inscrire
            </Link>
          </p>
          <Link to='/forgot-password' className='text-sm text-gray-500 hover:text-senegal-green block'>
            Mot de passe oublié?
          </Link>
        </div>

        <div className='mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <p className='text-sm font-semibold text-gray-700 mb-2'>🎓 Compte de démonstration:</p>
          <p className='text-xs text-gray-600'>Email: demo@edusen.sn</p>
          <p className='text-xs text-gray-600'>Mot de passe: Demo123!</p>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500'>
            Jamm ak jamm 🇸🇳 • Made with ❤️ for Senegalese students
          </p>
        </div>
      </div>
    </div>
  )
}