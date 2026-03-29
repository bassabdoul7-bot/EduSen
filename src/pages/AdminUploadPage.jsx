import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { Upload, FileText, CheckCircle, Trash2, ArrowLeft, Plus, X, FolderOpen, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ADMIN_EMAILS = ['sales@getagenter.com', 'daouda15@hotmail.com']

export default function AdminUploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [schools, setSchools] = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)

  // Upload form
  const [selectedSchool, setSelectedSchool] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [paperType, setPaperType] = useState('epreuve')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Drag state
  const [dragOver, setDragOver] = useState(false)

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())

  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [isAdmin])

  async function loadData() {
    setLoading(true)
    const [s, p] = await Promise.all([
      supabase.from('concours_schools').select('*').eq('is_active', true).order('code'),
      supabase.from('concours_papers').select('*').order('year', { ascending: false }),
    ])
    setSchools(s.data || [])
    setPapers(p.data || [])
    setLoading(false)
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped)
    } else {
      toast.error('Fichier PDF uniquement')
    }
  }

  function handleFileSelect(e) {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  async function handleUpload() {
    if (!selectedSchool || !year || !file) {
      toast.error('Selectionnez un concours, une annee et un fichier')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Upload en cours...')

    try {
      // 1. Upload PDF to Supabase Storage
      const fileName = `${selectedSchool}_${year}_${paperType}.pdf`
      const filePath = `${selectedSchool}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('concours')
        .upload(filePath, file, { contentType: 'application/pdf', upsert: true })

      if (uploadError) throw uploadError

      // 2. Check if entry already exists
      const { data: existing } = await supabase
        .from('concours_papers')
        .select('id')
        .eq('school_code', selectedSchool)
        .eq('year', parseInt(year))
        .eq('paper_type', paperType)
        .single()

      if (existing) {
        // Update existing
        await supabase
          .from('concours_papers')
          .update({
            file_url: filePath,
            duration_minutes: duration ? parseInt(duration) : null,
            description: description || null,
          })
          .eq('id', existing.id)
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('concours_papers')
          .insert({
            school_code: selectedSchool,
            year: parseInt(year),
            paper_type: paperType,
            file_url: filePath,
            duration_minutes: duration ? parseInt(duration) : null,
            description: description || null,
          })

        if (insertError) throw insertError
      }

      toast.success(`${paperType === 'epreuve' ? 'Epreuve' : 'Corrige'} ${selectedSchool} ${year} uploade!`, { id: toastId })

      // Reset form
      setFile(null)
      setDescription('')
      setDuration('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadData()

    } catch (err) {
      console.error('Upload error:', err)
      toast.error(`Erreur: ${err.message}`, { id: toastId })
    }

    setUploading(false)
  }

  async function deletePaper(paper) {
    if (!confirm(`Supprimer ${paper.school_code} ${paper.year} ${paper.paper_type}?`)) return

    // Delete from storage
    await supabase.storage.from('concours').remove([paper.file_url])

    // Delete from DB
    await supabase.from('concours_papers').delete().eq('id', paper.id)

    toast.success('Supprime')
    loadData()
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-black text-white mb-2">Acces refuse</h2>
          <p className="text-white/40 text-sm mb-6">Cette page est reservee aux administrateurs</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl bg-senegal-green text-white text-sm font-bold">
            Retour a l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-senegal-green"></div>
      </div>
    )
  }

  // Group papers by school
  const papersBySchool = {}
  papers.forEach(p => {
    if (!papersBySchool[p.school_code]) papersBySchool[p.school_code] = []
    papersBySchool[p.school_code].push(p)
  })

  const currentYears = []
  for (let y = new Date().getFullYear(); y >= 2000; y--) currentYears.push(y)

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24">
      <div className="p-4 pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/concours')} className="p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft size={18} className="text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Admin - Upload Concours</h1>
            <p className="text-[10px] text-white/40">{papers.length} documents · {schools.length} concours</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/[0.05] rounded-2xl p-5 border border-white/[0.08] space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload size={16} className="text-senegal-green" />
            Uploader un document
          </h2>

          {/* School Select */}
          <div>
            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Concours *</label>
            <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white outline-none focus:border-senegal-green/50 appearance-none">
              <option value="" className="bg-[#0a1f14]">-- Selectionnez --</option>
              {schools.map(s => (
                <option key={s.code} value={s.code} className="bg-[#0a1f14]">{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Year + Type */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Annee *</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white outline-none focus:border-senegal-green/50 appearance-none">
                {currentYears.map(y => (
                  <option key={y} value={y} className="bg-[#0a1f14]">{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Type *</label>
              <div className="flex gap-2">
                <button onClick={() => setPaperType('epreuve')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${paperType === 'epreuve' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/[0.05] border-white/10 text-white/40'}`}>
                  Epreuve
                </button>
                <button onClick={() => setPaperType('corrige')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${paperType === 'corrige' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/[0.05] border-white/10 text-white/40'}`}>
                  Corrige
                </button>
              </div>
            </div>
          </div>

          {/* Duration + Description */}
          <div className="flex gap-3">
            <div className="w-28">
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Duree (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="120"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-senegal-green/50" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Note</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: 1er groupe"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-senegal-green/50" />
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-senegal-green bg-senegal-green/10' :
              file ? 'border-green-500/30 bg-green-500/5' :
              'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={24} className="text-green-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">{file.name}</p>
                  <p className="text-[10px] text-white/30">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-senegal-green' : 'text-white/20'}`} />
                <p className="text-xs text-white/40 font-semibold">Glissez un PDF ici ou cliquez</p>
                <p className="text-[10px] text-white/20 mt-1">PDF uniquement</p>
              </>
            )}
          </div>

          {/* Upload Button */}
          <button onClick={handleUpload} disabled={uploading || !file || !selectedSchool}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-senegal-green to-emerald-600 text-white font-black text-sm shadow-lg disabled:opacity-30 transition-all">
            {uploading ? 'Upload en cours...' : `Uploader ${paperType === 'epreuve' ? "l'epreuve" : 'le corrige'}`}
          </button>
        </div>

        {/* Quick Upload Tips */}
        <div className="bg-blue-500/5 rounded-xl p-3.5 border border-blue-500/10">
          <p className="text-[10px] font-bold text-blue-400 mb-1">Astuce: Upload rapide</p>
          <p className="text-[10px] text-white/30 leading-relaxed">
            1. Selectionnez le concours et l'annee{'\n'}
            2. Choisissez Epreuve ou Corrige{'\n'}
            3. Glissez le PDF — c'est uploade!{'\n'}
            4. Changez l'annee/type et recommencez
          </p>
        </div>

        {/* Existing Papers */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">
            Documents uploades ({papers.length})
          </p>

          {papers.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <FolderOpen size={36} className="mx-auto mb-3 text-white/10" />
              <p className="text-xs text-white/30">Aucun document</p>
            </div>
          ) : (
            <div className="space-y-2">
              {papers.map(paper => (
                <div key={paper.id} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paper.paper_type === 'epreuve' ? 'bg-red-500/15' : 'bg-green-500/15'}`}>
                    {paper.paper_type === 'epreuve' ?
                      <FileText size={16} className="text-red-400" /> :
                      <CheckCircle size={16} className="text-green-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{paper.school_code} - {paper.year}</p>
                    <p className="text-[10px] text-white/30 capitalize">{paper.paper_type}{paper.duration_minutes ? ` · ${paper.duration_minutes}min` : ''}{paper.description ? ` · ${paper.description}` : ''}</p>
                  </div>
                  <button onClick={() => deletePaper(paper)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
