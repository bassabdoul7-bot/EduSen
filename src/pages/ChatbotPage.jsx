import { useState, useEffect, useRef } from 'react'
import { FeatureGate } from '../components/FeatureGate'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { chatService } from '../services/chat'
import {
  Send, Loader2, Crown, Camera, FileText, Download, Trash2,
  MessageSquarePlus, Clock, Mic, MicOff, Volume2, VolumeX,
  Brain, Zap, HelpCircle, BookOpen, ArrowLeft, X, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx'
import { jsPDF } from 'jspdf'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const SUBJECTS = [
  { id: 'math', name: 'Maths', icon: '📐' },
  { id: 'physics', name: 'Physique', icon: '⚛️' },
  { id: 'chemistry', name: 'Chimie', icon: '🧪' },
  { id: 'biology', name: 'SVT', icon: '🧬' },
  { id: 'french', name: 'Francais', icon: '📖' },
  { id: 'english', name: 'Anglais', icon: '🇬🇧' },
  { id: 'history', name: 'Histoire-Geo', icon: '🌍' },
  { id: 'philosophy', name: 'Philo', icon: '💭' },
  { id: 'economics', name: 'Economie', icon: '💰' },
  { id: 'programming', name: 'Code', icon: '💻' },
  { id: 'medicine', name: 'Medecine', icon: '⚕️' },
  { id: 'general', name: 'General', icon: '💬' }
]

const MODES = [
  { id: 'tutor', name: 'Tuteur', icon: Brain, desc: 'Cours et explications' },
  { id: 'solver', name: 'Resoudre', icon: Zap, desc: 'Resoudre un exercice' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, desc: 'Tester mes connaissances' },
]

export default function ChatbotPage() {
  const { user, profile } = useAuth()
  const { isPremium, checkCanSendMessage, incrementMessageCount } = usePremium()

  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0])
  const [mode, setMode] = useState('tutor')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [messageCount, setMessageCount] = useState(0)

  // UI state
  const [showSubjects, setShowSubjects] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showModes, setShowModes] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadAllConversations()
  }, [selectedSubject])

  // Load voices for TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
    }
  }, [])

  const loadAllConversations = async () => {
    const { data } = await chatService.getAllConversations(user.id, selectedSubject.id)
    if (data?.length > 0) {
      setConversations(data)
    } else {
      setConversations([])
      startNewConversation()
    }
  }

  const loadConversation = (conv) => {
    setShowSidebar(false)
    setCurrentConversationId(conv.id)
    setMessages(conv.messages?.length > 0 ? conv.messages : [{ role: 'assistant', content: getWelcome(null, null) }])
  }

  const startNewConversation = async () => {
    const { data } = await chatService.createNewConversation(user.id, selectedSubject.id)
    if (data) {
      setCurrentConversationId(data.id)
      setMessages([{ role: 'assistant', content: getWelcome(null, null) }])
      await loadAllConversations()
    }
  }

  const deleteConversation = async (id) => {
    await chatService.deleteConversation(id)
    await loadAllConversations()
    toast.success('Supprime')
  }

  function getWelcome(subjectName, currentMode) {
    const name = profile?.full_name?.split(' ')[0] || 'cher etudiant'
    const sub = subjectName || selectedSubject.name
    const m = currentMode || mode
    if (m === 'quiz') return `Salut ${name}! Je vais generer un quiz en ${sub} pour tester tes connaissances. Dis-moi le sujet et ton niveau (BFEM, BAC, Licence).`
    if (m === 'solver') return `Salut ${name}! Envoie-moi un exercice (texte ou photo) en ${sub} et je le resous etape par etape.`
    return `Salut ${name}! Je suis ton tuteur en ${sub}. Pose-moi n'importe quelle question, je t'explique tout clairement.`
  }

  const getTitle = (conv) => {
    const first = conv.messages?.find(m => m.role === 'user')
    return first ? first.content.substring(0, 35) + (first.content.length > 35 ? '...' : '') : 'Nouvelle conversation'
  }

  // ============ SEND MESSAGE ============

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return
    const canSend = await checkCanSendMessage()
    if (!canSend.allowed) { toast.error('Limite atteinte! Passez a Premium.'); return }

    const userMessage = { role: 'user', content: inputMessage }
    const updatedMessages = [...messages, userMessage]
    setMessages([...updatedMessages, { role: 'assistant', content: '' }])
    setInputMessage('')
    setLoading(true)

    let streamedContent = ''
    try {
      const response = await chatService.sendMessage(
        user.id, selectedSubject.id, inputMessage, updatedMessages,
        currentConversationId,
        (chunk) => {
          streamedContent += chunk
          setMessages([...updatedMessages, { role: 'assistant', content: streamedContent }])
        },
        mode
      )
      if (response.reply) {
        await incrementMessageCount()
        setMessageCount(prev => prev + 1)
        await loadAllConversations()
      }
    } catch (error) {
      toast.error("Erreur d'envoi")
    } finally {
      setLoading(false)
    }
  }

  // ============ VOICE ============

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = chatService.startListening((transcript, isFinal) => {
      setInputMessage(transcript)
      if (isFinal) {
        setIsListening(false)
      }
    })

    if (!recognition) {
      toast.error('Reconnaissance vocale non supportee')
      return
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setIsListening(true)
    toast.success('Parlez maintenant...')
  }

  const toggleSpeaking = (text) => {
    if (isSpeaking) {
      chatService.stopSpeaking()
      setIsSpeaking(false)
    } else {
      chatService.speak(text)
      setIsSpeaking(true)
      // Reset when done
      if ('speechSynthesis' in window) {
        const check = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false)
            clearInterval(check)
          }
        }, 500)
      }
    }
  }

  // ============ IMAGE/PDF ============

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isPremium) { toast.error('Fonctionnalite Premium'); return }

    setProcessingImage(true)
    setShowUpload(false)

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer), verbosity: 0 }).promise
        let text = ''
        for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(item => item.str).join(' ') + '\n'
        }
        if (text.trim()) {
          setInputMessage('[PDF: ' + file.name + ']\n\n' + text.substring(0, 4000))
          toast.success('PDF analyse!')
        } else toast.error('PDF vide ou non extractible')
      } else {
        // Image OCR
        const result = await Tesseract.recognize(file, 'fra+eng')
        if (result.data.text.trim()) {
          setInputMessage('[Image analysee]\n\n' + result.data.text)
          toast.success('Texte extrait de l\'image!')
        } else toast.error('Aucun texte detecte')
      }
    } catch (err) {
      toast.error('Erreur d\'analyse')
    } finally {
      setProcessingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ============ EXPORT ============

  const exportToPDF = async () => {
    if (messages.length < 2) return
    setExporting(true)
    try {
      const doc = new jsPDF()
      let y = 20
      doc.setFontSize(18)
      doc.setTextColor(0, 133, 61)
      doc.text('EduSen - ' + selectedSubject.name, 105, y, { align: 'center' })
      y += 10
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(profile?.full_name || 'Etudiant' + ' - ' + new Date().toLocaleDateString('fr-FR'), 105, y, { align: 'center' })
      y += 15

      messages.forEach(msg => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFontSize(10)
        doc.setTextColor(msg.role === 'user' ? 0 : 0, msg.role === 'user' ? 133 : 66, msg.role === 'user' ? 61 : 204)
        doc.setFont(undefined, 'bold')
        doc.text(msg.role === 'user' ? 'QUESTION:' : 'REPONSE:', 15, y)
        y += 6
        doc.setTextColor(30, 30, 30)
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        const lines = doc.splitTextToSize(msg.content, 180)
        lines.forEach(line => {
          if (y > 280) { doc.addPage(); y = 20 }
          doc.text(line, 15, y)
          y += 4.5
        })
        y += 5
      })
      doc.save('EduSen-' + selectedSubject.id + '.pdf')
      toast.success('PDF telecharge!')
    } catch (e) { toast.error('Erreur export') }
    setExporting(false)
  }

  // ============ RENDER ============

  return (
    <FeatureGate feature="ai_tutor">
    <div className="min-h-screen bg-[#0a1f14] flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>

      {/* Top Bar */}
      <div className="flex-shrink-0 px-3 pt-14 pb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowSubjects(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-all">
            <span className="text-lg">{selectedSubject.icon}</span>
            <span className="text-xs font-bold text-white">{selectedSubject.name}</span>
            <ChevronDown size={14} className="text-white/40" />
          </button>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="flex bg-white/[0.05] rounded-lg p-0.5 border border-white/10">
              {MODES.map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setMessages([{ role: 'assistant', content: getWelcome(null, m.id) }]) }}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                    mode === m.id ? 'bg-senegal-green text-white' : 'text-white/30'
                  }`}>
                  <m.icon size={12} /> {m.name}
                </button>
              ))}
            </div>

            <button onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg bg-white/[0.07] border border-white/10 hover:bg-white/[0.12]">
              <Clock size={16} className="text-white/50" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-senegal-green text-white rounded-br-md'
                  : 'bg-white/[0.07] border border-white/[0.08] rounded-bl-md text-white/80'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* AI message actions */}
                {msg.role === 'assistant' && msg.content && idx > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                    <button onClick={() => toggleSpeaking(msg.content)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                      {isSpeaking ? <VolumeX size={14} className="text-orange-400" /> : <Volume2 size={14} className="text-white/30" />}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copie!') }}
                      className="text-[10px] text-white/20 hover:text-white/40 transition-all">
                      Copier
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.07] rounded-2xl px-4 py-3 rounded-bl-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-senegal-green animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-senegal-green animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-senegal-green animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-white/30">
                    {mode === 'quiz' ? 'Generation du quiz...' : mode === 'solver' ? 'Resolution en cours...' : 'Reflexion...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-[#0a1f14] border-t border-white/[0.06]">
        {/* Processing indicator */}
        {processingImage && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/[0.05] rounded-xl">
            <Loader2 size={14} className="animate-spin text-senegal-green" />
            <span className="text-xs text-white/40">Analyse en cours...</span>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Quick actions */}
          <div className="flex items-center gap-2 mb-2">
            {isPremium && (
              <button onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all">
                <Camera size={16} className="text-white/40" />
              </button>
            )}
            {messages.length > 2 && (
              <button onClick={exportToPDF} disabled={exporting}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all">
                <Download size={16} className="text-white/40" />
              </button>
            )}
            <button onClick={startNewConversation}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all">
              <MessageSquarePlus size={16} className="text-white/40" />
            </button>
            <div className="flex-1" />
            {!isPremium && (
              <span className="text-[10px] text-white/20">{messageCount}/10</span>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={mode === 'quiz' ? 'Ex: Quiz sur les derivees niveau BAC S2...' : mode === 'solver' ? 'Collez l\'exercice ici ou envoyez une photo...' : 'Posez votre question...'}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/10 focus:border-senegal-green/50 outline-none text-sm text-white placeholder-white/25 resize-none"
                rows="1"
                disabled={loading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              />
              {/* Mic button inside input */}
              <button onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/10 text-white/30'}`}>
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <button onClick={sendMessage} disabled={loading || !inputMessage.trim()}
              className="p-3 rounded-xl bg-senegal-green text-white disabled:opacity-30 hover:bg-emerald-600 transition-all flex-shrink-0">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Subject Selector Modal */}
      {showSubjects && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#0f2b1a] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white">Choisir une matiere</h2>
                <button onClick={() => setShowSubjects(false)} className="p-2 rounded-lg hover:bg-white/10"><X size={18} className="text-white/50" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => { setSelectedSubject(s); setShowSubjects(false); setMessages([{ role: 'assistant', content: getWelcome(s.name) }]) }}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      selectedSubject.id === s.id ? 'bg-senegal-green/20 border-senegal-green/50' : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.1]'
                    }`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-[10px] font-bold text-white/70">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - History */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowSidebar(false)} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0f2b1a] z-50 shadow-2xl flex flex-col" style={{ animation: 'slideInRight 0.3s ease-out' }}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Historique</h3>
              <div className="flex gap-2">
                <button onClick={() => { startNewConversation(); setShowSidebar(false) }}
                  className="px-3 py-1.5 rounded-lg bg-senegal-green text-white text-xs font-bold flex items-center gap-1">
                  <MessageSquarePlus size={13} /> Nouveau
                </button>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={16} className="text-white/50" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {conversations.map(conv => (
                <div key={conv.id} onClick={() => loadConversation(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${currentConversationId === conv.id ? 'bg-senegal-green/15 border border-senegal-green/30' : 'hover:bg-white/[0.05]'}`}>
                  <p className="text-xs font-semibold text-white truncate">{getTitle(conv)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/25">{new Date(conv.updated_at).toLocaleDateString('fr-FR')}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                      className="text-white/15 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-white/20 text-xs py-8">Aucune conversation</p>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
    </FeatureGate>
  )
}
