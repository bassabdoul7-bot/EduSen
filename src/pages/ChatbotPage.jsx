import { useState, useEffect, useRef } from 'react'
import { FeatureGate } from '../components/FeatureGate'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { chatService } from '../services/chat'
import { Send, Loader2, Crown, Camera, FileText, Download, Trash2, MessageSquarePlus, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from '../components/ImageUpload'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx'
import { jsPDF } from 'jspdf'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const SUBJECTS = [
  { id: 'math', name: 'Mathematiques', icon: '🔢' },
  { id: 'physics', name: 'Physique', icon: '⚛️' },
  { id: 'chemistry', name: 'Chimie', icon: '🧪' },
  { id: 'biology', name: 'Biologie', icon: '🧬' },
  { id: 'french', name: 'Francais', icon: '📖' },
  { id: 'english', name: 'Anglais', icon: '🇬🇧' },
  { id: 'history', name: 'Histoire', icon: '📜' },
  { id: 'geography', name: 'Geographie', icon: '🌍' },
  { id: 'philosophy', name: 'Philosophie', icon: '💭' },
  { id: 'economics', name: 'Economie', icon: '💰' },
  { id: 'programming', name: 'Programmation', icon: '💻' },
  { id: 'medicine', name: 'Medecine', icon: '⚕️' },
  { id: 'humanities', name: 'Sciences Humaines', icon: '🧠' },
  { id: 'general', name: 'Questions Generales', icon: '💬' }
]

export default function ChatbotPage() {
  const { user, profile } = useAuth()
  const { isPremium, checkCanSendMessage, incrementMessageCount } = usePremium()
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0])
  const [showAllSubjects, setShowAllSubjects] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadAllConversations()
  }, [selectedSubject])

  const loadAllConversations = async () => {
    const { data } = await chatService.getAllConversations(user.id, selectedSubject.id)
    if (data && data.length > 0) {
      setConversations(data)
      loadConversation(data[0])
    } else {
      setConversations([])
      startNewConversation()
    }
  }

  const loadConversation = (conversation) => {
    setCurrentConversationId(conversation.id)
    if (conversation.messages && conversation.messages.length > 0) {
      setMessages(conversation.messages)
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Bonjour! Je suis votre tuteur en ' + selectedSubject.name + '. Comment puis-je vous aider aujourd\'hui?'
      }])
    }
  }

  const startNewConversation = async () => {
    const { data, error } = await chatService.createNewConversation(user.id, selectedSubject.id)
    if (data) {
      setCurrentConversationId(data.id)
      setMessages([{
        role: 'assistant',
        content: 'Bonjour! Je suis votre tuteur en ' + selectedSubject.name + '. Comment puis-je vous aider aujourd\'hui?'
      }])
      await loadAllConversations()
      toast.success('Nouvelle conversation creee!')
    }
  }

  const deleteConversation = async (conversationId) => {
    if (confirm('Voulez-vous vraiment supprimer cette conversation?')) {
      await chatService.deleteConversation(conversationId)
      await loadAllConversations()
      toast.success('Conversation supprimee!')
    }
  }

  const getConversationTitle = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Nouvelle conversation'
    }
    const firstUserMessage = conversation.messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.substring(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '')
    }
    return 'Conversation'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return 'Aujourd\'hui'
    } else if (diffInHours < 48) {
      return 'Hier'
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  const extractTextFromImage = async (imageData) => {
    setProcessingImage(true)
    try {
      const result = await Tesseract.recognize(imageData, 'fra+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log('OCR Progress: ' + Math.round(m.progress * 100) + '%')
          }
        }
      })
      
      if (!result.data.text.trim()) {
        toast.error('Aucun texte detecte dans l\'image')
        return null
      }
      
      return result.data.text
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('Erreur lors de la lecture de l\'image')
      return null
    } finally {
      setProcessingImage(false)
    }
  }

  const extractTextFromPDF = async (file) => {
    setProcessingImage(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const typedArray = new Uint8Array(arrayBuffer)
      
      const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        verbosity: 0
      })
      
      const pdf = await loadingTask.promise
      let fullText = ''
      const maxPages = Math.min(pdf.numPages, 20)
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item) => item.str)
            .join(' ')
            .trim()
          
          if (pageText) {
            fullText += '\nPage ' + pageNum + ':\n' + pageText + '\n'
          }
        } catch (pageError) {
          console.error('Error on page ' + pageNum + ':', pageError)
        }
      }
      
      if (!fullText.trim()) {
        toast.error('PDF vide ou texte non extractible')
        return null
      }
      
      return fullText
    } catch (error) {
      console.error('PDF Error:', error)
      toast.error('Erreur: PDF invalide ou corrompu')
      return null
    } finally {
      setProcessingImage(false)
    }
  }

  const handleImageCapture = async (imageData) => {
    if (!isPremium) {
      toast.error('Fonctionnalite Premium uniquement!')
      return
    }

    const extractedText = await extractTextFromImage(imageData)
    if (extractedText) {
      setInputMessage('[Image analysee]\n\n' + extractedText)
      setShowImageUpload(false)
      toast.success('Texte extrait!')
    }
  }

  const handlePDFUpload = async (file) => {
    if (!isPremium) {
      toast.error('Fonctionnalite Premium uniquement!')
      return
    }

    const extractedText = await extractTextFromPDF(file)
    if (extractedText) {
      const truncated = extractedText.substring(0, 3000)
      setInputMessage('[PDF: ' + file.name + ']\n\n' + truncated + (extractedText.length > 3000 ? '...(tronque)' : ''))
      setShowImageUpload(false)
      toast.success('PDF analyse!')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const canSend = await checkCanSendMessage()
    if (!canSend.allowed) {
      toast.error('Limite de messages atteinte! Passez a Premium.')
      return
    }

    const userMessage = { role: 'user', content: inputMessage }
    const updatedMessages = [...messages, userMessage]
    
    // Add empty assistant message for streaming
    const assistantMessage = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMessage])
    setInputMessage('')
    setLoading(true)
    
    let streamedContent = ''

    try {
      const response = await chatService.sendMessage(
        user.id,
        selectedSubject.id,
        inputMessage,
        updatedMessages,
        currentConversationId,
        (chunk) => {
          // Streaming callback - updates message in real-time
          streamedContent += chunk
          setMessages([...updatedMessages, { role: 'assistant', content: streamedContent }])
        }
      )

      if (response.reply) {
        await incrementMessageCount()
        setMessageCount(prev => prev + 1)
        await loadAllConversations()
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportToWord = async () => {
    if (messages.length === 0) {
      toast.error('Aucune conversation a exporter')
      return
    }

    setExporting(true)
    toast.loading('Creation du document Word...', { id: 'export' })

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: 'EduSen - Plateforme Educative',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Matiere: ' + selectedSubject.name,
                  bold: true
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Etudiant: ' + (profile?.full_name || 'Etudiant'),
                  bold: true
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Date: ' + new Date().toLocaleDateString('fr-FR'),
                  bold: true
                })
              ],
              spacing: { after: 400 }
            }),
            ...messages.flatMap((msg, idx) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: msg.role === 'user' ? 'QUESTION:' : 'REPONSE:',
                    bold: true,
                    color: msg.role === 'user' ? '006838' : '0066CC',
                    size: 24
                  })
                ],
                spacing: { before: idx === 0 ? 0 : 300, after: 100 }
              }),
              new Paragraph({
                text: msg.content,
                spacing: { after: 200 }
              })
            ]),
            new Paragraph({
              text: '(c) EduSen - Excellence Academique pour le Senegal',
              alignment: AlignmentType.CENTER,
              italics: true
            })
          ]
        }]
      })

      const blob = await Packer.toBlob(doc)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'EduSen-' + selectedSubject.id + '-' + Date.now() + '.docx'
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Document Word telecharge!', { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erreur lors de l\'export Word', { id: 'export' })
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    if (messages.length === 0) {
      toast.error('Aucune conversation a exporter')
      return
    }

    setExporting(true)
    toast.loading('Creation du PDF...', { id: 'export' })

    try {
      const doc = new jsPDF()
      let yPosition = 20

      doc.setFontSize(20)
      doc.setTextColor(0, 104, 56)
      doc.text('EduSen - Plateforme Educative', 105, yPosition, { align: 'center' })
      yPosition += 15

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Matiere: ' + selectedSubject.name, 20, yPosition)
      yPosition += 7
      doc.text('Etudiant: ' + (profile?.full_name || 'Etudiant'), 20, yPosition)
      yPosition += 7
      doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 20, yPosition)
      yPosition += 15

      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 10

      messages.forEach((msg) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(11)
        if (msg.role === 'user') {
          doc.setTextColor(0, 104, 56)
          doc.setFont(undefined, 'bold')
          doc.text('QUESTION:', 20, yPosition)
        } else {
          doc.setTextColor(0, 102, 204)
          doc.setFont(undefined, 'bold')
          doc.text('REPONSE:', 20, yPosition)
        }
        yPosition += 7

        doc.setTextColor(0, 0, 0)
        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        
        const lines = doc.splitTextToSize(msg.content, 170)
        lines.forEach(line => {
          if (yPosition > 280) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, 20, yPosition)
          yPosition += 5
        })
        
        yPosition += 5
      })

      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          '(c) EduSen - Excellence Academique | Page ' + i + '/' + pageCount,
          105,
          290,
          { align: 'center' }
        )
      }

      doc.save('EduSen-' + selectedSubject.id + '-' + Date.now() + '.pdf')
      toast.success('PDF telecharge!', { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erreur lors de l\'export PDF', { id: 'export' })
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => { document.body.setAttribute("data-chatbot", "true"); return () => document.body.removeAttribute("data-chatbot"); }, []); return (
    <FeatureGate feature="ai_tutor">
    <div className="min-h-screen relative overflow-hidden">
      {/* Emerald Background - Same as Dashboard */}
      <div className="fixed inset-0 bg-[#0a1f14] -z-10"></div>
      
      
      
    <div className='flex flex-col md:flex-row h-[calc(100vh-8rem)] pb-24 gap-0 md:gap-4'>
      {/* Mobile Header */}
      <div className='md:hidden mb-4'>
        <div className='flex items-center justify-between p-3 backdrop-blur-md bg-emerald-900/80 border-emerald-700/50 text-white rounded-2xl border border-white/30 shadow-lg'>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className='px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-semibold'
          >
            Historique
          </button>
          <div className='flex items-center gap-2'>
            <div className='text-xl'>{selectedSubject.icon}</div>
            <div className='font-semibold text-sm'>{selectedSubject.name}</div>
          </div>
          <button
            onClick={() => setShowAllSubjects(true)}
            className='px-3 py-2 text-xs font-semibold bg-white text-senegal-green rounded-lg'
          >
            Changer
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <>
          <div 
            className='fixed inset-0 bg-black/50 z-40 md:hidden'
            onClick={() => setShowSidebar(false)}
          />
          
          <div className='fixed md:relative inset-y-0 left-0 w-80 md:w-80 backdrop-blur-2xl bg-white/30 border-r border-white/30 z-50 md:z-0 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 p-4 h-full'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-gray-800'>💬 Historique</h3>
              <div className='flex gap-2'>
                <button
                  onClick={startNewConversation}
                  className='btn-primary flex items-center gap-2 text-sm px-3 py-2'
                >
                  <MessageSquarePlus size={16} />
                  <span className='hidden sm:inline'>Nouveau</span>
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className='md:hidden px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg'
                >
                  X
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto space-y-2'>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    loadConversation(conv)
                    setShowSidebar(false)
                  }}
                  className={'p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ' + 
                    (currentConversationId === conv.id ? 'bg-senegal-green/10 border-2 border-senegal-green' : 'border-2 border-transparent')
                  }
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-800 truncate'>
                        {getConversationTitle(conv)}
                      </p>
                      <div className='flex items-center gap-1 mt-1'>
                        <Clock size={12} className='text-gray-400' />
                        <p className='text-xs text-gray-500'>{formatDate(conv.updated_at)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      className='text-gray-400 hover:text-red-500 transition-colors'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {conversations.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <p className='text-sm'>Aucune conversation</p>
                  <p className='text-xs mt-2'>Commencez une nouvelle conversation!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Desktop Subject Selector */}
        <div className='hidden md:block mb-4'>
          {showAllSubjects ? (
            <div>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-bold text-gray-800'>📚 Choisissez votre matiere:</h3>
                <button
                  onClick={() => setShowAllSubjects(false)}
                  className='px-4 py-2 text-sm font-semibold text-senegal-green hover:bg-senegal-green/10 rounded-lg transition-colors'
                >
                  Masquer
                </button>
              </div>
              <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2'>
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject)
                      setShowAllSubjects(false)
                    }}
                    className={'p-2 rounded-lg border-2 transition-all hover:scale-105 ' + 
                      (selectedSubject.id === subject.id
                        ? 'backdrop-blur-md bg-emerald-900/80 border-emerald-700/50 text-white border-white/30 shadow-xl'
                        : 'backdrop-blur-xl bg-white/40 hover:bg-white/60 border-white/30 hover:border-white/50')
                    }
                  >
                    <div className='text-xl mb-1'>{subject.icon}</div>
                    <div className='text-[10px] font-semibold leading-tight'>{subject.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between p-3 backdrop-blur-md bg-emerald-900/80 border-emerald-700/50 text-white rounded-2xl border border-white/30 shadow-lg'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className='px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors'
                >
                  {showSidebar ? '<' : '>'}
                </button>
                <div className='text-2xl'>{selectedSubject.icon}</div>
                <div className='font-semibold'>{selectedSubject.name}</div>
              </div>
              <button
                onClick={() => setShowAllSubjects(true)}
                className='px-4 py-2 text-sm font-semibold bg-white text-senegal-green rounded-lg hover:bg-gray-100 transition-colors'
              >
                Changer de matiere
              </button>
            </div>
          )}
        </div>

        {/* Mobile Subject Selector Modal */}
        {showAllSubjects && (
          <div className='md:hidden fixed inset-0 bg-white z-50 p-4 overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-800'>📚 Choisissez votre matiere:</h3>
              <button
                onClick={() => setShowAllSubjects(false)}
                className='px-4 py-2 text-sm font-semibold text-senegal-green hover:bg-senegal-green/10 rounded-lg'
              >
                Fermer
              </button>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject)
                    setShowAllSubjects(false)
                  }}
                  className={'p-3 rounded-lg border-2 transition-all ' + 
                    (selectedSubject.id === subject.id
                      ? 'backdrop-blur-md bg-emerald-900/80 border-emerald-700/50 text-white border-white/30 shadow-xl'
                      : 'bg-white border-gray-200')
                  }
                >
                  <div className='text-2xl mb-1'>{subject.icon}</div>
                  <div className='text-[10px] font-semibold leading-tight'>{subject.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Controls */}
        <div className='flex items-center justify-between mb-4 flex-wrap gap-2'>
          <div className='flex items-center gap-2 flex-wrap'>
            {messages.length > 1 && (
              <>
                <button
                  onClick={exportToWord}
                  disabled={exporting}
                  className='btn-secondary flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-2'
                >
                  <FileText size={14} />
                  <span className='hidden sm:inline'>Word</span>
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className='btn-secondary flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-2'
                >
                  <Download size={14} />
                  <span className='hidden sm:inline'>PDF</span>
                </button>
              </>
            )}
          </div>
          
          <div className='flex items-center gap-2'>
            {isPremium ? (
              <span className='flex items-center gap-2 text-senegal-green font-semibold text-xs md:text-sm'>
                <Crown size={16} />
                Premium
              </span>
            ) : (
              <span className='text-gray-600 text-xs md:text-sm'>
                {messageCount}/10
              </span>
            )}
          </div>
        </div>

        {/* Messages Area */}
          <div className='overflow-y-auto mb-4 p-3 md:p-4' style={{height: 'calc(100vh - 20rem)'}}>
          <div className='max-w-4xl mx-auto'><div className='space-y-3 md:space-y-4 pb-4'>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={'max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-lg text-sm md:text-base ' + 
                    (msg.role === 'user' ? 'backdrop-blur-md bg-emerald-900/80 border-emerald-700/50 text-white border border-white/30 shadow-lg'
                      : 'backdrop-blur-xl bg-white/40 border border-white/30 text-gray-900')
                  }
                >
                  <div className='whitespace-pre-wrap break-words'>{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='bg-gray-100 p-4 rounded-lg'>
                  <Loader2 className='animate-spin' size={24} />
                </div>
              </div>
            )}
            </div><div ref={messagesEndRef} />
          </div>
        </div>

        {/* Image Upload */}
        {showImageUpload && isPremium && (
          <div className='card mb-4 p-4'>
            {processingImage ? (
              <div className='text-center py-4'>
                <Loader2 className='animate-spin mx-auto mb-2' size={32} />
                <p className='text-sm'>Analyse en cours...</p>
              </div>
            ) : (
              <ImageUpload
                onImageCapture={handleImageCapture}
                onPDFUpload={handlePDFUpload}
              />
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-28 left-0 right-0 backdrop-blur-2xl bg-white/30 border-t border-white/30 shadow-lg p-4 space-y-2 z-50">
          {isPremium && (
            <div className='flex gap-2'>
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className='btn-secondary flex items-center gap-2 text-xs md:text-sm px-3 py-2'
              >
                <Camera size={14} />
                <span>{showImageUpload ? 'Masquer' : 'Upload Image/PDF'}</span>
              </button>
            </div>
          )}
          
          <div className='flex gap-2'>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder='Posez votre question...'
              className='input-field flex-1 resize-none text-sm md:text-base'
              rows='2'
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className='w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-500 to-emerald-500 hover:from-yellow-400 hover:to-emerald-400 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 flex items-center justify-center group active:scale-95 disabled:cursor-not-allowed'
            >
              {loading ? <Loader2 className='animate-spin text-white' size={20} /> : <Send size={20} className='text-white group-hover:scale-110 transition-transform' />}
            </button>
          </div>
        </div>
      </div>
        </div>
    </div>
    </FeatureGate>
  )
}
