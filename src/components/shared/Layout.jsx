import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Award,
  MessageCircle,
  Mail,
  User,
  LogOut,
  Menu,
  X,
  Crown,
  Heart,
  FlaskConical
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Deconnecte avec succes')
      navigate('/login')
    } else {
      toast.error('Erreur lors de la deconnexion')
    }
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/chatbot', icon: MessageSquare, label: 'Tuteur IA' },
    { path: '/ar-lab', icon: FlaskConical, label: 'Labo Virtuel' },
    { path: '/admissions', icon: GraduationCap, label: 'Admissions' },
    { path: '/scholarships', icon: Award, label: 'Bourses' },
    { path: '/forum', icon: MessageCircle, label: 'Forum' },
    { path: '/messages', icon: Mail, label: 'Messages' },
    { path: '/premium', icon: Crown, label: 'Premium' },
    { path: '/sponsor', icon: Heart, label: 'Sponsor' },
    { path: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold text-senegal-green">EduSen</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {profile?.full_name || 'Etudiant'}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-senegal-red transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Deconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={(sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0 fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg transition-transform duration-300 ease-in-out'}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ' + (
                    isActive
                      ? 'bg-senegal-green text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}