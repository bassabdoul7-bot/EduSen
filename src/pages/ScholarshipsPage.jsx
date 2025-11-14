import { useState, useEffect } from 'react'
import { usePremium } from '../context/PremiumContext'
import { scholarshipsService } from '../services/scholarships'
import { useNavigate } from 'react-router-dom'
import { Crown, Lock, ExternalLink } from 'lucide-react'

export default function ScholarshipsPage() {
  const { isPremium, loading: premiumLoading } = usePremium()
  const navigate = useNavigate()
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isPremium) {
      scholarshipsService.getScholarships().then(({ data }) => {
        if (data) setScholarships(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [isPremium])

  if (premiumLoading || loading) {
    return <div className='text-center py-12'>Loading...</div>
  }

  if (!isPremium) {
    return (
      <div className='max-w-4xl mx-auto text-center card'>
        <Lock size={64} className='mx-auto mb-4 text-gray-400' />
        <h1 className='text-3xl font-bold mb-4'>Premium Only</h1>
        <button onClick={() => navigate('/premium')} className='btn-primary'>
          <Crown size={20} className='inline mr-2' />
          Upgrade to Premium
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Scholarships 🎓</h1>
      <div className='space-y-4'>
        {scholarships.map((s) => (
          <div key={s.id} className='card'>
            <h3 className='text-xl font-bold'>{s.title}</h3>
            <p className='text-gray-600'>{s.organization}</p>
            <p className='mt-2'>{s.description}</p>
            <div className='mt-4'>
              <button
                onClick={() => window.open(s.application_url, '_blank')}
                className='btn-primary inline-flex items-center gap-2'
              >
                Apply <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}