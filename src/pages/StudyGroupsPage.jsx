import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { studyGroupsService } from '../services/studyGroups'
import { supabase } from '../services/supabase'
import { groqService } from '../services/groq'
import {
  Users, Search, Plus, ArrowLeft, Send, Trash2, Lock, Globe,
  Copy, Check, UserPlus, UserMinus, Crown, X, ChevronRight,
  MessageCircle, FolderOpen, CalendarDays, UserCheck,
  HelpCircle, ThumbsUp, CheckCircle, Timer, Trophy, Zap,
  BookOpen, Link as LinkIcon, FileText, ExternalLink, Calendar,
  Clock, Activity, Star, Brain, ChevronDown, ChevronUp, Play, Pause,
  Mic, Square, Volume2, Video
} from 'lucide-react'
import VideoRoom from '../components/VideoRoom'
import { usePremium } from '../context/PremiumContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const FREE_MAX_GROUPS = 1

export default function StudyGroupsPage() {
  const { isPremium } = usePremium()
  const { user, profile } = useAuth()

  const [view, setView] = useState('browse')
  const [roomTab, setRoomTab] = useState('overview')

  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [currentGroup, setCurrentGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [resources, setResources] = useState([])
  const [sessions, setSessions] = useState([])
  const [activity, setActivity] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [isMember, setIsMember] = useState(false)

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [browseTab, setBrowseTab] = useState('explore')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinByCode, setShowJoinByCode] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [showAskQuestion, setShowAskQuestion] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Focus timer
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerRef = useRef(null)

  // Voice recording
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)

  // AI Tutor
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Form state
  const [messageInput, setMessageInput] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [newGroup, setNewGroup] = useState({ name: '', subject: '', description: '', maxMembers: 50, isPrivate: false })
  const [newResource, setNewResource] = useState({ title: '', url: '', fileType: 'link' })
  const [newSession, setNewSession] = useState({ title: '', description: '', scheduledAt: '', duration: 60 })
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' })
  const [answerInput, setAnswerInput] = useState('')

  const messagesEndRef = useRef(null)
  const SUBJECTS = studyGroupsService.SUBJECTS

  // ============ EFFECTS ============

  useEffect(() => {
    loadGroups()
    if (user) loadMyGroups()
  }, [user])

  useEffect(() => {
    if (currentGroup && isMember) {
      loadRoomData()
      const channel = studyGroupsService.subscribeToMessages(currentGroup.id, (newMsg) => {
        if (newMsg.user_id !== user?.id) setMessages(prev => [...prev, newMsg])
      })
      return () => studyGroupsService.unsubscribeFromMessages(currentGroup.id)
    }
  }, [currentGroup?.id, isMember])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  const loadGroups = async () => {
    setLoading(true)
    const { data } = await studyGroupsService.getGroups({ subject: selectedSubject, search: searchTerm || undefined })
    setGroups(data || [])
    setLoading(false)
  }

  const loadMyGroups = async () => {
    const { data } = await studyGroupsService.getMyGroups(user.id)
    setMyGroups(data || [])
  }

  const loadRoomData = async () => {
    setLoading(true)
    const [msgsRes, membersRes, questionsRes, resourcesRes, sessionsRes, activityRes, lbRes] = await Promise.all([
      studyGroupsService.getMessages(currentGroup.id),
      studyGroupsService.getMembers(currentGroup.id),
      studyGroupsService.getQuestions(currentGroup.id),
      studyGroupsService.getResources(currentGroup.id),
      studyGroupsService.getSessions(currentGroup.id),
      studyGroupsService.getActivity(currentGroup.id),
      studyGroupsService.getLeaderboard(currentGroup.id),
    ])
    setMessages(msgsRes.data || [])
    setMembers(membersRes.data || [])
    setQuestions(questionsRes.data || [])
    setResources(resourcesRes.data || [])
    setSessions(sessionsRes.data || [])
    setActivity(activityRes.data || [])
    setLeaderboard(lbRes.data || [])
    setLoading(false)
  }

  // ============ ACTIONS ============

  const openRoom = async (group) => {
    setCurrentGroup(group)
    setRoomTab('overview')
    setView('room')
    const { isMember: im, role } = await studyGroupsService.isMember(group.id, user.id)
    setIsMember(im)
    setMyRole(role)
  }

  const handleCreateGroup = async () => {
    if (!isPremium) { toast.error('Passez a Premium pour creer un groupe'); return }
    if (!newGroup.name.trim() || !newGroup.subject) { toast.error('Nom et matiere obligatoires'); return }
    const { data, error } = await studyGroupsService.createGroup(user.id, newGroup)
    if (!error && data) {
      toast.success('Groupe cree!')
      setShowCreateGroup(false)
      setNewGroup({ name: '', subject: '', description: '', maxMembers: 50, isPrivate: false })
      loadGroups(); loadMyGroups()
      setIsMember(true); setMyRole('admin')
      openRoom(data)
    } else toast.error(error?.message || 'Erreur')
  }

  const handleJoinGroup = async (group) => {
    if (!isPremium && myGroups.length >= FREE_MAX_GROUPS) {
      toast.error('Limite atteinte! Passez a Premium pour rejoindre plus de groupes.')
      return
    }
    const { error } = await studyGroupsService.joinGroup(group.id, user.id)
    if (!error) {
      toast.success(`Bienvenue dans "${group.name}"!`)
      setIsMember(true); setMyRole('member')
      loadMyGroups()
      studyGroupsService.logActivity(group.id, user.id, 'join', `${profile?.full_name || 'Membre'} a rejoint le groupe`)
      loadRoomData()
    } else toast.error(error.message || 'Impossible de rejoindre')
  }

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return
    const { error } = await studyGroupsService.joinByInviteCode(inviteCode, user.id)
    if (!error) {
      toast.success('Groupe rejoint!')
      setShowJoinByCode(false); setInviteCode('')
      loadMyGroups()
    } else toast.error(error.message || 'Code invalide')
  }

  const handleLeaveGroup = async () => {
    const { error } = await studyGroupsService.leaveGroup(currentGroup.id, user.id)
    if (!error) {
      toast.success('Vous avez quitte le groupe')
      setView('browse'); setCurrentGroup(null); setIsMember(false)
      loadMyGroups()
    }
  }

  const [groupMsgCount, setGroupMsgCount] = useState(0)
  const FREE_MSG_LIMIT = 5

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return
    if (!isPremium && groupMsgCount >= FREE_MSG_LIMIT) {
      toast.error('Limite atteinte! Passez a Premium pour envoyer plus de messages.')
      return
    }
    const content = messageInput; setMessageInput('')
    const { data, error } = await studyGroupsService.sendMessage(currentGroup.id, user.id, content)
    if (!error && data) {
      setMessages(prev => [...prev, data])
      if (!isPremium) setGroupMsgCount(prev => prev + 1)
    }
    else { toast.error("Erreur d'envoi"); setMessageInput(content) }
  }

  const startRecording = async () => {
    if (!isPremium) { toast.error('Passez a Premium pour envoyer des vocaux'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Pick a supported mime type
      let mimeType = 'audio/webm'
      let ext = 'webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; ext = 'mp4' }
        else if (MediaRecorder.isTypeSupported('audio/ogg')) { mimeType = 'audio/ogg'; ext = 'ogg' }
        else { mimeType = ''; ext = 'wav' }
      }

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        clearInterval(recordingTimerRef.current)
        setRecordingSeconds(0)

        const actualMime = mimeType || 'audio/wav'
        const blob = new Blob(audioChunksRef.current, { type: actualMime })
        if (blob.size < 500) { toast.error('Enregistrement trop court'); return }

        toast.loading('Envoi du vocal...', { id: 'voice-upload' })

        const fileName = `voice_${Date.now()}.${ext}`
        const filePath = `${currentGroup.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('voice-messages')
          .upload(filePath, blob, { contentType: actualMime, upsert: true })

        if (uploadError) {
          toast.error(`Erreur: ${uploadError.message}`, { id: 'voice-upload' })
          console.error('Voice upload error:', uploadError)
          return
        }

        const { data: urlData } = supabase.storage.from('voice-messages').getPublicUrl(filePath)
        const voiceUrl = urlData?.publicUrl

        if (voiceUrl) {
          const { data, error } = await studyGroupsService.sendMessage(currentGroup.id, user.id, voiceUrl, 'voice')
          if (!error && data) {
            setMessages(prev => [...prev, data])
            toast.success('Vocal envoye!', { id: 'voice-upload' })
          } else {
            toast.error("Erreur d'envoi du message", { id: 'voice-upload' })
          }
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
    } catch (err) {
      console.error('Microphone error:', err)
      toast.error('Acces au microphone refuse')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop())
      }
      mediaRecorderRef.current.stop()
    }
    clearInterval(recordingTimerRef.current)
    setIsRecording(false)
    setRecordingSeconds(0)
    audioChunksRef.current = []
  }

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return
    setAiLoading(true); setAiAnswer('')
    const subject = currentGroup?.subject || 'general'
    const result = await groqService.chat([{ role: 'user', content: aiQuestion }], subject)
    if (result.content) {
      setAiAnswer(result.content)
      studyGroupsService.logActivity(currentGroup.id, user.id, 'ai_ask', `${profile?.full_name || 'Membre'} a pose une question a l'IA: "${aiQuestion.substring(0, 50)}..."`)
    } else setAiAnswer("Erreur: impossible de contacter l'IA.")
    setAiLoading(false)
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.title.trim()) { toast.error('Titre obligatoire'); return }
    const { data, error } = await studyGroupsService.createQuestion(currentGroup.id, user.id, newQuestion.title, newQuestion.content)
    if (!error) {
      toast.success('Question postee!')
      setShowAskQuestion(false); setNewQuestion({ title: '', content: '' })
      studyGroupsService.logActivity(currentGroup.id, user.id, 'question', `${profile?.full_name || 'Membre'} a pose une question: "${data?.title || newQuestion.title}"`)
      const { data: qs } = await studyGroupsService.getQuestions(currentGroup.id)
      setQuestions(qs || [])
    } else {
      console.error('Create question error:', error)
      toast.error(error.message || 'Erreur lors de la creation')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim() || !currentQuestion) return
    const { error } = await studyGroupsService.createAnswer(currentQuestion.id, user.id, answerInput)
    if (!error) {
      toast.success('Reponse envoyee!')
      setAnswerInput('')
      studyGroupsService.logActivity(currentGroup.id, user.id, 'answer', `${profile?.full_name || 'Membre'} a repondu a: "${currentQuestion.title}"`)
      const { data } = await studyGroupsService.getAnswers(currentQuestion.id)
      setAnswers(data || [])
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) { toast.error('Titre et lien obligatoires'); return }
    const { error } = await studyGroupsService.addResource(currentGroup.id, user.id, newResource)
    if (!error) {
      toast.success('Ressource ajoutee!')
      setShowAddResource(false); setNewResource({ title: '', url: '', fileType: 'link' })
      studyGroupsService.logActivity(currentGroup.id, user.id, 'resource', `${profile?.full_name || 'Membre'} a partage: "${newResource.title}"`)
      const { data } = await studyGroupsService.getResources(currentGroup.id)
      setResources(data || [])
    }
  }

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !newSession.scheduledAt) { toast.error('Titre et date obligatoires'); return }
    const { error } = await studyGroupsService.createSession(currentGroup.id, user.id, newSession)
    if (!error) {
      toast.success('Session planifiee!')
      setShowCreateSession(false); setNewSession({ title: '', description: '', scheduledAt: '', duration: 60 })
      studyGroupsService.logActivity(currentGroup.id, user.id, 'session', `${profile?.full_name || 'Membre'} a planifie: "${newSession.title}"`)
      const { data } = await studyGroupsService.getSessions(currentGroup.id)
      setSessions(data || [])
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentGroup.invite_code)
    setCopiedCode(true); toast.success('Code copie!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const getMemberCount = (g) => g.study_group_members?.[0]?.count || 0

  const formatTimer = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const getActivityIcon = (type) => {
    const icons = { join: '👋', question: '📝', answer: '💬', resource: '📎', session: '📅', ai_ask: '🤖' }
    return icons[type] || '📌'
  }

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000
    if (diff < 60) return "a l'instant"
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
    return new Date(date).toLocaleDateString('fr-FR')
  }

  // ============ BROWSE / MY GROUPS ============

  const renderBrowse = () => (
    <div className="space-y-5 p-4 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Groupes d'Etude</h1>
          <p className="text-xs text-white/40 mt-1">Collaborez, apprenez, reussissez ensemble</p>
        </div>
        <div className="flex gap-2 mr-14">
          <button onClick={() => setShowJoinByCode(true)} className="p-2.5 rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-all">
            <UserPlus size={18} className="text-white/70" />
          </button>
          <button onClick={() => setShowCreateGroup(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-senegal-green to-emerald-600 text-white font-bold text-sm shadow-lg flex items-center gap-2">
            <Plus size={16} /> Creer
          </button>
        </div>
      </div>

      <div className="flex bg-white/[0.05] rounded-xl p-1 border border-white/10">
        {[{ id: 'explore', icon: Globe, label: 'Explorer' }, { id: 'mine', icon: BookOpen, label: 'Mes Groupes' }].map(t => (
          <button key={t.id} onClick={() => { setBrowseTab(t.id); if (t.id === 'mine') loadMyGroups() }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${browseTab === t.id ? 'bg-senegal-green text-white shadow' : 'text-white/40'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {browseTab === 'explore' && (
        <>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input type="text" placeholder="Rechercher un groupe..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadGroups()}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 focus:border-senegal-green/50 outline-none text-sm text-white placeholder-white/25" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <button onClick={() => { setSelectedSubject(null); setTimeout(loadGroups, 0) }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedSubject ? 'bg-senegal-green text-white' : 'bg-white/[0.07] text-white/50 border border-white/10'}`}>
              Tous
            </button>
            {SUBJECTS.map(s => (
              <button key={s.id} onClick={() => { setSelectedSubject(s.id); setTimeout(loadGroups, 0) }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${selectedSubject === s.id ? 'bg-senegal-green text-white' : 'bg-white/[0.07] text-white/50 border border-white/10'}`}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-senegal-green"></div></div>
      ) : (
        <div className="space-y-3">
          {(browseTab === 'mine' ? myGroups : groups).length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/50 font-semibold">{browseTab === 'mine' ? 'Aucun groupe rejoint' : 'Aucun groupe trouve'}</p>
              <p className="text-white/30 text-xs mt-1 mb-5">{browseTab === 'mine' ? 'Explorez et rejoignez un groupe' : 'Creez le premier!'}</p>
              <button onClick={() => browseTab === 'mine' ? setBrowseTab('explore') : setShowCreateGroup(true)}
                className="px-5 py-2.5 rounded-xl bg-senegal-green text-white text-sm font-bold">
                {browseTab === 'mine' ? 'Explorer' : 'Creer un groupe'}
              </button>
            </div>
          ) : (
            (browseTab === 'mine' ? myGroups : groups).map(group => {
              const subject = studyGroupsService.getSubjectById(group.subject)
              const count = getMemberCount(group)
              return (
                <div key={group.id} onClick={() => openRoom(group)}
                  className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${subject?.color || 'bg-gray-600'} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                      {subject?.icon || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate text-sm">{group.name}</h3>
                        {group.myRole === 'admin' && <Crown size={12} className="text-yellow-400 flex-shrink-0" />}
                        {group.is_private && <Lock size={12} className="text-white/30 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-white/30 flex items-center gap-1"><Users size={11} />{count}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.07] text-white/40">{subject?.name}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-all" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )

  // ============ ROOM OVERVIEW (THE WORKSPACE) ============

  const renderOverview = () => {
    const onlineMembers = members.filter(m => m.profiles?.is_online)
    const nextSession = sessions.find(s => new Date(s.scheduled_at) >= new Date() && s.status !== 'cancelled')
    const openQuestions = questions.filter(q => !q.is_solved).length

    return (
      <div className="overflow-y-auto h-full p-4 space-y-4">
        {/* Live Status Bar */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">En direct</span>
            </div>
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, 5).map(m => (
                <div key={m.user_id} className="w-7 h-7 rounded-full bg-white/20 border-2 border-[#0a1f14] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                  {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} className="w-full h-full object-cover" /> : (m.profiles?.full_name || '?')[0]}
                </div>
              ))}
              {onlineMembers.length > 5 && <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#0a1f14] flex items-center justify-center text-[10px] text-white/50">+{onlineMembers.length - 5}</div>}
            </div>
          </div>
          <p className="text-white/60 text-xs">{onlineMembers.length} membre{onlineMembers.length > 1 ? 's' : ''} en ligne · {members.length} au total</p>
        </div>

        {/* Focus Timer */}
        <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Chronometre d'etude</p>
              <p className="text-3xl font-black text-white font-mono">{formatTimer(timerSeconds)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTimerRunning(!timerRunning)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${timerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-senegal-green hover:bg-emerald-600'}`}>
                {timerRunning ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
              </button>
              {timerSeconds > 0 && (
                <button onClick={() => { setTimerRunning(false); setTimerSeconds(0) }}
                  className="w-12 h-12 rounded-xl bg-white/[0.07] flex items-center justify-center hover:bg-white/[0.12] transition-all">
                  <X size={18} className="text-white/50" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setRoomTab('qa')} className="bg-white/[0.05] rounded-xl p-3 border border-white/[0.08] text-center hover:bg-white/[0.08] transition-all">
            <HelpCircle size={18} className="mx-auto mb-1 text-purple-400" />
            <p className="text-lg font-black text-white">{openQuestions}</p>
            <p className="text-[9px] text-white/30 font-semibold">Questions</p>
          </button>
          <button onClick={() => setRoomTab('resources')} className="bg-white/[0.05] rounded-xl p-3 border border-white/[0.08] text-center hover:bg-white/[0.08] transition-all">
            <FolderOpen size={18} className="mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-black text-white">{resources.length}</p>
            <p className="text-[9px] text-white/30 font-semibold">Ressources</p>
          </button>
          <button onClick={() => setRoomTab('sessions')} className="bg-white/[0.05] rounded-xl p-3 border border-white/[0.08] text-center hover:bg-white/[0.08] transition-all">
            <CalendarDays size={18} className="mx-auto mb-1 text-orange-400" />
            <p className="text-lg font-black text-white">{sessions.length}</p>
            <p className="text-[9px] text-white/30 font-semibold">Sessions</p>
          </button>
        </div>

        {/* Next Session Alert */}
        {nextSession && (
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl p-3.5 border border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center"><CalendarDays size={18} className="text-orange-400" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{nextSession.title}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {new Date(nextSession.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} a {new Date(nextSession.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Bientot</span>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Activite recente</p>
          {activity.length === 0 ? (
            <div className="text-center py-8"><Activity size={32} className="mx-auto mb-2 text-white/10" /><p className="text-xs text-white/20">Aucune activite</p></div>
          ) : (
            <div className="space-y-2">
              {activity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <span className="text-sm mt-0.5">{getActivityIcon(a.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 leading-relaxed">{a.content}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ Q&A BOARD ============

  const renderQA = () => (
    <div className="overflow-y-auto h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">Questions & Reponses</h3>
          <p className="text-[10px] text-white/30">{questions.filter(q => !q.is_solved).length} questions ouvertes</p>
        </div>
        <button onClick={() => setShowAskQuestion(true)} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5">
          <HelpCircle size={13} /> Poser
        </button>
      </div>

      {currentQuestion ? (
        <div className="space-y-3">
          <button onClick={() => { setCurrentQuestion(null); setAnswers([]) }} className="text-xs text-white/40 flex items-center gap-1 hover:text-white/60"><ArrowLeft size={14} /> Retour</button>

          <div className="bg-white/[0.05] rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {currentQuestion.is_solved && <CheckCircle size={14} className="text-green-400" />}
                  <h4 className="font-bold text-white text-sm">{currentQuestion.title}</h4>
                </div>
                {currentQuestion.content && <p className="text-xs text-white/50 mt-1 whitespace-pre-wrap">{currentQuestion.content}</p>}
                <p className="text-[10px] text-white/25 mt-2">Par {currentQuestion.profiles?.full_name || 'Membre'} · {timeAgo(currentQuestion.created_at)}</p>
              </div>
              <div className="flex flex-col items-center ml-3">
                <button onClick={() => studyGroupsService.voteQuestion(currentQuestion.id, 1).then(() => { setCurrentQuestion(q => ({ ...q, upvotes: (q.upvotes || 0) + 1 })) })}
                  className="p-1 hover:bg-white/10 rounded"><ChevronUp size={16} className="text-white/40" /></button>
                <span className="text-xs font-bold text-white/60">{currentQuestion.upvotes || 0}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{answers.length} Reponses</p>

          {answers.map(a => (
            <div key={a.id} className={`bg-white/[0.04] rounded-xl p-3 border ${a.is_best ? 'border-green-500/30 bg-green-500/5' : 'border-white/[0.06]'}`}>
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center">
                  <button onClick={() => studyGroupsService.voteAnswer(a.id, 1).then(({ data }) => { if (data) setAnswers(prev => prev.map(x => x.id === a.id ? { ...x, upvotes: data.upvotes } : x)) })}
                    className="p-0.5 hover:bg-white/10 rounded"><ChevronUp size={14} className="text-white/40" /></button>
                  <span className="text-[10px] font-bold text-white/50">{a.upvotes || 0}</span>
                </div>
                <div className="flex-1">
                  {a.is_best && <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 mb-1"><CheckCircle size={10} /> Meilleure reponse</span>}
                  <p className="text-xs text-white/60 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-[10px] text-white/25 mt-1.5">{a.profiles?.full_name || 'Membre'} · {timeAgo(a.created_at)}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input type="text" value={answerInput} onChange={(e) => setAnswerInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder="Votre reponse..." className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/50" />
            <button onClick={handleSubmitAnswer} disabled={!answerInput.trim()} className="p-2.5 rounded-xl bg-purple-500 text-white disabled:opacity-30"><Send size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.length === 0 ? (
            <div className="text-center py-12"><HelpCircle size={40} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/30">Aucune question pour le moment</p></div>
          ) : questions.map(q => (
            <div key={q.id} onClick={async () => { setCurrentQuestion(q); const { data } = await studyGroupsService.getAnswers(q.id); setAnswers(data || []) }}
              className="bg-white/[0.05] rounded-xl p-3.5 border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <ChevronUp size={14} className="text-white/30" />
                  <span className="text-xs font-bold text-white/50">{q.upvotes || 0}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {q.is_solved && <CheckCircle size={12} className="text-green-400 flex-shrink-0" />}
                    <h4 className="font-semibold text-white text-xs truncate">{q.title}</h4>
                  </div>
                  <p className="text-[10px] text-white/25 mt-1">{q.profiles?.full_name || 'Membre'} · {timeAgo(q.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ============ AI TUTOR ============

  const renderPremiumBlock = (feature) => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-senegal-yellow/10 border border-senegal-yellow/20 flex items-center justify-center mb-4">
        <Lock size={28} className="text-senegal-yellow" />
      </div>
      <h3 className="text-lg font-black text-white mb-1">{feature}</h3>
      <p className="text-xs text-white/30 mb-5 max-w-[240px]">Passez a Premium pour debloquer cette fonctionnalite</p>
      <Link to="/premium" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-senegal-green via-senegal-yellow to-senegal-red text-white font-bold text-xs shadow-lg">
        <Crown size={14} className="inline mr-1.5 -mt-0.5" /> Passer a Premium
      </Link>
    </div>
  )

  const renderAI = () => (
    !isPremium ? renderPremiumBlock('Tuteur IA du Groupe') :
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} className="text-cyan-400" />
          <h3 className="font-bold text-white text-sm">Tuteur IA du Groupe</h3>
        </div>
        <p className="text-[10px] text-white/30">Posez une question sur {studyGroupsService.getSubjectById(currentGroup?.subject)?.name || 'ce sujet'} — tout le groupe beneficie des reponses!</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {aiAnswer ? (
          <div className="space-y-3">
            <div className="bg-white/[0.05] rounded-xl p-3 border border-white/[0.08]">
              <p className="text-[10px] font-bold text-white/30 mb-1">Votre question:</p>
              <p className="text-xs text-white/70">{aiQuestion}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-cyan-400" />
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Reponse IA</p>
              </div>
              <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed">{aiAnswer}</p>
            </div>
            <button onClick={() => { setAiAnswer(''); setAiQuestion('') }} className="text-xs text-white/30 hover:text-white/50 transition-all">Poser une autre question</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Brain size={28} className="text-cyan-400" />
            </div>
            <p className="text-white/50 text-sm font-semibold mb-1">Tuteur IA</p>
            <p className="text-white/25 text-xs max-w-[250px]">Specialise en {studyGroupsService.getSubjectById(currentGroup?.subject)?.name}. Posez n'importe quelle question!</p>
          </div>
        )}
      </div>

      {!aiAnswer && (
        <div className="flex gap-2">
          <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Posez votre question..." className="flex-1 px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-500/50" />
          <button onClick={handleAskAI} disabled={!aiQuestion.trim() || aiLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-30 transition-all">
            {aiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      )}
    </div>
  )

  // ============ RESOURCES ============

  const renderResources = () => (
    <div className="overflow-y-auto h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Bibliotheque</h3>
        <button onClick={() => setShowAddResource(true)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"><Plus size={13} /> Ajouter</button>
      </div>
      {resources.length === 0 ? (
        <div className="text-center py-12"><FolderOpen size={40} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/30">Aucune ressource</p></div>
      ) : (
        <div className="space-y-2">
          {resources.map(res => (
            <div key={res.id} className="bg-white/[0.05] rounded-xl p-3 border border-white/[0.08] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                {res.file_type === 'pdf' ? <FileText size={18} className="text-blue-400" /> :
                 res.file_type === 'video' ? <ExternalLink size={18} className="text-red-400" /> :
                 <LinkIcon size={18} className="text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-xs text-white hover:text-senegal-green truncate block">{res.title}</a>
                <p className="text-[10px] text-white/25">Par {res.profiles?.full_name || 'Membre'} · {timeAgo(res.created_at)}</p>
              </div>
              {res.user_id === user?.id && <button onClick={() => studyGroupsService.deleteResource(res.id, user.id).then(() => setResources(prev => prev.filter(r => r.id !== res.id)))} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50"><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ============ SESSIONS ============

  const renderSessions = () => {
    const upcoming = sessions.filter(s => new Date(s.scheduled_at) >= new Date() && s.status !== 'cancelled')
    const past = sessions.filter(s => new Date(s.scheduled_at) < new Date() || s.status === 'cancelled')

    return (
      <div className="overflow-y-auto h-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Sessions d'etude</h3>
          <button onClick={() => setShowCreateSession(true)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5"><Plus size={13} /> Planifier</button>
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-12"><CalendarDays size={40} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/30">Aucune session planifiee</p></div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider">A venir</p>
                {upcoming.map(s => (
                  <div key={s.id} className="bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-xl p-3.5 border border-orange-500/15">
                    <h4 className="font-bold text-white text-xs">{s.title}</h4>
                    {s.description && <p className="text-[10px] text-white/40 mt-0.5">{s.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                      <span className="flex items-center gap-1"><Calendar size={10} />{new Date(s.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(s.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{s.duration_minutes}min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Passees</p>
                {past.map(s => (
                  <div key={s.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] opacity-50">
                    <h4 className="font-semibold text-white/60 text-xs">{s.title}</h4>
                    <p className="text-[10px] text-white/20 mt-1">{new Date(s.scheduled_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ============ LEADERBOARD ============

  const renderLeaderboard = () => (
    <div className="overflow-y-auto h-full p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Trophy size={18} className="text-yellow-400" />
        <h3 className="font-bold text-white text-sm">Classement</h3>
      </div>
      <p className="text-[10px] text-white/30 -mt-2">Les membres les plus actifs du groupe</p>

      <div className="space-y-2">
        {leaderboard.map((entry, i) => (
          <div key={entry.user_id} className={`rounded-xl p-3 border flex items-center gap-3 ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/20' : i === 1 ? 'bg-gray-300/5 border-gray-400/10' : i === 2 ? 'bg-orange-500/5 border-orange-500/10' : 'bg-white/[0.03] border-white/[0.06]'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/40'}`}>
              {i + 1}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
              {entry.profiles?.avatar_url ? <img src={entry.profiles.avatar_url} className="w-full h-full object-cover" /> : (entry.profiles?.full_name || '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{entry.profiles?.full_name || 'Membre'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-white/25">{entry.messages} msgs</span>
                <span className="text-[9px] text-white/25">{entry.questions} Q</span>
                <span className="text-[9px] text-white/25">{entry.answers} A</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{entry.score}</p>
              <p className="text-[9px] text-white/25">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ============ CHAT (Compact) ============

  // ============ RENDER: LIVE VIDEO ============

  const renderLive = () => (
    !isPremium ? renderPremiumBlock('Live Video') :
    <VideoRoom
      roomId={currentGroup?.id}
      userId={user?.id}
      userName={profile?.full_name || 'Etudiant'}
      onLeave={() => setRoomTab('overview')}
    />
  )

  const VoiceMessage = ({ url, isMe }) => {
    const [playing, setPlaying] = useState(false)
    const audioRef = useRef(null)

    const toggle = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(url)
        audioRef.current.onended = () => setPlaying(false)
      }
      if (playing) { audioRef.current.pause(); setPlaying(false) }
      else { audioRef.current.play(); setPlaying(true) }
    }

    return (
      <button onClick={toggle} className="flex items-center gap-2.5 min-w-[140px]">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-white/20' : 'bg-white/10'}`}>
          {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
        </div>
        <div className="flex-1 flex items-center gap-0.5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`w-1 rounded-full transition-all ${playing ? 'animate-pulse' : ''} ${isMe ? 'bg-white/40' : 'bg-white/20'}`}
              style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <Volume2 size={12} className={isMe ? 'text-white/40' : 'text-white/20'} />
      </button>
    )
  }

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full"><MessageCircle size={32} className="text-white/10 mb-2" /><p className="text-xs text-white/20">Demarrez la discussion</p></div>
        ) : messages.map(msg => {
          const isMe = msg.user_id === user?.id
          const isVoice = msg.type === 'voice'
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                {!isMe && <p className="text-[10px] font-semibold text-white/30 mb-0.5 ml-1">{msg.profiles?.full_name || 'Membre'}</p>}
                <div className={`rounded-2xl px-3.5 py-2 ${isMe ? 'bg-senegal-green text-white rounded-br-md' : 'bg-white/10 text-white/80 rounded-bl-md'}`}>
                  {isVoice ? (
                    <VoiceMessage url={msg.content} isMe={isMe} />
                  ) : (
                    <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[9px] mt-0.5 ${isMe ? 'text-white/40' : 'text-white/20'}`}>{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 bg-[#0a1f14] border-t border-white/[0.06]">
        {isRecording ? (
          <div className="flex items-center gap-3">
            <button onClick={cancelRecording} className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] transition-all">
              <X size={16} className="text-white/50" />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono font-bold text-red-400">{Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
              <div className="flex-1 flex items-center gap-0.5 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-1 rounded-full bg-red-400/40 animate-pulse" style={{ height: `${6 + Math.random() * 14}px`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
            <button onClick={stopRecording} className="p-2.5 rounded-xl bg-senegal-green text-white">
              <Send size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Message..." className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/25 outline-none focus:border-senegal-green/50" />
            {messageInput.trim() ? (
              <button onClick={handleSendMessage} className="p-2.5 rounded-xl bg-senegal-green text-white"><Send size={16} /></button>
            ) : (
              <button onClick={startRecording} className="p-2.5 rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-all">
                <Mic size={16} className="text-white/60" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // ============ ROOM (WORKSPACE) ============

  const renderRoom = () => {
    if (!currentGroup) return null
    const subject = studyGroupsService.getSubjectById(currentGroup.subject)

    const roomTabs = [
      { id: 'overview', icon: Zap, label: 'Espace' },
      { id: 'live', icon: Video, label: 'Live', highlight: true },
      { id: 'qa', icon: HelpCircle, label: 'Q&A' },
      { id: 'ai', icon: Brain, label: 'IA' },
      { id: 'resources', icon: FolderOpen, label: 'Docs' },
      { id: 'sessions', icon: CalendarDays, label: 'Sessions' },
      { id: 'leaderboard', icon: Trophy, label: 'Top' },
      { id: 'chat', icon: MessageCircle, label: 'Chat' },
    ]

    return (
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Room Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 bg-[#0a1f14]">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => { setView('browse'); setBrowseTab('mine'); setCurrentGroup(null); loadMyGroups() }} className="p-2 rounded-lg hover:bg-white/10 transition-all">
              <ArrowLeft size={18} className="text-white/60" />
            </button>
            <div className={`w-9 h-9 rounded-xl ${subject?.color || 'bg-gray-600'} flex items-center justify-center text-base shadow`}>
              {subject?.icon || '📝'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-white text-sm truncate">{currentGroup.name}</h2>
              <p className="text-[10px] text-white/30">{subject?.name} · {members.length} membres</p>
            </div>
            {!isMember ? (
              <button onClick={() => handleJoinGroup(currentGroup)} className="px-4 py-2 rounded-xl bg-senegal-green text-white text-xs font-bold">Rejoindre</button>
            ) : (
              <button onClick={copyInviteCode} className="p-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-all">
                {copiedCode ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/40" />}
              </button>
            )}
          </div>

          {/* Room Nav */}
          {isMember && (
            <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {roomTabs.map(t => (
                <button key={t.id} onClick={() => setRoomTab(t.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    roomTab === t.id
                      ? t.highlight ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.12] text-white'
                      : t.highlight ? 'text-red-400/50 hover:text-red-400' : 'text-white/30 hover:text-white/50'
                  }`}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room Content */}
        <div className="flex-1 overflow-hidden bg-[#071510]">
          {!isMember ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className={`w-20 h-20 rounded-2xl ${subject?.color} flex items-center justify-center text-4xl mb-4 shadow-xl`}>{subject?.icon}</div>
              <h3 className="text-lg font-black text-white mb-1">{currentGroup.name}</h3>
              <p className="text-xs text-white/40 mb-6 max-w-[280px]">{currentGroup.description || 'Rejoignez ce groupe pour collaborer avec les autres membres.'}</p>
              <button onClick={() => handleJoinGroup(currentGroup)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-senegal-green to-emerald-600 text-white font-bold text-sm shadow-xl"><UserPlus size={16} className="inline mr-2 -mt-0.5" />Rejoindre</button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-senegal-green"></div></div>
          ) : (
            roomTab === 'overview' ? renderOverview() :
            roomTab === 'live' ? renderLive() :
            roomTab === 'qa' ? renderQA() :
            roomTab === 'ai' ? renderAI() :
            roomTab === 'resources' ? renderResources() :
            roomTab === 'sessions' ? renderSessions() :
            roomTab === 'leaderboard' ? renderLeaderboard() :
            renderChat()
          )}
        </div>
      </div>
    )
  }

  // ============ MODALS ============

  const modalInput = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senegal-green focus:ring-2 focus:ring-senegal-green/20 outline-none text-sm"

  const renderModals = () => (
    <>
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60]">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 pb-8 space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-white pt-1 pb-2 z-10">
                <h2 className="text-xl font-black">Creer un groupe</h2>
                <button onClick={() => setShowCreateGroup(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du groupe *</label>
                <input type="text" value={newGroup.name} onChange={(e) => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="Ex: BAC S2 - Maths 2026" className={modalInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Matiere *</label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => setNewGroup(p => ({ ...p, subject: s.id }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${newGroup.subject === s.id ? 'bg-senegal-green text-white border-senegal-green' : 'bg-white border-gray-200 text-gray-600'}`}>
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={newGroup.description} onChange={(e) => setNewGroup(p => ({ ...p, description: e.target.value }))} placeholder="Objectif du groupe..." rows="2" className={modalInput + ' resize-none'} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max</label>
                  <input type="number" value={newGroup.maxMembers} onChange={(e) => setNewGroup(p => ({ ...p, maxMembers: parseInt(e.target.value) || 50 }))} min="2" max="200" className={modalInput} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Visibilite</label>
                  <button onClick={() => setNewGroup(p => ({ ...p, isPrivate: !p.isPrivate }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 ${newGroup.isPrivate ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {newGroup.isPrivate ? <><Lock size={16} /> Prive</> : <><Globe size={16} /> Public</>}
                  </button>
                </div>
              </div>
              <button onClick={handleCreateGroup} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-senegal-green to-emerald-600 text-white font-black text-sm shadow-lg">Creer le groupe</button>
            </div>
          </div>
        </div>
      )}

      {showJoinByCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Rejoindre avec un code</h2>
              <button onClick={() => setShowJoinByCode(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senegal-green outline-none text-center text-xl font-mono font-black tracking-[0.3em] uppercase" />
            <button onClick={handleJoinByCode} disabled={inviteCode.length < 6} className="w-full py-3 rounded-xl bg-senegal-green text-white font-bold text-sm disabled:opacity-40">Rejoindre</button>
          </div>
        </div>
      )}

      {showAskQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Poser une question</h2>
              <button onClick={() => setShowAskQuestion(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <input type="text" value={newQuestion.title} onChange={(e) => setNewQuestion(p => ({ ...p, title: e.target.value }))} placeholder="Votre question..." className={modalInput} />
            <textarea value={newQuestion.content} onChange={(e) => setNewQuestion(p => ({ ...p, content: e.target.value }))} placeholder="Details (optionnel)..." rows="3" className={modalInput + ' resize-none'} />
            <button onClick={handleCreateQuestion} className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-sm">Publier</button>
          </div>
        </div>
      )}

      {showAddResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Ajouter une ressource</h2>
              <button onClick={() => setShowAddResource(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <input type="text" value={newResource.title} onChange={(e) => setNewResource(p => ({ ...p, title: e.target.value }))} placeholder="Titre..." className={modalInput} />
            <input type="url" value={newResource.url} onChange={(e) => setNewResource(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className={modalInput} />
            <div className="flex gap-2">
              {['link', 'pdf', 'video', 'doc'].map(t => (
                <button key={t} onClick={() => setNewResource(p => ({ ...p, fileType: t }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newResource.fileType === t ? 'bg-senegal-green text-white border-senegal-green' : 'border-gray-200 text-gray-600'}`}>{t.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={handleAddResource} className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold text-sm">Ajouter</button>
          </div>
        </div>
      )}

      {showCreateSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Planifier une session</h2>
              <button onClick={() => setShowCreateSession(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <input type="text" value={newSession.title} onChange={(e) => setNewSession(p => ({ ...p, title: e.target.value }))} placeholder="Titre..." className={modalInput} />
            <textarea value={newSession.description} onChange={(e) => setNewSession(p => ({ ...p, description: e.target.value }))} placeholder="Objectifs..." rows="2" className={modalInput + ' resize-none'} />
            <div className="flex gap-3">
              <div className="flex-1"><input type="datetime-local" value={newSession.scheduledAt} onChange={(e) => setNewSession(p => ({ ...p, scheduledAt: e.target.value }))} className={modalInput} /></div>
              <div className="w-24"><input type="number" value={newSession.duration} onChange={(e) => setNewSession(p => ({ ...p, duration: parseInt(e.target.value) || 60 }))} min="15" step="15" className={modalInput} /></div>
            </div>
            <button onClick={handleCreateSession} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm">Planifier</button>
          </div>
        </div>
      )}
    </>
  )

  // ============ MAIN ============

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24">
      {view === 'room' ? renderRoom() : renderBrowse()}
      {renderModals()}
    </div>
  )
}
