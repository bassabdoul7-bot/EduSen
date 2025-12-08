import { useState, useEffect } from 'react'
import { scholarshipsService } from '../services/scholarships'
import { usePlan } from '../hooks/usePlan'
import { Link } from 'react-router-dom'
import { Crown, Lock, ExternalLink, GraduationCap } from 'lucide-react'

export default function ScholarshipsPage() {
  const { canAccessScholarships, plan } = usePlan()
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (canAccessScholarships) {
      scholarshipsService.getScholarships().then(({ data }) => {
        if (data) setScholarships(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [canAccessScholarships])

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  // Show upgrade prompt for non-subscribers
  if (!canAccessScholarships) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-purple-200">
          <Lock size={64} className="mx-auto mb-4 text-purple-400" />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Portail Bourses</h1>
          <p className="text-gray-600 mb-6">
            Accedez a des centaines de bourses pour etudier au Senegal et a l'etranger.
            Disponible avec l'abonnement Etudiant.
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            <GraduationCap size={20} />
            Voir les offres
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <GraduationCap className="text-purple-600" />
        Bourses d'etudes
      </h1>
      
      {scholarships.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune bourse disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((s) => (
            <div key={s.id} className="card hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-purple-600 font-medium">{s.organization}</p>
                </div>
                {s.deadline && (
                  <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                    Date limite: {new Date(s.deadline).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              <p className="mt-3 text-gray-600">{s.description}</p>
              {s.link && (
                <a 
                  href={s.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-700"
                >
                  Postuler <ExternalLink size={16} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
