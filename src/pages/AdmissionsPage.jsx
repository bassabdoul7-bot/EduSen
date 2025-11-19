import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { admissionsService } from '../services/admissions'
import { 
  Search, 
  Filter, 
  Globe, 
  BookOpen, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Heart,
  CheckCircle2,
  Lock,
  Crown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdmissionsPage() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  
  const [universities, setUniversities] = useState([])
  const [savedUniversities, setSavedUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countries, setCountries] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadUniversities()
    loadCountries()
    if (isPremium) {
      loadSavedUniversities()
    }
  }, [isPremium])

  const loadUniversities = async () => {
    setLoading(true)
    const { data, error } = await admissionsService.getUniversities({
      search: searchTerm,
      country: selectedCountry
    })
    
    if (!error && data) {
      setUniversities(data)
    }
    setLoading(false)
  }

  const loadCountries = async () => {
    const { data } = await admissionsService.getCountries()
    if (data) setCountries(data)
  }

  const loadSavedUniversities = async () => {
    const { data } = await admissionsService.getSavedUniversities(user.id)
    if (data) {
      setSavedUniversities(data.map(s => s.university_id))
    }
  }

  const handleSearch = () => {
    loadUniversities()
  }

  const handleSaveUniversity = async (universityId) => {
    if (!isPremium) {
      toast.error('Fonctionnalité Premium uniquement!')
      return
    }

    const isSaved = savedUniversities.includes(universityId)
    
    if (isSaved) {
      const { error } = await admissionsService.unsaveUniversity(user.id, universityId)
      if (!error) {
        setSavedUniversities(savedUniversities.filter(id => id !== universityId))
        toast.success('Université retirée des favoris')
      }
    } else {
      const { error } = await admissionsService.saveUniversity(user.id, universityId)
      if (!error) {
        setSavedUniversities([...savedUniversities, universityId])
        toast.success('Université ajoutée aux favoris!')
      }
    }
  }

  if (loading) {
    return (
      <div className='text-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green mx-auto'></div>
        <p className='mt-4 text-gray-600'>Chargement des universités...</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Admissions Internationales 🌍</h1>
          <p className='text-gray-600'>
            Explorez {universities.length} universités à travers le monde
          </p>
        </div>
        {!isPremium && (
          <button
            onClick={() => navigate('/premium')}
            className='btn-primary flex items-center gap-2 whitespace-nowrap'
          >
            <Crown size={20} />
            Premium
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className='card'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Rechercher une université, programme...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className='input-field pl-10'
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='btn-secondary flex items-center gap-2'
          >
            <Filter size={20} />
            Filtres
          </button>
          
          <button
            onClick={handleSearch}
            className='btn-primary'
          >
            Rechercher
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className='mt-4 pt-4 border-t'>
            <div>
              <label className='block text-sm font-medium mb-2'>Pays</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className='input-field'
              >
                <option value=''>Tous les pays</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Universities Grid */}
      {universities.length === 0 ? (
        <div className='card text-center py-12'>
          <Globe size={64} className='mx-auto mb-4 text-gray-300' />
          <h3 className='text-xl font-semibold mb-2'>Aucun résultat trouvé</h3>
          <p className='text-gray-600 mb-4'>
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {universities.map((university) => (
            <div key={university.id} className='card hover:shadow-xl transition-shadow'>
              {/* University Logo */}
              {university.logo_url && (
                <img
                  src={university.logo_url}
                  alt={university.name}
                  className='w-full h-32 object-contain bg-gray-50 rounded-lg mb-4 p-4'
                />
              )}

              {/* University Info */}
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold mb-1'>{university.name}</h3>
                  <p className='text-sm text-gray-600 flex items-center gap-1'>
                    <Globe size={14} />
                    {university.city}, {university.country}
                  </p>
                  {university.ranking && (
                    <p className='text-xs text-senegal-green font-semibold mt-1'>
                      Classement: #{university.ranking}
                    </p>
                  )}
                </div>
                
                {/* Save Button */}
                {isPremium ? (
                  <button
                    onClick={() => handleSaveUniversity(university.id)}
                    className={
                      savedUniversities.includes(university.id)
                        ? 'text-senegal-red'
                        : 'text-gray-400 hover:text-senegal-red'
                    }
                  >
                    <Heart
                      size={24}
                      fill={savedUniversities.includes(university.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                ) : (
                  <Lock size={20} className='text-gray-300' />
                )}
              </div>

              {/* Description */}
              <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                {university.description || 'Aucune description disponible'}
              </p>

              {/* Details */}
              <div className='space-y-2 mb-4'>
                {university.tuition_fees && (
                  <div className='flex items-center gap-2 text-sm'>
                    <DollarSign size={16} className='text-senegal-yellow' />
                    <span>{university.tuition_fees}</span>
                  </div>
                )}
                
                {university.application_deadline && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar size={16} className='text-senegal-green' />
                    <span>Date limite: {new Date(university.application_deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                
                {university.acceptance_rate && (
                  <div className='flex items-center gap-2 text-sm'>
                    <CheckCircle2 size={16} className='text-blue-500' />
                    <span>Acceptation: {university.acceptance_rate}</span>
                  </div>
                )}
                
                {university.popular_programs && university.popular_programs.length > 0 && (
                  <div className='flex items-start gap-2 text-sm'>
                    <BookOpen size={16} className='text-purple-500 mt-0.5' />
                    <div className='flex-1'>
                      <p className='font-semibold mb-1'>Programmes populaires:</p>
                      <div className='flex flex-wrap gap-1'>
                        {university.popular_programs.slice(0, 3).map((program, idx) => (
                          <span key={idx} className='bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded'>
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {university.scholarships_available && (
                  <div className='flex items-center gap-2 text-sm text-senegal-green font-semibold'>
                    ✨ Bourses disponibles
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <button
                  onClick={() => window.open(university.website_url, '_blank')}
                  className='btn-primary flex-1 flex items-center justify-center gap-2'
                >
                  <ExternalLink size={16} />
                  Site web
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}