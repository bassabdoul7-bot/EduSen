import { useAuth } from '../context/AuthContext'
import { MessageSquare, GraduationCap, Award, FlaskConical, FileText, Sparkles, Crown, ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()

  const quickLinks = [
    {
      title: 'Tuteur IA',
      description: 'Posez vos questions',
      icon: MessageSquare,
      link: '/chatbot',
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Labo Virtuel',
      description: '50+ expériences 3D',
      icon: FlaskConical,
      link: '/ar-lab',
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'Concours',
      description: 'Épreuves et prédictions IA',
      icon: FileText,
      link: '/concours',
      iconBg: 'bg-orange-500',
    },
    {
      title: 'Bourses',
      description: 'Trouvez des opportunités',
      icon: Award,
      link: '/scholarships',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Admissions',
      description: 'Universites a l etranger',
      icon: GraduationCap,
      link: '/admissions',
      iconBg: 'bg-indigo-500',
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden pb-36">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
      <div className="fixed top-0 -left-40 w-80 h-80 bg-senegal-green/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="fixed top-0 -right-40 w-80 h-80 bg-senegal-yellow/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-40 left-20 w-80 h-80 bg-senegal-red/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-5">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl border border-white/50 shadow-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-senegal-green via-senegal-yellow to-senegal-red flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Salut, {profile?.full_name?.split(' ')[0] || 'Étudiant'}! 👋
              </h1>
              <p className="text-gray-700 text-sm">Prêt à apprendre aujourd'hui?</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="text-purple-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Mes Outils</h2>
          </div>

          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.link} to={link.link} className="block group">
                <div className="backdrop-blur-xl bg-white/30 hover:bg-white/50 rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl p-4 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <link.icon size={26} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{link.title}</h3>
                      <p className="text-sm text-gray-700">{link.description}</p>
                    </div>
                    <ArrowRight className="text-gray-500 group-hover:text-gray-700 group-hover:translate-x-2 transition-all" size={22} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/90 to-blue-600/90 rounded-3xl border border-white/30 shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
              <Crown className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-xl mb-1">Passe à Premium! 👑</h3>
              <p className="text-white/95 text-sm mb-4">Accès illimité au tuteur IA, laboratoire complet et plus encore!</p>
              <Link to="/premium" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-600 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Découvrir Premium
                <ArrowRight size={16} />
              </Link>
            </div>
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
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}