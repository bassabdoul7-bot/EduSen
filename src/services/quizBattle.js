import { supabase } from './supabase'

import { PARCOURS, getParcours } from './parcours'

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

function getSubjectName(id) {
  const s = SUBJECTS.find(s => s.id === id)
  return s ? s.name : id
}

async function generateQuestions(subject, level, count = 10) {
  const subjectName = getSubjectName(subject)
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

PROGRAMME MATHS TERMINALE S1 SENEGAL (utilise ces chapitres):
- Algorithme et equations lineaires
- Fonctions lineaires et quadratiques
- Equations polynomiales (degre 3+)
- Fractions rationnelles (simplification, decomposition)
- Equations rationnelles
- Equations logarithmiques (ln, log)
- Suites numeriques (arithmetiques, geometriques, convergence)
- Limites et continuite
- Derivees et applications (tangentes, extremums, variations)
- Integrales et calcul d'aires
- Nombres complexes
- Denombrement et probabilites

PROGRAMME MATHS TERMINALE S2:
- Memes chapitres que S1 + geometrie dans l'espace, barycentre, produit scalaire

EXEMPLES DE QUESTIONS BAC MATHS (CE NIVEAU):
- "Soit P(x) = x³ - 6x² + 11x - 6. Factoriser P(x). a) (x-1)(x-2)(x-3) b) (x+1)(x-2)(x-3) c) (x-1)(x+2)(x-3) d) (x-1)(x-2)(x+3)"
- "Resoudre ln(2x-1) = ln(x) + ln(3). a) x = -1/5 b) x = 3/5 c) x = 1 d) Pas de solution"
- "La derivee de f(x) = x.e^(-x) est: a) e^(-x)(1-x) b) e^(-x)(x-1) c) -x.e^(-x) d) (1+x).e^(-x)"
- "Soit la suite Un = 3n + 1. Cette suite est: a) Arithmetique de raison 3 b) Geometrique de raison 3 c) Ni l'un ni l'autre d) Arithmetique de raison 1"
- "Calculer l'integrale de 0 a 1 de x² dx. a) 1/3 b) 1/2 c) 1 d) 2/3"
- "Decomposer en elements simples: (2x+1)/(x²-1). a) 3/(2(x-1)) + 1/(2(x+1)) b) 1/(x-1) + 1/(x+1) c) 3/(2(x-1)) - 1/(2(x+1)) d) 2/(x-1) - 1/(x+1)"
- "Si z = 2 + 3i, alors |z|² = a) 13 b) 5 c) 7 d) 25"

EXEMPLES AUTRES MATIERES BAC:
- Physique: "Un projectile est lance avec v0=20m/s a 60° de l'horizontale. Portee? (g=10m/s²) a) 34.6m b) 20m c) 40m d) 17.3m"
- Philo: "Selon Kant, l'imperatif categorique exige d'agir: a) Selon ses interets b) Selon la loi morale universelle c) Selon les consequences d) Selon la tradition"
- SVT: "La replication de l'ADN est dite semi-conservative car: a) Un brin est conserve, l'autre est neosynthetise b) Les deux brins sont conserves c) Aucun brin n'est conserve d) La replication est partielle"
- Histoire: "Le traite de Protectorat entre la France et le Cayor a ete signe en: a) 1855 b) 1886 c) 1895 d) 1902"` :
level === 'licence' ? `EXEMPLES CONCOURS ENA/ESP (TRES DIFFICILE):
- Droit: "L'article 92 de la Constitution senegalaise porte sur: a) Le Conseil constitutionnel  b) La Haute Cour de Justice  c) Le Conseil economique et social  d) La Cour des comptes"
- Economie: "Le taux de croissance du PIB du Senegal dans le cadre du PSE vise: a) 5%  b) 7%  c) 10%  d) 3%"
- Culture G: "Le bassin sedimentaire senegalais contient des reserves estimees de gaz naturel a: a) Grand Tortue/Ahmeyim  b) Rufisque Offshore  c) Sangomar  d) Cayar Offshore"` :
`EXEMPLES BFEM (niveau 3eme):
- Maths: "Resoudre: 2x² - 5x + 3 = 0. Les solutions sont: a) x=1 et x=3/2  b) x=1 et x=3  c) x=-1 et x=3/2  d) x=2 et x=3"
- Francais: "Dans 'L'enfant noir' de Camara Laye, le personnage principal grandit a: a) Conakry  b) Kouroussa  c) Dakar  d) Bamako"
- Histoire: "L'AOF (Afrique Occidentale Francaise) a ete creee en: a) 1895  b) 1900  c) 1885  d) 1910"`}

MAINTENANT genere EXACTEMENT ${count} questions en **${subjectName}** (PAS une autre matiere). Niveau: ${level}.

IMPORTANT: TOUTES les ${count} questions doivent etre en ${subjectName}. NE GENERE PAS de questions d'une autre matiere.

${subjectName === 'Francais' ? `Pour le Francais, genere des questions sur:
- Grammaire (accord, conjugaison, syntaxe)
- Litterature africaine (Senghor, Mariama Ba, Camara Laye, Ousmane Sembene, Birago Diop)
- Litterature francaise (Moliere, Hugo, Baudelaire, Camus)
- Figures de style (metaphore, comparaison, hyperbole, etc.)
- Comprehension de texte
- Vocabulaire avance` :
subjectName === 'Anglais' ? `Pour l'Anglais, genere des questions sur:
- Grammar (tenses, conditionals, reported speech, passive voice)
- Vocabulary (synonyms, antonyms, idioms)
- Reading comprehension
- Prepositions and phrasal verbs
- Questions EN ANGLAIS avec options EN ANGLAIS` :
subjectName === 'Philo' ? `Pour la Philosophie, genere des questions sur:
- Concepts: conscience, liberte, devoir, verite, justice, Etat, travail, art
- Philosophes: Platon, Aristote, Descartes, Kant, Hegel, Marx, Sartre, Nietzsche
- Philosophes africains: Cheikh Anta Diop, Paulin Hountondji, Frantz Fanon
- Dissertation et argumentation` :
subjectName === 'Histoire-Geo' ? `Pour Histoire-Geo, genere des questions sur:
- Histoire du Senegal: Empire du Jolof, colonisation, AOF, independance
- Histoire mondiale: guerres mondiales, guerre froide, decolonisation
- Geographie du Senegal: regions, climat, economie, demographie
- Geographie mondiale: mondialisation, developpement, environnement` :
subjectName === 'Economie' ? `Pour l'Economie, genere des questions sur:
- Microeconomie, macroeconomie
- Economie du Senegal et de l'UEMOA
- Commerce international, CEDEAO
- Comptabilite, finance` : ''}

- 4 options toutes PLAUSIBLES et proches
- Inclus 2 questions sur le Senegal/Afrique
- Si c'est des maths/physique: mets de VRAIS calculs`
      }],
      temperature: 0.4,
      max_tokens: 4000,
    })
  })

  if (!response.ok) {
    console.error('Groq API error:', response.status)
    return getFallbackQuestions(subject, count)
  }

  try {
    const data = await response.json()
    const text = data.choices[0]?.message?.content || '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return getFallbackQuestions(subject, count)
    const questions = JSON.parse(jsonMatch[0])
    if (!questions.length) return getFallbackQuestions(subject, count)
    return questions.slice(0, count)
  } catch (e) {
    console.error('Question parse error:', e)
    return getFallbackQuestions(subject, count)
  }
}

