import { useAuth } from '../context/AuthContext'
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()
  
  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24 relative overflow-hidden">
      
      {/* Video Background Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/videos/hero-education.mp4" type="video/mp4" />
          {/* Fallback gradient if video doesn't load */}
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a1f14]"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl">
          {/* Logo/Brand */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-2xl">
              <Sparkles className="text-white" size={40} />
            </div>
          </div>
          
          {/* Welcome Text */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
            Bienvenue, {profile?.full_name?.split(' ')[0] || 'Etudiant'}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium drop-shadow-lg">
            Excellence académique pour le Sénégal 🇸🇳
          </p>
          
          {/* CTA Button */}
          <Link to="/chatbot">
            <button className="group px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold text-lg rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto">
              <MessageSquare size={24} />
              <span>Commencer à apprendre</span>
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
      
      {/* Quick Access Section */}
      <div className="relative z-10 px-4 -mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <Link to="/concours" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-white font-semibold text-sm md:text-base">Concours</h3>
              </div>
            </Link>
            
            <Link to="/scholarships" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-white font-semibold text-sm md:text-base">Bourses</h3>
              </div>
            </Link>
            
            <Link to="/admissions" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-3">✈️</div>
                <h3 className="text-white font-semibold text-sm md:text-base">Admissions</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  )
}