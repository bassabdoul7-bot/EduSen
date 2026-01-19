import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, MessageSquare, FlaskConical, FileText, User, Menu, X, LogOut, Crown, Heart, GraduationCap, Award, MessageCircle, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Déconnecté')
      navigate('/login')
    }
  }

  const mainTabs = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/chatbot', icon: MessageSquare, label: 'Tuteur' },
    { path: '/ar-lab', icon: FlaskConical, label: 'Labo' },
    { path: '/concours', icon: FileText, label: 'Concours' },
    { path: '/profile', icon: User, label: 'Profil' },
  ]

  const menuItems = [
    { path: '/admissions', icon: GraduationCap, label: 'Admissions' },
    { path: '/scholarships', icon: Award, label: 'Bourses' },
    { path: '/forum', icon: MessageCircle, label: 'Forum' },
    { path: '/messages', icon: Mail, label: 'Messages' },
    { path: '/premium', icon: Crown, label: 'Premium' },
    { path: '/sponsor', icon: Heart, label: 'Sponsor' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-200/30 via-pink-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-senegal-green to-senegal-red bg-clip-text text-transparent">EduSen</h1>
              <p className="text-xs text-gray-600">{profile?.full_name}</p>
            </div>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main className="relative z-10"><Outlet /></main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-white/80 border-t border-white/20 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} className="flex flex-col items-center gap-1 px-3 py-2">
                <div className={active ? 'w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg' : 'w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100'}>
                  <tab.icon size={22} className={active ? 'text-white' : 'text-gray-600'} />
                </div>
                <span className={active ? 'text-xs font-medium text-purple-600' : 'text-xs font-medium text-gray-600'}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
