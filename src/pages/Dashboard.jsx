import { useAuth } from '../context/AuthContext'
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { profile } = useAuth()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24 relative overflow-hidden">

      {/* Floating Logo with Senegal Flag Colors - Aligned with Menu */}
      <div 
        className="fixed top-6 left-4 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-lg backdrop-blur-sm"
        style={{top: "calc(env(safe-area-inset-top) + 1.5rem)"}}
      >
        <Sparkles className="text-white" size={22} />
      </div>

      {/* Hero Section with Video/Gradient */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        
        {/* Fallback Animated Gradient (shows while loading or on error) */}
        <div className={`absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-400/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Video Background - Only load on WiFi or good connection */}
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload={isMobile ? "none" : "auto"}
            poster=""
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              setVideoError(true)
              console.log('Video failed to load, using gradient fallback')
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}
          >
            <source src="/videos/hero-education.mp4" type="video/mp4" />
          </video>
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a1f14]"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl">
          {/* Welcome Text */}
          <h1 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
            Bienvenue, {profile?.full_name?.split(' ')[0] || 'Etudiant'}
          </h1>

          <p className="text-lg md:text-2xl text-white/90 mb-8 font-medium drop-shadow-lg">
            Excellence académique pour le Sénégal 🇸🇳
          </p>

          {/* CTA Button */}
          <Link to="/chatbot">
            <button className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold text-base md:text-lg rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 md:gap-3 mx-auto">
              <MessageSquare size={20} className="md:w-6 md:h-6" />
              <span>Commencer à apprendre</span>
              <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="relative z-10 px-4 -mt-16 md:-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Link to="/concours" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">📝</div>
                <h3 className="text-white font-semibold text-xs md:text-base">Concours</h3>
              </div>
            </Link>

            <Link to="/scholarships" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎓</div>
                <h3 className="text-white font-semibold text-xs md:text-base">Bourses</h3>
              </div>
            </Link>

            <Link to="/admissions" className="group">
              <div className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">✈️</div>
                <h3 className="text-white font-semibold text-xs md:text-base">Admissions</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
