import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { chatService } from '../services/chat'
import { Send, Loader2, Crown, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from '../components/ImageUpload'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const SUBJECTS = [
  { id: 'math', name: 'Mathématiques', icon: '🔢' },
  { id: 'physics', name: 'Physique', icon: '⚛️' },
  { id: 'chemistry', name: 'Chimie', icon: '🧪' },
  { id: 'biology', name: 'Biologie', icon: '🧬' },
  { id: 'french', name: 'Français', icon: '📖' },
  { id: 'english', name: 'Anglais', icon: '🇬🇧' },
  { id: 'history', name: 'Histoire', icon: '📜' },
  { id: 'geography', name: 'Géographie', icon: '🌍' },
  { id: 'philosophy', name: 'Philosophie', icon: '💭' },
  { id: 'economics', name: 'Économie', icon: '💰' },
  { id: 'programming', name: 'Programmation', icon: '💻' },
  { id: 'medicine', name: 'Médecine', icon: '⚕️' }
]

export default function ChatbotPage() {
  const { user } = useAuth()
  const { isPremium, messageCount, canSendMessage, incrementMessageCount } = usePremium()
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0])
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadConversationHistory()
  }, [selectedSubject])

  const loadConversationHistory = async () => {
    const { data } = await chatService.getConversationHistory(user.id, selectedSubject.id)
    if (data && data.length > 0) {
      setMessages(data[0].messages || [])
    } else {
      setMessages([{
        role: 'assistant',
        content: `Bonjour! Je suis votre tuteur en ${selectedSubject.name}. Comment puis-je vous aider aujourd'hui?`
      }])
    }
  }

  const extractTextFromImage = async (imageData) => {
    setProcessingImage(true)
    try {
      const result = await Tesseract.recognize(imageData, 'fra+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })
      
      if (!result.data.text.trim()) {
        toast.error('Aucun texte détecté dans l\'image')
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
            fullText += `\nPage ${pageNum}:\n${pageText}\n`
          }
        } catch (pageError) {
          console.error(`Error on page ${pageNum}:`, pageError)
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
      toast.error('Fonctionnalité Premium uniquement!')
      return
    }

    const extractedText = await extractTextFromImage(imageData)
    if (extractedText) {
      setInputMessage(`[Image analysée]\n\n${extractedText}`)
      setShowImageUpload(false)
      toast.success('Texte extrait!')
    }
  }

  const handlePDFUpload = async (file) => {
    if (!isPremium) {
      toast.error('Fonctionnalité Premium uniquement!')
      return
    }

    const extractedText = await extractTextFromPDF(file)
    if (extractedText) {
      const truncated = extractedText.substring(0, 3000)
      setInputMessage(`[PDF: ${file.name}]\n\n${truncated}${extractedText.length > 3000 ? '...(tronqué)' : ''}`)
      setShowImageUpload(false)
      toast.success('PDF analysé!')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    if (!isPremium && messageCount >= 10) {
      toast.error('Limite de messages atteinte!')
      return
    }

    const userMessage = { role: 'user', content: inputMessage }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setLoading(true)

    try {
      const response = await chatService.sendMessage(
        user.id,
        selectedSubject.id,
        inputMessage,
        updatedMessages
      )

      if (response.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: response.reply }])
        if (!isPremium) {
          incrementMessageCount()
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col h-[calc(100vh-8rem)]'>
      <div className='flex items-center justify-between mb-4'>
        <select
          value={selectedSubject.id}
          onChange={(e) => setSelectedSubject(SUBJECTS.find(s => s.id === e.target.value))}
          className='input-field'
        >
          {SUBJECTS.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.icon} {subject.name}
            </option>
          ))}
        </select>
        
        <div className='flex items-center gap-2'>
          {isPremium ? (
            <span className='flex items-center gap-2 text-senegal-green font-semibold'>
              <Crown size={20} />
              Premium
            </span>
          ) : (
            <span className='text-gray-600 text-sm'>
              {messageCount}/10 messages
            </span>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto card mb-4 p-4'>
        <div className='space-y-4'>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-senegal-green text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className='whitespace-pre-wrap'>{msg.content}</div>
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
          <div ref={messagesEndRef} />
        </div>
      </div>

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

      <div className='space-y-2'>
        {isPremium && (
          <div className='flex gap-2'>
            <button
              onClick={() => setShowImageUpload(!showImageUpload)}
              className='btn-secondary flex items-center gap-2 text-sm'
            >
              <Camera size={16} />
              {showImageUpload ? 'Masquer' : 'Upload Image/PDF'}
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
            className='input-field flex-1 resize-none'
            rows='2'
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className='btn-primary px-6'
          >
            {loading ? <Loader2 className='animate-spin' size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}