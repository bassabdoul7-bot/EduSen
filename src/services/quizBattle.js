import { supabase } from './supabase'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SUBJECTS = [
  { id: 'math', name: 'Maths' },
  { id: 'physics', name: 'Physique' },
  { id: 'chemistry', name: 'Chimie' },
  { id: 'biology', name: 'SVT' },
  { id: 'french', name: 'Francais' },
  { id: 'english', name: 'Anglais' },
  { id: 'history', name: 'Histoire-Geo' },
  { id: 'philosophy', name: 'Philo' },
  { id: 'economics', name: 'Economie' },
  { id: 'general', name: 'Culture Generale' },
]

const LEVELS = [
  { id: 'bfem', name: 'BFEM' },
  { id: 'bac', name: 'BAC' },
  { id: 'licence', name: 'Licence / Concours' },
]

async function generateQuestions(subject, level, count = 10) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: `Generateur de QCM difficiles. Reponds UNIQUEMENT en JSON: [{"q":"...","a":"...","b":"...","c":"...","d":"...","correct":"a","explanation":"..."}]. Pas de texte avant/apres.`
      }, {
        role: 'user',
        content: `Voici des exemples de VRAIES questions de niveau ${level} au Senegal:

${level === 'bac' ? `EXEMPLES BAC SENEGALAIS (ce niveau est OBLIGATOIRE):
- Maths S2: "Soit f(x) = (x²-3x+2)/(x-1). Determiner la limite de f en 1. a) 1  b) -1  c) 0  d) N'existe pas"
- Physique: "Un projectile est lance avec une vitesse initiale de 20 m/s sous un angle de 60° avec l'horizontale. Quelle est la portee du tir? (g=10m/s²) a) 34.6m  b) 20m  c) 40m  d) 17.3m"
- Philo: "Selon Kant, l'imperatif categorique exige d'agir: a) Selon ses interets  b) Selon la loi morale universelle  c) Selon les consequences  d) Selon la tradition"
- SVT: "Dans la mitose, l'anaphase se caracterise par: a) La condensation des chromosomes  b) L'alignement sur la plaque equatoriale  c) La separation des chromatides soeurs  d) La decondensation"
- Histoire: "Le traite de Protectorat entre la France et le Cayor a ete signe en: a) 1855  b) 1886  c) 1895  d) 1902"` :
level === 'licence' ? `EXEMPLES CONCOURS ENA/ESP (TRES DIFFICILE):
- Droit: "L'article 92 de la Constitution senegalaise porte sur: a) Le Conseil constitutionnel  b) La Haute Cour de Justice  c) Le Conseil economique et social  d) La Cour des comptes"
- Economie: "Le taux de croissance du PIB du Senegal dans le cadre du PSE vise: a) 5%  b) 7%  c) 10%  d) 3%"
- Culture G: "Le bassin sedimentaire senegalais contient des reserves estimees de gaz naturel a: a) Grand Tortue/Ahmeyim  b) Rufisque Offshore  c) Sangomar  d) Cayar Offshore"` :
`EXEMPLES BFEM (niveau 3eme):
- Maths: "Resoudre: 2x² - 5x + 3 = 0. Les solutions sont: a) x=1 et x=3/2  b) x=1 et x=3  c) x=-1 et x=3/2  d) x=2 et x=3"
- Francais: "Dans 'L'enfant noir' de Camara Laye, le personnage principal grandit a: a) Conakry  b) Kouroussa  c) Dakar  d) Bamako"
- Histoire: "L'AOF (Afrique Occidentale Francaise) a ete creee en: a) 1895  b) 1900  c) 1885  d) 1910"`}

MAINTENANT genere ${count} questions AUSSI DIFFICILES que ces exemples en ${subject}. Niveau: ${level}.
- Questions d'APPLICATION et de REFLEXION, pas de definitions basiques
- 4 options toutes PLAUSIBLES et proches
- Inclus 2 questions sur le Senegal/Afrique
- Si c'est des maths/physique: mets de VRAIS calculs`
      }],
      temperature: 0.4,
      max_tokens: 4000,
    })
  })

  const data = await response.json()
  const text = data.choices[0]?.message?.content || '[]'

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response')

  const questions = JSON.parse(jsonMatch[0])
  return questions.slice(0, count)
}

