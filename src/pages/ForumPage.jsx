import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { forumService } from '../services/forum'
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Search,
  Plus,
  ArrowLeft,
  Send,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Crown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ForumPage() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const navigate = useNavigate()

  const [view, setView] = useState('categories')
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [currentTopic, setCurrentTopic] = useState(null)
  const [posts, setPosts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  
  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicContent, setNewTopicContent] = useState('')
  
  const [replyContent, setReplyContent] = useState('')
  const [userVotes, setUserVotes] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (currentTopic) {
      loadPosts()
    }
  }, [currentTopic])

  const loadCategories = async () => {
    setLoading(true)
    const { data, error } = await forumService.getCategories()
    if (!error && data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const loadTopics = async (category) => {
    setLoading(true)
    setSelectedCategory(category)
    const { data, error } = await forumService.getTopicsByCategory(category.id, { sortBy })
    if (!error && data) {
      setTopics(data)
      setView('topics')
    }
    setLoading(false)
  }

  const loadTopic = async (topic) => {
    setLoading(true)
    const { data, error } = await forumService.getTopicById(topic.id)
    if (!error && data) {
      setCurrentTopic(data)
      setView('discussion')
    }
    setLoading(false)
  }

  const loadPosts = async () => {
    const { data, error } = await forumService.getPostsByTopic(currentTopic.id)
    if (!error && data) {
      setPosts(data)
      
      if (user && data.length > 0) {
        const postIds = data.map(p => p.id)
        const { data: votes } = await forumService.getUserVotes(user.id, postIds)
        if (votes) {
          const votesMap = {}
          votes.forEach(v => {
            votesMap[v.post_id] = v.vote_type
          })
          setUserVotes(votesMap)
        }
      }
    }
  }

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const { data, error } = await forumService.createTopic(
      user.id,
      selectedCategory.id,
      newTopicTitle,
      newTopicContent
    )

    if (!error && data) {
      toast.success('Sujet créé avec succès!')
      setShowCreateTopic(false)
      setNewTopicTitle('')
      setNewTopicContent('')
      loadTopics(selectedCategory)
    } else {
      toast.error('Erreur lors de la création')
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Le message ne peut pas être vide')
      return
    }

    const { data, error } = await forumService.createPost(
      user.id,
      currentTopic.id,
      replyContent
    )

    if (!error && data) {
      toast.success('Réponse ajoutée!')
      setReplyContent('')
      loadPosts()
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  const handleVote = async (postId, voteType) => {
    if (!user) {
      toast.error('Connectez-vous pour voter')
      return
    }

    await forumService.votePost(user.id, postId, voteType)
    loadPosts()
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    const { data, error } = await forumService.getAllTopics({ 
      search: searchTerm,
      sortBy 
    })
    if (!error && data) {
      setTopics(data)
      setView('topics')
      setSelectedCategory({ name: `Résultats pour "${searchTerm}"` })
    }
    setLoading(false)
  }

  const renderCategories = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Forum Communautaire 💬</h1>
        {!isPremium && (
          <button
            onClick={() => navigate('/premium')}
            className='btn-primary flex items-center gap-2'
          >
            <Crown size={20} />
            Premium
          </button>
        )}
      </div>

      <div className='card'>
        <div className='flex gap-2'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Rechercher dans le forum...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className='input-field pl-10'
            />
          </div>
          <button onClick={handleSearch} className='btn-primary'>
            Rechercher
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => loadTopics(category)}
            className='card hover:shadow-xl cursor-pointer transition-all'
          >
            <div className='flex items-start gap-4'>
              <div className='text-4xl'>{category.icon || '📁'}</div>
              <div className='flex-1'>
                <h3 className='text-xl font-bold mb-1'>{category.name}</h3>
                <p className='text-sm text-gray-600'>{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTopics = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => {
              setView('categories')
              setSelectedCategory(null)
              setSearchTerm('')
            }}
            className='btn-secondary flex items-center gap-2'
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div>
            <h1 className='text-2xl font-bold'>{selectedCategory?.name}</h1>
            <p className='text-sm text-gray-600'>{topics.length} discussions</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateTopic(true)}
          className='btn-primary flex items-center gap-2'
        >
          <Plus size={20} />
          Nouveau sujet
        </button>
      </div>

      <div className='card'>
        <div className='flex gap-2'>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'recent'
                ? 'bg-senegal-green text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Clock size={16} className='inline mr-2' />
            Récent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'popular'
                ? 'bg-senegal-green text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <TrendingUp size={16} className='inline mr-2' />
            Populaire
          </button>
        </div>
      </div>

      <div className='space-y-3'>
        {topics.length === 0 ? (
          <div className='card text-center py-12'>
            <MessageSquare size={64} className='mx-auto mb-4 text-gray-300' />
            <h3 className='text-xl font-semibold mb-2'>Aucune discussion</h3>
            <p className='text-gray-600'>Soyez le premier à créer un sujet!</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => loadTopic(topic)}
              className='card hover:shadow-lg cursor-pointer transition-all'
            >
              <div className='flex items-start gap-4'>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold mb-1 hover:text-senegal-green'>
                    {topic.title}
                  </h3>
                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                    {topic.content}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span>Par Utilisateur</span>
                    <span className='flex items-center gap-1'>
                      <Eye size={14} />
                      {topic.views || 0}
                    </span>
                    <span className='text-xs'>
                      {new Date(topic.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateTopic && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau sujet</h2>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Titre</label>
                <input
                  type='text'
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder='Titre de votre discussion...'
                  className='input-field'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Contenu</label>
                <textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder='Décrivez votre question ou sujet de discussion...'
                  className='input-field'
                  rows='6'
                />
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={handleCreateTopic}
                  className='btn-primary flex-1'
                >
                  Créer le sujet
                </button>
                <button
                  onClick={() => {
                    setShowCreateTopic(false)
                    setNewTopicTitle('')
                    setNewTopicContent('')
                  }}
                  className='btn-secondary'
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDiscussion = () => (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => {
            setView('topics')
            setCurrentTopic(null)
            setPosts([])
          }}
          className='btn-secondary flex items-center gap-2'
        >
          <ArrowLeft size={20} />
          Retour
        </button>
      </div>

      <div className='card'>
        <h1 className='text-2xl font-bold mb-3'>{currentTopic?.title}</h1>
        <div className='flex items-center gap-4 text-sm text-gray-500 mb-4'>
          <span>Par Utilisateur</span>
          <span className='flex items-center gap-1'>
            <Eye size={14} />
            {currentTopic?.views || 0}
          </span>
          <span>{new Date(currentTopic?.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className='prose max-w-none'>
          <p className='text-gray-700 whitespace-pre-wrap'>{currentTopic?.content}</p>
        </div>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-bold'>{posts.length} Réponses</h2>
        
        {posts.map((post) => (
          <div key={post.id} className='card'>
            <div className='flex gap-4'>
              <div className='flex flex-col items-center gap-2'>
                <button
                  onClick={() => handleVote(post.id, 'upvote')}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === 'upvote'
                      ? 'bg-senegal-green text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp size={18} />
                </button>
                <span className='font-bold'>{post.upvotes || 0}</span>
                <button
                  onClick={() => handleVote(post.id, 'downvote')}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === 'downvote'
                      ? 'bg-senegal-red text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsDown size={18} />
                </button>
              </div>

              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-semibold'>Utilisateur</span>
                  <span className='text-sm text-gray-500'>
                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className='text-gray-700 whitespace-pre-wrap'>{post.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='card'>
        <h3 className='font-bold mb-3'>Votre réponse</h3>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder='Écrivez votre réponse...'
          className='input-field mb-3'
          rows='4'
        />
        <button
          onClick={handleReply}
          className='btn-primary flex items-center gap-2'
          disabled={!replyContent.trim()}
        >
          <Send size={20} />
          Publier la réponse
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className='text-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green mx-auto'></div>
        <p className='mt-4 text-gray-600'>Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      {view === 'categories' && renderCategories()}
      {view === 'topics' && renderTopics()}
      {view === 'discussion' && renderDiscussion()}
    </div>
  )
}