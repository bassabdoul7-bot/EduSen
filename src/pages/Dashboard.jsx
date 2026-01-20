import { useAuth } from '../context/AuthContext'
import { Sparkles, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
      <div className="fixed top-0 -left-40 w-80 h-80 bg-senegal-green/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="fixed top-0 -right-40 w-80 h-80 bg-senegal-yellow/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-40 left-20 w-80 h-80 bg-senegal-red/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">

        {/* Main Welcome */}
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Salut, {profile?.full_name?.split(' ')[0] || 'Etudiant'}! 👋
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Pret a apprendre aujourd'hui?
          </p>

          {/* Single Featured Card */}
          <Link to="/chatbot" className="block group mb-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 active:scale-95 border border-white/30">
              <div className="text-5xl mb-3">🤖</div>
              <h2 className="text-2xl font-bold text-white mb-2">Pose une question</h2>
              <p className="text-white/90">Ton tuteur IA est pret</p>
            </div>
          </Link>

          {/* Quick Links - Text Only */}
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/concours" className="text-gray-600 hover:text-gray-900 transition-colors">
              📝 Concours
            </Link>
            <Link to="/scholarships" className="text-gray-600 hover:text-gray-900 transition-colors">
              🎓 Bourses
            </Link>
            <Link to="/ar-lab" className="text-gray-600 hover:text-gray-900 transition-colors">
              🧪 Labo
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}