export const quizBattleService = {
  SUBJECTS,
  LEVELS,

  // Create a battle room
  createBattle: async (userId, subject, level) => {
    const questions = await generateQuestions(subject, level)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from('quiz_battles')
      .insert({
        code,
        host_id: userId,
        subject,
        level,
        questions,
        status: 'waiting',
        host_score: 0,
        guest_score: 0,
        host_answers: [],
        guest_answers: [],
        current_question: 0,
      })
      .select()
      .single()

    return { data, error }
  },

  // Join a battle by code
  joinBattle: async (code, userId) => {
    const { data: battle } = await supabase
      .from('quiz_battles')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (!battle) return { error: { message: 'Battle introuvable ou deja commencee' } }
    if (battle.host_id === userId) return { error: { message: 'Vous ne pouvez pas rejoindre votre propre battle' } }

    const { data, error } = await supabase
      .from('quiz_battles')
      .update({ guest_id: userId, status: 'playing', started_at: new Date().toISOString() })
      .eq('id', battle.id)
      .select()
      .single()

    return { data, error }
  },

  // Find random opponent (matchmaking) — matches on subject, any level
  findBattle: async (userId, subject, level) => {
    // Clean up stale waiting battles (older than 5 min)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    await supabase.from('quiz_battles').delete().eq('status', 'waiting').lt('created_at', fiveMinAgo)

    // Also delete any old waiting battle from this user
    await supabase.from('quiz_battles').delete().eq('status', 'waiting').eq('host_id', userId)

    const { data: existing } = await supabase
      .from('quiz_battles')
      .select('*')
      .eq('subject', subject)
      .eq('status', 'waiting')
      .neq('host_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (existing) {
      // Join this battle
      const { data, error } = await supabase
        .from('quiz_battles')
        .update({ guest_id: userId, status: 'playing', started_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      return { data, error, matched: true }
    }

    // No battle found — create one and wait
    const result = await quizBattleService.createBattle(userId, subject, level)
    return { ...result, matched: false }
  },

  // Submit answer
  submitAnswer: async (battleId, userId, questionIndex, answer, timeMs) => {
    const { data: battle } = await supabase
      .from('quiz_battles')
      .select('*')
      .eq('id', battleId)
      .single()

    if (!battle) return { error: { message: 'Battle introuvable' } }

    const isHost = battle.host_id === userId
    const field = isHost ? 'host_answers' : 'guest_answers'
    const scoreField = isHost ? 'host_score' : 'guest_score'

    const question = battle.questions[questionIndex]
    const isCorrect = question && answer === question.correct

    const currentAnswers = battle[field] || []
    currentAnswers[questionIndex] = { answer, correct: isCorrect, timeMs }

    const newScore = currentAnswers.filter(a => a?.correct).length

    const { data, error } = await supabase
      .from('quiz_battles')
      .update({ [field]: currentAnswers, [scoreField]: newScore })
      .eq('id', battleId)
      .select()
      .single()

    return { data, error, isCorrect }
  },

  // Finish battle
  finishBattle: async (battleId) => {
    const { data, error } = await supabase
      .from('quiz_battles')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', battleId)
      .select()
      .single()

    // Update leaderboard
    if (data) {
      await updateLeaderboard(data.host_id, data.subject, data.host_score, data.questions.length)
      if (data.guest_id) {
        await updateLeaderboard(data.guest_id, data.subject, data.guest_score, data.questions.length)
      }
    }

    return { data, error }
  },

  // Get battle by ID
  getBattle: async (battleId) => {
    const { data, error } = await supabase
      .from('quiz_battles')
      .select('*')
      .eq('id', battleId)
      .single()
    return { data, error }
  },

  // Get user's battle history
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('quiz_battles')
      .select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .eq('status', 'finished')
      .order('finished_at', { ascending: false })
      .limit(20)
    return { data, error }
  },

  // Get leaderboard
  getLeaderboard: async (subject = null) => {
    let query = supabase
      .from('quiz_leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(50)

    if (subject) query = query.eq('subject', subject)

    const { data, error } = await query

    if (!error && data) {
      const userIds = data.map(d => d.user_id)
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        const profileMap = {}
        profiles?.forEach(p => { profileMap[p.id] = p })
        data.forEach(d => { d.profiles = profileMap[d.user_id] || null })
      }
    }

    return { data, error }
  },

  // Get user stats
  getUserStats: async (userId) => {
    const { data: battles } = await supabase
      .from('quiz_battles')
      .select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .eq('status', 'finished')

    if (!battles) return { wins: 0, losses: 0, draws: 0, totalBattles: 0, avgScore: 0 }

    let wins = 0, losses = 0, draws = 0, totalScore = 0

    battles.forEach(b => {
      const isHost = b.host_id === userId
      const myScore = isHost ? b.host_score : b.guest_score
      const opScore = isHost ? b.guest_score : b.host_score
      totalScore += myScore

      if (myScore > opScore) wins++
      else if (myScore < opScore) losses++
      else draws++
    })

    return {
      wins, losses, draws,
      totalBattles: battles.length,
      avgScore: battles.length > 0 ? Math.round(totalScore / battles.length * 10) / 10 : 0,
    }
  },

  // Subscribe to battle updates
  subscribeToBattle: (battleId, callback) => {
    return supabase
      .channel(`battle-${battleId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quiz_battles',
        filter: `id=eq.${battleId}`,
      }, (payload) => callback(payload.new))
      .subscribe()
  },

  unsubscribeFromBattle: (battleId) => {
    supabase.removeChannel(supabase.channel(`battle-${battleId}`))
  },
}

async function updateLeaderboard(userId, subject, score, totalQuestions) {
  const { data: existing } = await supabase
    .from('quiz_leaderboard')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .single()

  if (existing) {
    await supabase.from('quiz_leaderboard').update({
      total_score: existing.total_score + score,
      battles_played: existing.battles_played + 1,
      best_score: Math.max(existing.best_score, score),
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id)
  } else {
    await supabase.from('quiz_leaderboard').insert({
      user_id: userId,
      subject,
      total_score: score,
      battles_played: 1,
      best_score: score,
    })
  }
}
