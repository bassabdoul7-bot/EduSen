import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { messagesService } from '../services/messages'
import { 
  Send, 
  Search, 
  Plus, 
  ArrowLeft,
  User,
  MessageCircle,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { user, profile } = useAuth()
  
  const [view, setView] = useState('inbox') // 'inbox', 'chat', 'new'
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  // New conversation
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages()
      const interval = setInterval(loadMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    setLoading(true)
    const { data, error } = await messagesService.getConversations(user.id)
    if (!error && data) {
      setConversations(data)
    }
    setLoading(false)
  }

  const loadMessages = async () => {
    if (!selectedConversation) return
    
    const { data, error } = await messagesService.getMessages(selectedConversation.id)
    if (!error && data) {
      setMessages(data)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      toast.error('Le message ne peut pas être vide')
      return
    }

    setSending(true)
    const { error } = await messagesService.sendMessage(
      selectedConversation.id,
      user.id,
      newMessage
    )

    if (!error) {
      setNewMessage('')
      loadMessages()
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
    setSending(false)
  }

  const openConversation = (conv) => {
    setSelectedConversation(conv.conversations)
    setView('chat')
  }

  const loadUsersForNewChat = async () => {
    const { data, error } = await messagesService.getAllUsers()
    if (!error && data) {
      // Filter out current user
      setAllUsers(data.filter(u => u.id !== user.id))
    }
    setView('new')
  }

  const startNewConversation = async (otherUser) => {
    setLoading(true)
    const { data, error } = await messagesService.createConversation(user.id, otherUser.id)
    
    if (!error && data) {
      toast.success('Conversation créée!')
      setSelectedConversation(data)
      setView('chat')
      loadConversations()
    } else {
      toast.error('Erreur lors de la création')
    }
    setLoading(false)
  }

  // Render functions
  const renderInbox = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Messages 💬</h1>
        <button
          onClick={loadUsersForNewChat}
          className='btn-primary flex items-center gap-2'
        >
          <Plus size={20} />
          Nouveau message
        </button>
      </div>

      <div className='card'>
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Rechercher une conversation...'
            className='input-field pl-10'
          />
        </div>

        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-senegal-green mx-auto'></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className='text-center py-12'>
            <MessageCircle size={64} className='mx-auto mb-4 text-gray-300' />
            <h3 className='text-xl font-semibold mb-2'>Aucun message</h3>
            <p className='text-gray-600 mb-4'>Commencez une conversation!</p>
            <button
              onClick={loadUsersForNewChat}
              className='btn-primary flex items-center gap-2 mx-auto'
            >
              <Plus size={20} />
              Nouveau message
            </button>
          </div>
        ) : (
          <div className='space-y-2'>
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => openConversation(conv)}
                className='p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-senegal-green text-white flex items-center justify-center font-bold'>
                    <User size={24} />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold'>Conversation</h3>
                    <p className='text-sm text-gray-500'>
                      {new Date(conv.conversations.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderChat = () => (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => {
            setView('inbox')
            setSelectedConversation(null)
            setMessages([])
          }}
          className='btn-secondary flex items-center gap-2'
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-senegal-green text-white flex items-center justify-center font-bold'>
            <User size={20} />
          </div>
          <div>
            <h2 className='font-bold'>Conversation</h2>
            <p className='text-sm text-gray-500'>En ligne</p>
          </div>
        </div>
      </div>

      <div className='card h-[500px] flex flex-col'>
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              Aucun message. Commencez la conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender_id === user.id
                      ? 'bg-senegal-green text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === user.id ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className='border-t p-4'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Écrivez votre message...'
              className='input-field flex-1'
            />
            <button
              type='submit'
              disabled={sending || !newMessage.trim()}
              className='btn-primary flex items-center gap-2'
            >
              <Send size={20} />
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderNewConversation = () => {
    const filteredUsers = allUsers.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setView('inbox')}
            className='btn-secondary flex items-center gap-2'
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <h2 className='text-2xl font-bold'>Nouveau message</h2>
        </div>

        <div className='card'>
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Rechercher un étudiant...'
              className='input-field pl-10'
            />
          </div>

          <div className='space-y-2'>
            {filteredUsers.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                Aucun utilisateur trouvé
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => startNewConversation(u)}
                  className='p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-senegal-green to-green-600 text-white flex items-center justify-center font-bold'>
                      {(u.full_name || u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className='font-semibold'>{u.full_name || 'Utilisateur'}</h3>
                      <p className='text-sm text-gray-500'>{u.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {view === 'inbox' && renderInbox()}
      {view === 'chat' && renderChat()}
      {view === 'new' && renderNewConversation()}
    </div>
  )
}