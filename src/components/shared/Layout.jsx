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
    { path: '/concours', icon: FileText, label: 'Concours' },
    { path: '/profile', icon: User, label: 'Profil' },
  ]

  const menuItems = [
    { path: '/ar-lab', icon: FlaskConical, label: 'Labo Virtuel', iconBg: 'bg-emerald-500' },
    { path: '/messages', icon: Mail, label: 'Messages', iconBg: 'bg-blue-500' },
    { path: '/forum', icon: MessageCircle, label: 'Forum', iconBg: 'bg-green-500' },
    { path: '/scholarships', icon: Award, label: 'Bourses', iconBg: 'bg-orange-500' },
    { path: '/admissions', icon: GraduationCap, label: 'Admissions', iconBg: 'bg-purple-500' },
    { path: '/premium', icon: Crown, label: 'Premium', iconBg: 'bg-yellow-500' },
    { path: '/sponsor', icon: Heart, label: 'Sponsor', iconBg: 'bg-pink-500' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleMenuItemClick = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/60 backdrop-blur-md border-b border-white/[0.05]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-sm">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">EduSen</h1>
              <p className="text-xs text-white/60">{profile?.full_name}</p>
            </div>
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center transition-colors"
          >
            {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </header>

      {/* Side Panel Menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          ></div>
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] backdrop-blur-2xl bg-white/20 shadow-2xl z-50 border-l border-white/30 animate-slideInRight overflow-y-auto">
            <div className="p-4 space-y-4">
              
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-senegal-green rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-lg backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                    className="w-full group"
                  >
                    <div className="backdrop-blur-xl bg-white/20 hover:bg-white/30 rounded-xl p-3 border border-white/30 hover:border-white/50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <item.icon size={20} className="text-white" />
                        </div>
                        <span className="flex-1 text-left font-semibold text-gray-900 text-sm">{item.label}</span>
                        <span className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 rounded-xl p-3 border border-red-300/30 hover:border-red-300/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                    <LogOut size={20} className="text-white" />
                  </div>
                  <span className="flex-1 text-left font-semibold text-red-600 text-sm">Déconnexion</span>
                </div>
              </button>

            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/60 backdrop-blur-md border-t border-white/[0.05] shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button 
                key={tab.path} 
                onClick={() => navigate(tab.path)} 
                className="flex flex-col items-center gap-1 px-3 py-2"
              >
                <div className={active ? 'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red shadow-md' : 'w-11 h-11 rounded-xl flex items-center justify-center bg-gray-100'}>
                  <tab.icon size={22} className={active ? 'text-white' : 'text-gray-600'} />
                </div>
                <span className={active ? 'text-xs font-semibold text-senegal-green' : 'text-xs font-medium text-gray-600'}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}