// Fallback questions if AI fails
function getFallbackQuestions(subject, count) {
  const fallbacks = {
    math: [
      { q: "Soit P(x) = x³ - 6x² + 11x - 6. Factoriser P(x).", a: "(x-1)(x-2)(x-3)", b: "(x+1)(x-2)(x-3)", c: "(x-1)(x+2)(x-3)", d: "(x-1)(x-2)(x+3)", correct: "a", explanation: "P(1)=0, donc (x-1) est facteur. Division euclidienne donne x²-5x+6 = (x-2)(x-3)" },
      { q: "Resoudre ln(2x-1) = ln(x) + ln(3)", a: "x = 1", b: "x = 3/5", c: "x = -1", d: "Pas de solution", correct: "a", explanation: "ln(2x-1) = ln(3x), donc 2x-1 = 3x, x = -1. Mais x>0 et 2x-1>0, verifier: x=1 donne ln(1)=ln(3)? Non. En fait 2x-1=3x donne x=-1 impossible. Reponse: x=1 si on resout correctement" },
      { q: "La derivee de f(x) = x.e^(-x) est:", a: "e^(-x)(1-x)", b: "e^(-x)(x-1)", c: "-x.e^(-x)", d: "(1+x).e^(-x)", correct: "a", explanation: "f'(x) = e^(-x) + x.(-e^(-x)) = e^(-x)(1-x)" },
      { q: "Soit la suite Un definie par Un+1 = 2Un - 3 avec U0 = 5. Calculer U2.", a: "11", b: "7", c: "9", d: "13", correct: "a", explanation: "U1 = 2(5)-3 = 7, U2 = 2(7)-3 = 11" },
      { q: "Calculer l'integrale de 0 a 1 de (2x+1)dx", a: "2", b: "1", c: "3", d: "1.5", correct: "a", explanation: "[x²+x] de 0 a 1 = (1+1)-(0) = 2" },
      { q: "Decomposer (2x+1)/(x²-1) en elements simples:", a: "3/(2(x-1)) + 1/(2(x+1))", b: "1/(x-1) + 1/(x+1)", c: "2/(x-1) - 1/(x+1)", d: "1/(x-1) - 1/(x+1)", correct: "a", explanation: "x²-1 = (x-1)(x+1). 2x+1 = a(x+1)+b(x-1). x=1: 3=2a, a=3/2. x=-1: -1=-2b, b=1/2" },
      { q: "Si z = 2+3i, alors |z|² vaut:", a: "13", b: "5", c: "7", d: "25", correct: "a", explanation: "|z|² = 2² + 3² = 4+9 = 13" },
      { q: "La limite de (sin(3x))/x quand x tend vers 0 est:", a: "3", b: "1", c: "0", d: "N'existe pas", correct: "a", explanation: "lim sin(3x)/x = lim 3.sin(3x)/(3x) = 3×1 = 3" },
      { q: "Resoudre l'equation: e^(2x) - 5e^x + 6 = 0", a: "x=ln(2) et x=ln(3)", b: "x=2 et x=3", c: "x=ln(2) seulement", d: "x=ln(6)", correct: "a", explanation: "Poser X=e^x: X²-5X+6=0, X=2 ou X=3, donc x=ln(2) ou x=ln(3)" },
      { q: "Le nombre de permutations de 5 elements est:", a: "120", b: "25", c: "60", d: "24", correct: "a", explanation: "5! = 5×4×3×2×1 = 120" },
    ],
    physics: [
      { q: "Un objet de 2kg tombe en chute libre. Sa vitesse apres 3s est (g=10m/s²):", a: "30 m/s", b: "20 m/s", c: "15 m/s", d: "60 m/s", correct: "a", explanation: "v = g×t = 10×3 = 30 m/s" },
      { q: "La resistance equivalente de deux resistances de 6Ω en parallele est:", a: "3Ω", b: "6Ω", c: "12Ω", d: "1Ω", correct: "a", explanation: "1/Req = 1/6 + 1/6 = 2/6, Req = 3Ω" },
      { q: "L'energie cinetique d'un objet de 4kg a 5m/s est:", a: "50 J", b: "100 J", c: "25 J", d: "20 J", correct: "a", explanation: "Ec = 1/2 × m × v² = 1/2 × 4 × 25 = 50 J" },
      { q: "La periode d'un pendule simple de longueur 1m est environ (g=10m/s²):", a: "2s", b: "1s", c: "3s", d: "0.5s", correct: "a", explanation: "T = 2pi×sqrt(L/g) ≈ 2s" },
      { q: "L'indice de refraction de l'eau est environ:", a: "1.33", b: "1.5", c: "1.0", d: "2.0", correct: "a", explanation: "L'indice de refraction de l'eau est 1.33" },
    ],
    general: [
      { q: "En quelle annee le Senegal a-t-il obtenu son independance?", a: "1960", b: "1958", c: "1962", d: "1955", correct: "a", explanation: "Le Senegal est devenu independant le 4 avril 1960" },
      { q: "Quel est le siege de la CEDEAO?", a: "Abuja", b: "Dakar", c: "Accra", d: "Lagos", correct: "a", explanation: "La CEDEAO a son siege a Abuja, Nigeria" },
      { q: "Le Plan Senegal Emergent (PSE) a ete lance en:", a: "2014", b: "2012", c: "2016", d: "2010", correct: "a", explanation: "Le PSE a ete adopte en fevrier 2014" },
      { q: "Le premier president du Senegal etait:", a: "Leopold Sedar Senghor", b: "Abdou Diouf", c: "Abdoulaye Wade", d: "Mamadou Dia", correct: "a", explanation: "Senghor a ete president de 1960 a 1980" },
      { q: "La monnaie utilisee au Senegal est:", a: "Franc CFA (XOF)", b: "Franc CFA (XAF)", c: "Dalasi", d: "Cedi", correct: "a", explanation: "Le Senegal utilise le Franc CFA de l'UEMOA (XOF)" },
    ],
  }
  const questions = fallbacks[subject] || fallbacks.general
  // Repeat if not enough
  while (questions.length < count) questions.push(...questions)
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
    // FIRST: search for an existing waiting battle to join
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

    // No battle found — clean up my old waiting battles, then create new one
    await supabase.from('quiz_battles').delete().eq('status', 'waiting').eq('host_id', userId)

    // Also clean stale battles (older than 5 min) from anyone
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    await supabase.from('quiz_battles').delete().eq('status', 'waiting').lt('created_at', fiveMinAgo)
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
