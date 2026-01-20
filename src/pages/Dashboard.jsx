import { useAuth } from '../context/AuthContext'
import { MessageSquare, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function Dashboard() {
  const { profile } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 pb-24 relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
        <div className="text-center max-w-md w-full">
          {/* Bold Welcome */}
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Salut, {profile?.full_name?.split(' ')[0] || 'Etudiant'}! 👋
            </h1>
            <p className="text-emerald-300 text-lg">Pret a apprendre aujourd'hui?</p>
          </div>
          {/* Glass Hero Card */}
          <Link to="/chatbot" className="block group mb-8">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-sm bg-white/[0.02] border border-white/[0.08] p-10 shadow-2xl hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] active:scale-98">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="text-7xl mb-4">🤖</div>
                <h2 className="text-4xl font-black text-white mb-2 leading-tight">Pose une question</h2>
                <p className="text-emerald-200 text-lg">Ton tuteur IA est pret</p>
              </div>
            </div>
          </Link>
          {/* Glass Quick Access Icons */}
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/concours" className="flex flex-col items-center gap-2 text-emerald-200 hover:text-white transition-colors group">
              <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/[0.08] hover:bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-all">
                📝
              </div>
              <span className="font-semibold">Concours</span>
            </Link>
            <Link to="/scholarships" className="flex flex-col items-center gap-2 text-emerald-200 hover:text-white transition-colors group">
              <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/[0.08] hover:bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-all">
                🎓
              </div>
              <span className="font-semibold">Bourses</span>
            </Link>
            <Link to="/admissions" className="flex flex-col items-center gap-2 text-emerald-200 hover:text-white transition-colors group">
              <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/[0.08] hover:bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-all">
                ✈️
              </div>
              <span className="font-semibold">Admissions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}