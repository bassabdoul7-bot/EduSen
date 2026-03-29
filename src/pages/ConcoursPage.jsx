import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { usePlan } from '../hooks/usePlan'
import { useAuth } from '../context/AuthContext'
import SecurePDFViewer from '../components/SecurePDFViewer'
import { groqService } from '../services/groq'
import {
  Search, FileText, CheckCircle, Lock, Brain, ChevronRight,
  ArrowLeft, Eye, BookOpen, Sparkles, Filter, Clock, Award,
  ChevronDown, X, Bookmark, BookMarked, Upload
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const LEVEL_CONFIG = {
  cm2: { label: 'CFEE/CM2', color: 'bg-emerald-500', textColor: 'text-emerald-400', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  bfem: { label: 'BFEM', color: 'bg-blue-500', textColor: 'text-blue-400', bgLight: 'bg-blue-500/10', border: 'border-blue-500/20' },
  bac: { label: 'BAC', color: 'bg-purple-500', textColor: 'text-purple-400', bgLight: 'bg-purple-500/10', border: 'border-purple-500/20' },
  licence: { label: 'Concours', color: 'bg-orange-500', textColor: 'text-orange-400', bgLight: 'bg-orange-500/10', border: 'border-orange-500/20' },
}

const ADMIN_EMAILS = ['sales@getagenter.com', 'daouda15@hotmail.com', 'bassabdoul7@gmail.com']

export default function ConcoursPage() {
  const { canAccessExamPrep } = usePlan()
  const { user } = useAuth()
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())

  const [view, setView] = useState('list') // list | school | prediction
  const [schools, setSchools] = useState([])
  const [papers, setPapers] = useState([])
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState(null)

  // PDF Viewer
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState(null)

  // Prediction
  const [generating, setGenerating] = useState(false)
  const [prediction, setPrediction] = useState(null)

  // Bookmarks
  const [bookmarked, setBookmarked] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [schoolsRes, papersRes] = await Promise.all([
      supabase.from('concours_schools').select('*').eq('is_active', true).order('name'),
      supabase.from('concours_papers').select('*').order('year', { ascending: false }),
    ])
    setSchools(schoolsRes.data || [])
    setPapers(papersRes.data || [])
    setLoading(false)
  }

  function getSchoolPapers(code) {
    return papers.filter(p => p.school_code === code)
  }

  function groupByYear(schoolPapers) {
    const grouped = {}
    schoolPapers.forEach(p => {
      if (!grouped[p.year]) grouped[p.year] = { epreuve: null, corrige: null }
      grouped[p.year][p.paper_type] = p
    })
    return grouped
  }

  function openSchool(school) {
    setSelectedSchool(school)
    setPrediction(null)
    setView('school')
  }

  function openPDF(paper) {
    if (!user) { toast.error('Connectez-vous pour acceder aux documents'); return }
    if (!canAccessExamPrep) { toast.error('Abonnement requis pour acceder aux documents'); return }
    setSelectedPaper(paper)
    setViewerOpen(true)
  }

  function toggleBookmark(code) {
    setBookmarked(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])
  }

  const currentYear = new Date().getFullYear()

  async function generatePrediction() {
    if (!selectedSchool) return
    setGenerating(true)
    setPrediction(null)

    const prompt = `Tu es un expert des examens et concours senegalais avec 20 ans d'experience dans le systeme educatif du Senegal.

Concours: ${selectedSchool.code} - ${selectedSchool.name}
Niveau: ${LEVEL_CONFIG[selectedSchool.level]?.label || selectedSchool.level}
Matieres: ${selectedSchool.subjects?.join(', ') || 'Toutes'}

Analyse les tendances des 5 dernieres annees de ce concours senegalais et genere des predictions pour la session ${currentYear}.

Base ton analyse sur:
- Le programme officiel senegalais pour ce niveau
- Les themes recurrents dans les annees precedentes
- L'actualite du Senegal et de l'Afrique de l'Ouest
- Les reformes educatives recentes au Senegal
- Les orientations du Ministere de l'Education nationale

Genere une reponse structuree avec:
1. ANALYSE: Resume des tendances observees (3-4 phrases)
2. THEMES PROBABLES: Pour chaque matiere, 3 themes probables avec justification
3. QUESTIONS TYPES: 3-5 questions probables avec niveau de difficulte
4. CONSEILS: 4-5 conseils de revision specifiques

Reponds en francais, de maniere detaillee et pedagogique.`

    const result = await groqService.chat([{ role: 'user', content: prompt }], selectedSchool.subjects?.[0]?.toLowerCase() || 'general')

    if (result.content) {
      setPrediction(result.content)
    } else {
      toast.error("Erreur de generation. Reessayez.")
    }
    setGenerating(false)
  }

  // Filtered schools
  const filtered = schools.filter(s => {
    if (filterLevel && s.level !== filterLevel) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return s.code.toLowerCase().includes(term) || s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term)
    }
    return true
  })

  // Group by level
  const grouped = {}
  filtered.forEach(s => {
    const lvl = s.level || 'other'
    if (!grouped[lvl]) grouped[lvl] = []
    grouped[lvl].push(s)
  })

  // ============ LIST VIEW ============

  const renderList = () => (
    <div className="space-y-5 p-4 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Concours du Senegal</h1>
          <p className="text-xs text-white/40 mt-1">Epreuves, corriges et predictions IA pour {currentYear}</p>
        </div>
        {isAdmin && (
          <Link to="/admin/upload" className="p-2.5 rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-all">
            <Upload size={18} className="text-white/50" />
          </Link>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <div className="flex-shrink-0 bg-white/[0.05] rounded-xl px-4 py-2.5 border border-white/[0.08]">
          <p className="text-lg font-black text-white">{schools.length}</p>
          <p className="text-[9px] text-white/30 font-semibold">Concours</p>
        </div>
        <div className="flex-shrink-0 bg-white/[0.05] rounded-xl px-4 py-2.5 border border-white/[0.08]">
          <p className="text-lg font-black text-white">{papers.length}</p>
          <p className="text-[9px] text-white/30 font-semibold">Documents</p>
        </div>
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl px-4 py-2.5 border border-purple-500/20">
          <p className="text-lg font-black text-purple-400">{currentYear}</p>
          <p className="text-[9px] text-white/30 font-semibold">Predictions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input type="text" placeholder="Rechercher un concours..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 focus:border-senegal-green/50 outline-none text-sm text-white placeholder-white/25" />
      </div>

      {/* Level Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setFilterLevel(null)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${!filterLevel ? 'bg-senegal-green text-white' : 'bg-white/[0.07] text-white/50 border border-white/10'}`}>
          Tous
        </button>
        {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterLevel(filterLevel === key ? null : key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filterLevel === key ? `${cfg.color} text-white` : 'bg-white/[0.07] text-white/50 border border-white/10'}`}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Schools List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-senegal-green"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/40 text-sm">Aucun concours trouve</p>
        </div>
      ) : (
        Object.entries(grouped).map(([level, levelSchools]) => {
          const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.licence
          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-5 rounded-full ${cfg.color}`} />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{cfg.label}</p>
                <span className="text-[10px] text-white/20">({levelSchools.length})</span>
              </div>

              {levelSchools.map(school => {
                const paperCount = getSchoolPapers(school.code).length
                const isBookmarked = bookmarked.includes(school.code)
                return (
                  <div key={school.code} onClick={() => openSchool(school)}
                    className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${cfg.bgLight} ${cfg.border} border flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-black ${cfg.textColor}`}>{school.code.substring(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm truncate">{school.code}</h3>
                          {paperCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-senegal-green/20 text-emerald-400 font-bold">{paperCount} PDF</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/40 mt-0.5 truncate">{school.name}</p>
                      </div>
                      <ChevronRight size={18} className="text-white/15 group-hover:text-white/30 flex-shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )

  // ============ SCHOOL VIEW ============

  const renderSchool = () => {
    if (!selectedSchool) return null
    const cfg = LEVEL_CONFIG[selectedSchool.level] || LEVEL_CONFIG.licence
    const schoolPapers = getSchoolPapers(selectedSchool.code)
    const byYear = groupByYear(schoolPapers)
    const years = Object.keys(byYear).sort((a, b) => b - a)

    return (
      <div className="space-y-4 p-4 pt-4">
        {/* Back + Header */}
        <div className="flex items-start gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-white/10 mt-0.5">
            <ArrowLeft size={18} className="text-white/60" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{selectedSchool.code}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bgLight} ${cfg.textColor} font-bold`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">{selectedSchool.name}</p>
          </div>
        </div>

        {/* Description */}
        {selectedSchool.description && (
          <p className="text-xs text-white/50 leading-relaxed bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">{selectedSchool.description}</p>
        )}

        {/* Subjects */}
        {selectedSchool.subjects?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {selectedSchool.subjects.map((s, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/40 font-medium">{s}</span>
            ))}
          </div>
        )}

        {/* Prediction CTA */}
        <button onClick={() => { setView('prediction'); generatePrediction() }}
          className="w-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20 hover:from-purple-500/15 hover:to-blue-500/15 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Prediction IA {currentYear}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Sujets probables bases sur le programme senegalais</p>
            </div>
            <Sparkles size={16} className="text-purple-400/50" />
          </div>
        </button>

        {/* Papers */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
            Anciennes epreuves ({schoolPapers.length})
          </p>

          {years.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <FileText size={36} className="mx-auto mb-3 text-white/10" />
              <p className="text-xs text-white/30 font-semibold">Pas encore d'epreuves</p>
              <p className="text-[10px] text-white/20 mt-1">Les documents seront bientot ajoutes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {years.map(year => {
                const docs = byYear[year]
                return (
                  <div key={year} className="bg-white/[0.04] rounded-xl border border-white/[0.08] overflow-hidden">
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${cfg.bgLight} ${cfg.textColor}`}>{year}</span>
                      <span className="text-xs text-white/50 font-semibold">Session {year}</span>
                    </div>

                    <div className="p-3 space-y-2">
                      {docs.epreuve && (
                        <button onClick={() => openPDF(docs.epreuve)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all text-left group">
                          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">Epreuve {year}</p>
                            <p className="text-[10px] text-white/25">{docs.epreuve.duration_minutes ? `${docs.epreuve.duration_minutes} min` : 'PDF securise'}</p>
                          </div>
                          <Eye size={14} className="text-white/20 group-hover:text-emerald-400" />
                        </button>
                      )}

                      {docs.corrige && (
                        <button onClick={() => openPDF(docs.corrige)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all text-left group">
                          <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={16} className="text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">Corrige {year}</p>
                            <p className="text-[10px] text-white/25">Avec explications</p>
                          </div>
                          <Eye size={14} className="text-white/20 group-hover:text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ PREDICTION VIEW ============

  const renderPrediction = () => (
    <div className="space-y-4 p-4 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('school')} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-white/60" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-purple-400" />
            <h1 className="text-lg font-black text-white">Prediction {currentYear}</h1>
          </div>
          <p className="text-[10px] text-white/40">{selectedSchool?.code} - {selectedSchool?.name}</p>
        </div>
      </div>

      {!canAccessExamPrep ? (
        <div className="bg-orange-500/10 rounded-xl p-5 border border-orange-500/20 text-center">
          <Lock size={32} className="mx-auto mb-3 text-orange-400" />
          <p className="text-sm font-bold text-white mb-1">Fonctionnalite Premium</p>
          <p className="text-xs text-white/40 mb-4">Les predictions IA sont reservees aux abonnes</p>
          <Link to="/pricing" className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-senegal-green to-emerald-600 text-white text-xs font-bold">
            Voir les offres
          </Link>
        </div>
      ) : generating ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm font-semibold">Analyse en cours...</p>
          <p className="text-white/30 text-xs mt-1">L'IA examine le programme senegalais et les tendances</p>
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          {/* Prediction Badge */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Prediction IA - Session {currentYear}</span>
            </div>
            <p className="text-xs text-white/40">{selectedSchool?.subjects?.join(' · ')}</p>
          </div>

          {/* Prediction Content */}
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08]">
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                {prediction}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 rounded-xl p-3 border border-yellow-500/10">
            <p className="text-[10px] text-yellow-400/60 leading-relaxed">
              Ces predictions sont generees par IA a titre indicatif. Elles sont basees sur l'analyse des tendances du programme senegalais. Revisez l'ensemble du programme officiel pour une preparation complete.
            </p>
          </div>

          {/* Regenerate */}
          <button onClick={generatePrediction} className="w-full py-3 rounded-xl border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/10 transition-all">
            Regenerer les predictions
          </button>
        </div>
      ) : (
        <div className="text-center py-16">
          <Brain size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/40 text-sm">Erreur de chargement</p>
          <button onClick={generatePrediction} className="mt-4 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-bold">
            Reessayer
          </button>
        </div>
      )}
    </div>
  )

  // ============ MAIN ============

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24">
      {view === 'school' ? renderSchool() :
       view === 'prediction' ? renderPrediction() :
       renderList()}

      {viewerOpen && selectedPaper && (
        <SecurePDFViewer
          fileUrl={selectedPaper.file_url}
          fileName={`${selectedPaper.school_code}_${selectedPaper.year}_${selectedPaper.paper_type}`}
          user={user}
          onClose={() => { setViewerOpen(false); setSelectedPaper(null) }}
        />
      )}
    </div>
  )
}
