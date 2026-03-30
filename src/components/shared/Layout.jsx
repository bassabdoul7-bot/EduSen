import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, MessageSquare, FlaskConical, FileText, User, Menu, X, LogOut, Crown, Heart, GraduationCap, Award, MessageCircle, Mail, Sparkles, Users, Bell } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNotifications } from '../NotificationProvider'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const { notifications, unreadCount, clearAll } = useNotifications()

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000
    if (diff < 60) return "a l'instant"
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
    return new Date(date).toLocaleDateString('fr-FR')
  }

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
    { path: '/study-groups', icon: Users, label: 'Groupes' },
    { path: '/concours', icon: FileText, label: 'Concours' },
    { path: '/profile', icon: User, label: 'Profil' },
  ]

  const menuItems = [
    // { path: '/ar-lab', icon: FlaskConical, label: 'Labo Virtuel', iconBg: 'bg-emerald-500' },
    { path: '/study-groups', icon: Users, label: 'Groupes d\'Etude', iconBg: 'bg-cyan-500' },
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
    <div className="min-h-screen" style={{paddingBottom: "calc(5rem + env(safe-area-inset-bottom))"}}>

      {/* Floating Buttons - Hidden on chatbot page */}
      {location.pathname !== '/chatbot' && (
        <div className="fixed top-6 right-4 z-50 flex items-center gap-2" style={{top: "calc(env(safe-area-inset-top) + 1.5rem)"}}>
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-10 h-10 rounded-full bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50 flex items-center justify-center shadow-lg hover:bg-emerald-800/80 transition-all"
          >
            <Bell size={18} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-12 h-12 rounded-full bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50 flex items-center justify-center shadow-lg hover:bg-emerald-800/80 transition-all"
          >
            {menuOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
          </button>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifs && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowNotifs(false)} />
          <div className="fixed top-20 right-4 w-80 max-w-[90vw] max-h-[70vh] bg-[#0f2b1a] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{top: "calc(env(safe-area-inset-top) + 4.5rem)"}}>
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={clearAll} className="text-[10px] text-senegal-green font-bold">Tout lire</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={24} className="mx-auto mb-2 text-white/10" />
                  <p className="text-xs text-white/20">Aucune notification</p>
                </div>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <div key={n.id} onClick={() => { navigate('/study-groups'); setShowNotifs(false) }}
                    className={`p-3 border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.05] transition-all ${!n.is_read ? 'bg-white/[0.03]' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5">{n.type === 'message' ? '💬' : '👋'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70">
                          <span className="font-bold text-white">{n.sender_name}</span> {n.content}
                        </p>
                        <p className="text-[10px] text-white/20 mt-0.5">{n.group_name} · {timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-senegal-green flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a1f14] backdrop-blur-md border-t border-emerald-800/20 shadow-2xl" style={{paddingBottom: "env(safe-area-inset-bottom)"}}>
        <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 min-w-0"
              >
                <div className={active ? 'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red shadow-md' : 'w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.08] border border-white/[0.1]'}>
                  <tab.icon size={20} className={active ? 'text-white' : 'text-white/80'} />
                </div>
                <span className={active ? 'text-[10px] font-bold text-yellow-300' : 'text-[10px] font-medium text-white/50'}>{tab.label}</span>
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
