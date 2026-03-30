import { useAuth } from '../context/AuthContext'
import { MessageSquare, ArrowRight, Users, ChevronRight } from 'lucide-react'
import BrainLogo from '../components/BrainLogo'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { studyGroupsService } from '../services/studyGroups'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [popularGroups, setPopularGroups] = useState([])
  const [myGroupCount, setMyGroupCount] = useState(0)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    if (user) loadGroups()
  }, [user])

  async function loadGroups() {
    // Get popular public groups
    const { data: groups } = await supabase
      .from('study_groups')
      .select('*, study_group_members(count)')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(6)

    if (groups) {
      // Sort by member count
      groups.sort((a, b) => (b.study_group_members?.[0]?.count || 0) - (a.study_group_members?.[0]?.count || 0))
      setPopularGroups(groups.slice(0, 3))
    }

    // Check if user is in any groups
    const { data: memberships } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', user.id)
    setMyGroupCount(memberships?.length || 0)
  }

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24 relative overflow-hidden">

      {/* Floating Logo */}
      <div
        className="fixed top-6 left-4 z-50 rounded-2xl bg-[#0a1f14]/90 backdrop-blur-md border border-white/10 shadow-lg px-3 py-1.5"
        style={{top: "calc(env(safe-area-inset-top) + 1.5rem)"}}
      >
        <BrainLogo size="sm" />
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-400/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {!videoError && (
          <video autoPlay loop muted playsInline preload={isMobile ? "none" : "auto"}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}>
            <source src="/videos/hero-education.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a1f14]"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
            Bienvenue, {profile?.full_name?.split(' ')[0] || 'Etudiant'}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 font-medium drop-shadow-lg">
            Rejoignez l'univers KanGam
          </p>
          <Link to="/chatbot">
            <button className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold text-base md:text-lg rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 md:gap-3 mx-auto">
              <MessageSquare size={20} className="md:w-6 md:h-6" />
              <span>Commencer a apprendre</span>
              <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 -mt-12 md:-mt-16 space-y-5">
        <div className="max-w-4xl mx-auto">

          {/* Popular Study Groups */}
          {popularGroups.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" />
                  <h2 className="text-sm font-bold text-white">Groupes populaires</h2>
                </div>
                <Link to="/study-groups" className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5">
                  Voir tout <ChevronRight size={12} />
                </Link>
              </div>

              <div className="space-y-2">
                {popularGroups.map(group => {
                  const subject = studyGroupsService.getSubjectById(group.subject)
                  const count = group.study_group_members?.[0]?.count || 0
                  return (
                    <Link key={group.id} to="/study-groups" className="block">
                      <div className="bg-white/[0.05] rounded-xl p-3.5 border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${subject?.color || 'bg-gray-600'} flex items-center justify-center text-lg flex-shrink-0`}>
                          {subject?.icon || '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white truncate">{group.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/30 flex items-center gap-1"><Users size={10} />{count} membres</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30">{subject?.name}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-white/15 flex-shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Join Groups CTA - only show if user has no groups */}
          {myGroupCount === 0 && (
            <Link to="/study-groups" className="block mb-4">
              <div className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-2xl p-5 border border-cyan-500/20 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">👥</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">Rejoins un groupe d'etude!</h3>
                    <p className="text-white/40 text-xs mt-0.5">Maths, Physique, Medecine... Etudie avec d'autres etudiants, en live video, avec l'IA</p>
                  </div>
                  <ArrowRight size={20} className="text-white/30 flex-shrink-0" />
                </div>
              </div>
            </Link>
          )}

          {/* Already in groups - quick access */}
          {myGroupCount > 0 && (
            <Link to="/study-groups" className="block mb-4">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-4 border border-cyan-500/15 hover:from-cyan-500/15 hover:to-blue-500/15 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xs">Mes groupes d'etude</h3>
                    <p className="text-white/30 text-[10px] mt-0.5">{myGroupCount} groupe{myGroupCount > 1 ? 's' : ''} rejoint{myGroupCount > 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
                </div>
              </div>
            </Link>
          )}

          {/* Quick Access Grid */}
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
