import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { quizBattleService } from '../services/quizBattle'
import { supabase } from '../services/supabase'
import {
  Swords, Trophy, Users, Clock, ChevronRight, Copy, Check, X,
  Zap, Crown, ArrowLeft, Share2, History, Target, Star, Medal
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const FREE_DAILY_BATTLES = 3

export default function QuizBattlePage() {
  const { user, profile } = useAuth()
  const { isPremium } = usePremium()

  const [view, setView] = useState('home') // home | waiting | playing | results | leaderboard | history
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [battle, setBattle] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [loading, setLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [opponentProfile, setOpponentProfile] = useState(null)
  const [dailyBattles, setDailyBattles] = useState(0)
  const [lbSubject, setLbSubject] = useState('')

  const timerRef = useRef(null)
  const questionStartRef = useRef(null)
  const viewRef = useRef('home')
  const matchedRef = useRef(false)

  // Keep ref in sync with view state
  useEffect(() => { viewRef.current = view }, [view])

  const SUBJECTS = quizBattleService.SUBJECTS
  const LEVELS = quizBattleService.LEVELS

  useEffect(() => {
    if (user) {
      loadStats()
      loadDailyCount()
    }
  }, [user])

  useEffect(() => {
    if (battle) {
      matchedRef.current = false
      const sub = quizBattleService.subscribeToBattle(battle.id, async (updated) => {
        // Always re-fetch full battle to get questions JSONB
        const { data: fullBattle } = await quizBattleService.getBattle(battle.id)
        if (fullBattle) setBattle(fullBattle)

        // Host was waiting, guest joined → start playing (fire ONCE only)
        if (updated.status === 'playing' && viewRef.current === 'waiting' && !matchedRef.current) {
          matchedRef.current = true
          const b = fullBattle || updated
          const opId = b.host_id === user.id ? b.guest_id : b.host_id
          if (opId) {
            supabase.from('profiles').select('full_name, avatar_url').eq('id', opId).single().then(({ data }) => setOpponentProfile(data))
          }
          setCurrentQ(0)
          setSelectedAnswer(null)
          setAnswered(false)
          setView('playing')
          toast.success('Adversaire trouve! C\'est parti!')
        }

        if (updated.status === 'finished') {
          setView('results')
          quizBattleService.unsubscribeFromBattle(battle.id)
        }
      })
      return () => quizBattleService.unsubscribeFromBattle(battle.id)
    }
  }, [battle?.id])

  // Polling fallback for waiting screen
  useEffect(() => {
    if (view !== 'waiting' || !battle) return
    const poll = setInterval(async () => {
      const { data } = await quizBattleService.getBattle(battle.id)
      if (data && data.status === 'playing') {
        setBattle(data)
        const opId = data.host_id === user.id ? data.guest_id : data.host_id
        if (opId) {
          const { data: p } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', opId).single()
          setOpponentProfile(p)
        }
        setCurrentQ(0)
        setSelectedAnswer(null)
        setAnswered(false)
        setView('playing')
        toast.success('Adversaire trouve! C\'est parti!')
        clearInterval(poll)
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [view, battle?.id])

  // Question timer
  useEffect(() => {
    if (view === 'playing' && !answered) {
      setTimeLeft(30)
      questionStartRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [currentQ, view, answered])

  async function loadStats() {
    const s = await quizBattleService.getUserStats(user.id)
    setStats(s)
  }

  async function loadDailyCount() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('quiz_battles')
      .select('id')
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
      .gte('created_at', today)
    setDailyBattles(data?.length || 0)
  }

  async function loadLeaderboard() {
    const { data } = await quizBattleService.getLeaderboard(lbSubject || null)
    setLeaderboard(data || [])
  }

  async function loadHistory() {
    const { data } = await quizBattleService.getHistory(user.id)
    if (data) {
      // Load profiles for opponents
      for (const b of data) {
        const opId = b.host_id === user.id ? b.guest_id : b.host_id
        if (opId) {
          const { data: p } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', opId).single()
          b.opponentProfile = p
        }
      }
    }
    setHistory(data || [])
  }

  async function startMatchmaking() {
    if (!isPremium && dailyBattles >= FREE_DAILY_BATTLES) {
      toast.error(`Limite atteinte (${FREE_DAILY_BATTLES}/jour). Passez a Premium!`)
      return
    }
    if (!subject || !level) { toast.error('Choisissez matiere et niveau'); return }

    setLoading(true)
    toast.loading('Preparation des questions...', { id: 'matchmaking' })

    try {
      const { data, error, matched } = await quizBattleService.findBattle(user.id, subject, level)
      toast.dismiss('matchmaking')
      setLoading(false)

      if (error) { toast.error(error.message); return }
      if (!data) { toast.error('Erreur de creation'); return }

      setBattle(data)

      if (matched) {
      loadOpponent(data)
      setCurrentQ(0)
      setSelectedAnswer(null)
      setAnswered(false)
      setView('playing')
      toast.success('Adversaire trouve! C\'est parti!')
    } else {
      setView('waiting')
      toast.success('En attente d\'un adversaire...')
    }
    } catch (err) {
      console.error('Matchmaking error:', err)
      toast.error('Erreur, reessayez', { id: 'matchmaking' })
      setLoading(false)
    }
  }

  async function handleJoinByCode() {
    if (!joinCode.trim()) return
    setLoading(true)
    const { data, error } = await quizBattleService.joinBattle(joinCode, user.id)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setBattle(data)
    loadOpponent(data)
    setView('playing')
    setCurrentQ(0)
    setShowJoinModal(false)
    toast.success('Battle commence!')
  }

  async function loadOpponent(b) {
    const opId = b.host_id === user.id ? b.guest_id : b.host_id
    if (opId) {
      const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', opId).single()
      setOpponentProfile(data)
    }
  }

  function handleAnswer(answer) {
    if (answered || !battle?.questions) return
    clearInterval(timerRef.current)
    setSelectedAnswer(answer)
    setAnswered(true)

    const timeMs = Date.now() - questionStartRef.current
    quizBattleService.submitAnswer(battle.id, user.id, currentQ, answer, timeMs)

    setTimeout(() => {
      const total = battle.questions?.length || 0
      if (currentQ < total - 1) {
        setCurrentQ(prev => prev + 1)
        setSelectedAnswer(null)
        setAnswered(false)
      } else {
        quizBattleService.finishBattle(battle.id)
        setView('results')
      }
    }, 2000)
  }

  function handleTimeout() {
    if (!battle?.questions) return
    setAnswered(true)
    quizBattleService.submitAnswer(battle.id, user.id, currentQ, null, 30000)

    setTimeout(() => {
      const total = battle.questions?.length || 0
      if (currentQ < total - 1) {
        setCurrentQ(prev => prev + 1)
        setSelectedAnswer(null)
        setAnswered(false)
      } else {
        quizBattleService.finishBattle(battle.id)
        setView('results')
      }
    }, 2000)
  }

  function copyCode() {
    navigator.clipboard.writeText(battle?.code)
    setCopied(true)
    toast.success('Code copie!')
    setTimeout(() => setCopied(false), 2000)
  }

  const myScore = battle ? (battle.host_id === user.id ? battle.host_score : battle.guest_score) : 0
  const opScore = battle ? (battle.host_id === user.id ? battle.guest_score : battle.host_score) : 0

  // ============ HOME ============

  const renderHome = () => (
    <div className="p-4 pt-6 space-y-5">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
          <Swords size={30} className="text-orange-400" />
        </div>
        <h1 className="text-2xl font-black text-white">Quiz Battle</h1>
        <p className="text-xs text-white/40 mt-1">Defie d'autres etudiants en temps reel</p>
      </div>

      {/* Stats */}
      {stats && stats.totalBattles > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
            <p className="text-lg font-black text-green-400">{stats.wins}</p>
            <p className="text-[9px] text-white/30">Victoires</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
            <p className="text-lg font-black text-red-400">{stats.losses}</p>
            <p className="text-[9px] text-white/30">Defaites</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/20">
            <p className="text-lg font-black text-orange-400">{stats.avgScore}</p>
            <p className="text-[9px] text-white/30">Score moy.</p>
          </div>
        </div>
      )}

      {/* Subject Select */}
      <div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Matiere</p>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setSubject(s.id)}
              className={`p-3 rounded-xl text-xs font-bold text-left transition-all ${subject === s.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 border' : 'bg-white/[0.05] border border-white/[0.08] text-white/50'}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Level Select */}
      <div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Niveau</p>
        <div className="flex gap-2">
          {LEVELS.map(l => (
            <button key={l.id} onClick={() => setLevel(l.id)}
              className={`flex-1 p-3 rounded-xl text-xs font-bold text-center transition-all ${level === l.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 border' : 'bg-white/[0.05] border border-white/[0.08] text-white/50'}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Battle limit for free */}
      {!isPremium && (
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-[10px] text-white/30">{dailyBattles}/{FREE_DAILY_BATTLES} battles aujourd'hui</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={startMatchmaking} disabled={loading || !subject || !level}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm shadow-xl disabled:opacity-30 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Swords size={18} /> Trouver un adversaire</>}
        </button>

        <div className="flex gap-2">
          <button onClick={() => setShowJoinModal(true)}
            className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/[0.08]">
            <Target size={14} /> Rejoindre (code)
          </button>
          <button onClick={() => { loadLeaderboard(); setView('leaderboard') }}
            className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/[0.08]">
            <Trophy size={14} /> Classement
          </button>
          <button onClick={() => { loadHistory(); setView('history') }}
            className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/[0.08]">
            <History size={14} /> Historique
          </button>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0f2b1a] rounded-2xl w-full max-w-sm p-5 space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Rejoindre une battle</h2>
              <button onClick={() => setShowJoinModal(false)} className="p-2 rounded-lg hover:bg-white/10"><X size={18} className="text-white/50" /></button>
            </div>
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-center text-xl font-mono font-black tracking-[0.3em] text-white placeholder-white/20 outline-none uppercase" />
            <button onClick={handleJoinByCode} disabled={joinCode.length < 6 || loading}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm disabled:opacity-30">
              {loading ? 'Recherche...' : 'Rejoindre'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ============ WAITING ============

  const renderWaiting = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
      <div className="w-20 h-20 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin mb-6" />
      <h2 className="text-xl font-black text-white mb-2">Recherche d'adversaire...</h2>
      <p className="text-xs text-white/40 mb-6">{SUBJECTS.find(s => s.id === subject)?.name} · {LEVELS.find(l => l.id === level)?.name}</p>

      <div className="bg-white/[0.05] rounded-xl p-4 border border-white/[0.08] mb-6">
        <p className="text-[10px] text-white/30 mb-2">Ou invitez un ami avec ce code:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white/[0.07] rounded-lg p-3 text-center text-lg font-mono font-black tracking-widest text-orange-400">
            {battle?.code}
          </code>
          <button onClick={copyCode} className="p-3 rounded-lg bg-orange-500 text-white">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <button onClick={() => { setView('home'); setBattle(null) }}
        className="text-xs text-white/30 hover:text-white/50">Annuler</button>
    </div>
  )

  // ============ PLAYING ============

  const renderPlaying = () => {
    if (!battle?.questions?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm">Chargement des questions...</p>
          <button onClick={() => { setView('home'); setBattle(null) }} className="mt-6 text-xs text-white/30 hover:text-white/50">Annuler</button>
        </div>
      )
    }
    if (currentQ >= battle.questions.length) {
      quizBattleService.finishBattle(battle.id)
      setView('results')
      return null
    }
    if (!battle.questions[currentQ]) return null
    const q = battle.questions[currentQ]
    const total = battle.questions.length
    const progress = ((currentQ + 1) / total) * 100
    const timerDanger = timeLeft <= 10
    const timerWarn = timeLeft <= 20
    const myName = profile?.full_name?.split(' ')[0] || 'Vous'
    const opName = opponentProfile?.full_name?.split(' ')[0] || 'Adversaire'
    const myAvatar = profile?.avatar_url
    const opAvatar = opponentProfile?.avatar_url

    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] bg-[#060e09]">

        {/* ========== ELECTRONIC SCOREBOARD ========== */}
        <div className="flex-shrink-0 mx-3 mt-3">
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            {/* LED dots effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

            {/* Top bar - subject + question number */}
            <div className="relative flex items-center justify-between px-4 py-1.5 border-b border-white/[0.06]">
              <span className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-widest">{quizBattleService.SUBJECTS.find(s => s.id === battle.subject)?.name}</span>
              <span className="text-[9px] font-mono text-white/30">Q{currentQ + 1}/{total}</span>
            </div>

            {/* Main scoreboard */}
            <div className="relative flex items-center px-3 py-3">
              {/* Player 1 (You) */}
              <div className="flex-1 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-senegal-green/20 border border-senegal-green/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {myAvatar ? <img src={myAvatar} className="w-full h-full object-cover" /> :
                    <span className="text-sm font-black text-senegal-green">{myName[0]}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{myName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[8px] text-green-400/60">EN JEU</span>
                  </div>
                </div>
              </div>

              {/* Scores - LED style */}
              <div className="flex items-center gap-2 mx-2">
                <div className="w-14 h-14 rounded-xl bg-black/40 border border-senegal-green/20 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                  <span className="text-2xl font-black text-senegal-green font-mono" style={{ textShadow: '0 0 10px rgba(0,133,63,0.5)' }}>{myScore}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-white/20">VS</span>
                  <Swords size={14} className="text-orange-500/40 my-0.5" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-black/40 border border-red-500/20 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                  <span className="text-2xl font-black text-red-400 font-mono" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>{opScore}</span>
                </div>
              </div>

              {/* Player 2 (Opponent) */}
              <div className="flex-1 flex items-center gap-2.5 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-xs font-bold text-white truncate">{opName}</p>
                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                    <span className="text-[8px] text-orange-400/60">EN JEU</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {opAvatar ? <img src={opAvatar} className="w-full h-full object-cover" /> :
                    <span className="text-sm font-black text-red-400">{opName[0]}</span>}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-black/30">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: progress + '%' }} />
            </div>
          </div>
        </div>

        {/* ========== TIMER ========== */}
        <div className="flex justify-center py-3">
          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center ${timerDanger ? 'bg-red-500/10' : 'bg-white/[0.03]'}`}>
            {/* Timer ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle cx="28" cy="28" r="24" fill="none"
                stroke={timerDanger ? '#ef4444' : timerWarn ? '#f97316' : '#22c55e'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - timeLeft / 30)}`}
                className="transition-all duration-1000" />
            </svg>
            <span className={`text-lg font-black font-mono ${timerDanger ? 'text-red-400 animate-pulse' : timerWarn ? 'text-orange-400' : 'text-white'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* ========== QUESTION + OPTIONS ========== */}
        <div className="flex-1 px-3 pb-3 overflow-y-auto">
          {/* Question card */}
          <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06] mb-3">
            <p className="text-sm text-white font-semibold leading-relaxed">{q.q || 'Question en cours de chargement...'}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map(opt => {
              const isSelected = selectedAnswer === opt
              const isCorrect = q.correct === opt
              let bgClass = 'bg-white/[0.04] border-white/[0.06]'
              let textClass = 'text-white/70'
              let badgeClass = 'bg-white/10 text-white/40'

              if (answered) {
                if (isCorrect) { bgClass = 'bg-green-500/15 border-green-500/40'; textClass = 'text-green-300'; badgeClass = 'bg-green-500 text-white' }
                else if (isSelected) { bgClass = 'bg-red-500/15 border-red-500/40'; textClass = 'text-red-300'; badgeClass = 'bg-red-500 text-white' }
              } else if (isSelected) {
                bgClass = 'bg-orange-500/15 border-orange-500/40'; textClass = 'text-orange-300'; badgeClass = 'bg-orange-500 text-white'
              }

              return (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={answered}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${bgClass}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${badgeClass}`}>
                    {opt.toUpperCase()}
                  </span>
                  <span className={`flex-1 text-sm font-medium ${textClass}`}>{q[opt]}</span>
                  {answered && isCorrect && <Check size={16} className="text-green-400 flex-shrink-0" />}
                  {answered && isSelected && !isCorrect && <X size={16} className="text-red-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && q.explanation && (
            <div className="mt-3 bg-cyan-500/5 rounded-xl p-3 border border-cyan-500/10">
              <p className="text-[10px] text-cyan-400/70 font-bold mb-0.5">Explication:</p>
              <p className="text-xs text-white/40 leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ RESULTS ============

  const renderResults = () => {
    const won = myScore > opScore
    const draw = myScore === opScore

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${won ? 'bg-green-500/20 border-2 border-green-500/40' : draw ? 'bg-orange-500/20 border-2 border-orange-500/40' : 'bg-red-500/20 border-2 border-red-500/40'}`}>
          {won ? <Trophy size={40} className="text-green-400" /> : draw ? <Medal size={40} className="text-orange-400" /> : <X size={40} className="text-red-400" />}
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          {won ? 'Victoire!' : draw ? 'Egalite!' : 'Defaite!'}
        </h2>
        <p className="text-xs text-white/40 mb-6">
          {SUBJECTS.find(s => s.id === battle?.subject)?.name} · {LEVELS.find(l => l.id === battle?.level)?.name}
        </p>

        {/* Score comparison */}
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-senegal-green/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-black text-senegal-green">{myScore}</span>
            </div>
            <p className="text-xs text-white/50">Vous</p>
          </div>
          <span className="text-white/20 text-xl font-black">VS</span>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-black text-red-400">{opScore}</span>
            </div>
            <p className="text-xs text-white/50">{opponentProfile?.full_name?.split(' ')[0] || 'Adversaire'}</p>
          </div>
        </div>

        <p className="text-white/30 text-xs mb-6">{myScore}/{battle?.questions?.length} bonnes reponses</p>

        <div className="space-y-2 w-full max-w-xs">
          <button onClick={() => { setView('home'); setBattle(null); setCurrentQ(0); setSelectedAnswer(null); setAnswered(false); loadStats(); loadDailyCount() }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm">
            Rejouer
          </button>
          <button onClick={() => { loadLeaderboard(); setView('leaderboard') }}
            className="w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-bold">
            Voir le classement
          </button>
        </div>
      </div>
    )
  }

  // ============ LEADERBOARD ============

  const renderLeaderboard = () => (
    <div className="p-4 pt-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/10"><ArrowLeft size={18} className="text-white/60" /></button>
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2"><Trophy size={20} className="text-yellow-400" /> Classement National</h1>
          <p className="text-[10px] text-white/30">Les meilleurs joueurs de KanGam</p>
        </div>
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => { setLbSubject(''); setTimeout(loadLeaderboard, 0) }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${!lbSubject ? 'bg-orange-500 text-white' : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'}`}>
          Tous
        </button>
        {SUBJECTS.map(s => (
          <button key={s.id} onClick={() => { setLbSubject(s.id); setTimeout(loadLeaderboard, 0) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${lbSubject === s.id ? 'bg-orange-500 text-white' : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'}`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-16"><Trophy size={40} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/20">Aucun classement pour le moment</p><p className="text-[10px] text-white/10 mt-1">Soyez le premier a jouer!</p></div>
        ) : leaderboard.map((entry, i) => {
          const isMe = entry.user_id === user?.id
          return (
            <div key={entry.id} className={`rounded-xl p-3 border flex items-center gap-3 ${
              i === 0 ? 'bg-yellow-500/10 border-yellow-500/20' :
              i === 1 ? 'bg-gray-300/5 border-gray-400/10' :
              i === 2 ? 'bg-orange-500/5 border-orange-500/10' :
              isMe ? 'bg-senegal-green/10 border-senegal-green/20' :
              'bg-white/[0.03] border-white/[0.06]'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                i === 0 ? 'bg-yellow-500 text-black' :
                i === 1 ? 'bg-gray-400 text-black' :
                i === 2 ? 'bg-orange-600 text-white' :
                'bg-white/10 text-white/40'
              }`}>{i + 1}</div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
                {entry.profiles?.avatar_url ? <img src={entry.profiles.avatar_url} className="w-full h-full object-cover" /> : (entry.profiles?.full_name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{entry.profiles?.full_name || 'Joueur'} {isMe && <span className="text-senegal-green">(vous)</span>}</p>
                <p className="text-[9px] text-white/25">{entry.battles_played} battles · meilleur: {entry.best_score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-orange-400">{entry.total_score}</p>
                <p className="text-[9px] text-white/20">pts</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ============ HISTORY ============

  const renderHistory = () => (
    <div className="p-4 pt-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/10"><ArrowLeft size={18} className="text-white/60" /></button>
        <h1 className="text-lg font-black text-white">Historique</h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16"><History size={40} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/20">Aucune battle jouee</p></div>
      ) : (
        <div className="space-y-2">
          {history.map(b => {
            const isHost = b.host_id === user.id
            const myS = isHost ? b.host_score : b.guest_score
            const opS = isHost ? b.guest_score : b.host_score
            const won = myS > opS
            const draw = myS === opS

            return (
              <div key={b.id} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${won ? 'bg-green-500/20' : draw ? 'bg-orange-500/20' : 'bg-red-500/20'}`}>
                  {won ? <Trophy size={18} className="text-green-400" /> : draw ? <Medal size={18} className="text-orange-400" /> : <X size={18} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{SUBJECTS.find(s => s.id === b.subject)?.name}</p>
                  <p className="text-[10px] text-white/25">vs {b.opponentProfile?.full_name || 'Adversaire'} · {new Date(b.finished_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{myS}<span className="text-white/20">-</span><span className="text-white/40">{opS}</span></p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ============ MAIN ============

  return (
    <div className="min-h-screen bg-[#0a1f14] pb-24">
      {view === 'home' ? renderHome() :
       view === 'waiting' ? renderWaiting() :
       view === 'playing' ? renderPlaying() :
       view === 'results' ? renderResults() :
       view === 'leaderboard' ? renderLeaderboard() :
       view === 'history' ? renderHistory() :
       renderHome()}
    </div>
  )
}
