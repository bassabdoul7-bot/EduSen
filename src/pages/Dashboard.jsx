import { useAuth } from '../context/AuthContext'
import { 
  MessageSquare, 
  GraduationCap, 
  Award, 
  MessageCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()

  const quickLinks = [
    {
      title: 'Tuteur IA',
      description: 'Posez vos questions et obtenez de l aide',
      icon: MessageSquare,
      link: '/chatbot',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Admissions',
      description: 'Universités à l étranger',
      icon: GraduationCap,
      link: '/admissions',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Bourses',
      description: 'Trouvez des opportunités',
      icon: Award,
      link: '/scholarships',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Forum',
      description: 'Discutez avec d autres étudiants',
      icon: MessageCircle,
      link: '/forum',
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="card bg-gradient-to-r from-senegal-green to-green-600 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {profile?.full_name || 'Étudiant'}! 👋
        </h1>
        <p className="text-green-100">
          Que souhaitez-vous faire aujourd hui?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={'w-12 h-12 bg-gradient-to-br ' + item.color + ' rounded-lg flex items-center justify-center mb-4'}>
              <item.icon className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-senegal-green" size={24} />
            Vos Statistiques
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Conversations IA</span>
              <span className="font-semibold text-senegal-green">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Bourses sauvegardées</span>
              <span className="font-semibold text-senegal-green">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Posts sur le forum</span>
              <span className="font-semibold text-senegal-green">0</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2 text-senegal-yellow" size={24} />
            Conseils du jour
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                💡 Utilisez le tuteur IA pour obtenir des explications détaillées sur vos devoirs
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700">
                🎓 Vérifiez les nouvelles bourses disponibles chaque semaine
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700">
                👥 Rejoignez le forum pour partager et apprendre avec d autres étudiants
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}