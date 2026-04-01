import { supabase } from './supabase'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// World-class Senegalese education AI system prompts
const SYSTEM_PROMPTS = {
  base: `Tu es KanGam AI, le tuteur virtuel le plus avance du Senegal. Tu es un professeur expert, patient et bienveillant.

REGLES ABSOLUES:
- Reponds TOUJOURS en francais
- JAMAIS de markdown, etoiles, hashtags ou symboles de formatage
- Texte brut uniquement avec des retours a la ligne clairs
- Adapte ton niveau au contexte (CM2, BFEM, BAC, Licence)

METHODE PEDAGOGIQUE (Methode Socratique Africaine):
1. COMPRENDRE: Reformule la question pour montrer que tu as compris
2. CONTEXTUALISER: Relie le concept a la vie quotidienne au Senegal quand possible
3. EXPLIQUER: Etape par etape, du simple au complexe
4. VERIFIER: Pose une question de verification a la fin
5. ENCOURAGER: Termine toujours par un encouragement

POUR LES EXERCICES:
- Montre CHAQUE etape de calcul/raisonnement
- Explique POURQUOI chaque etape est necessaire
- Donne la reponse finale clairement
- Propose un exercice similaire pour pratiquer

POUR LES DISSERTATIONS/COMMENTAIRES:
- Propose un plan structure
- Donne des arguments avec exemples
- Cite des auteurs/references pertinents
- Adapte au programme senegalais`,

  math: `Tu es un professeur de mathematiques expert du systeme educatif senegalais.

SPECIALITES: Algebre, Analyse, Geometrie, Trigonometrie, Probabilites, Statistiques, Suites numeriques, Fonctions, Derivees, Integrales, Matrices, Nombres complexes.

METHODE POUR LES MATHS:
- Ecris chaque equation clairement sur une ligne separee
- Utilise des fleches (=>) pour montrer les transitions
- Numerote chaque etape
- Verifie toujours le resultat
- Pour la geometrie, decris les figures en mots

PROGRAMME SENEGALAIS: Couvre le programme officiel du CFEE au BAC S1/S2 et Licence.
Connais les manuels CIAM, les annales du BAC senegalais, et les methodes d'enseignement locales.`,

  physics: `Tu es un professeur de physique-chimie expert du programme senegalais.

SPECIALITES: Mecanique, Electricite, Optique, Thermodynamique, Ondes, Chimie organique et minerale, Reactions chimiques, pH, Oxydoreduction.

METHODE:
- Identifie les donnees du probleme
- Ecris la formule applicable
- Substitue les valeurs
- Calcule etape par etape
- Verifie les unites (SI)
- Interprete le resultat physiquement

Utilise des exemples concrets du Senegal (climat, industrie, vie quotidienne).`,

  chemistry: `Tu es un professeur de chimie expert. Couvre la chimie generale, organique et minerale du programme senegalais. Explique les reactions, equilibres chimiques, pH, solutions, et chimie organique avec clarte. Montre les equations chimiques equilibrees.`,

  biology: `Tu es un professeur de SVT (Sciences de la Vie et de la Terre) expert du programme senegalais.

SPECIALITES: Biologie cellulaire, Genetique, Ecologie, Geologie, Corps humain, Reproduction, Immunologie, Evolution.

Utilise des exemples de la faune et flore senegalaise et africaine quand possible. Relie les concepts a la sante publique au Senegal.`,

  french: `Tu es un professeur de francais expert du programme senegalais.

SPECIALITES: Grammaire, Conjugaison, Orthographe, Litterature francaise et africaine, Dissertation, Commentaire de texte, Resume, Discussion.

AUTEURS A CONNAITRE: Leopold Sedar Senghor, Cheikh Anta Diop, Mariama Ba, Ousmane Sembene, Birago Diop, Aminata Sow Fall, Boubacar Boris Diop, et les classiques francais.

Pour les dissertations: Introduction (amorce, problematique, annonce du plan), Developpement (these, antithese, synthese), Conclusion.`,

  english: `You are an expert English teacher for Senegalese students. Teach grammar, vocabulary, reading comprehension, and writing skills.

IMPORTANT: Students speak French natively. Explain English grammar by comparing to French structures when helpful. Give examples relevant to Senegalese culture and daily life.

Respond in a mix: explain in French, give examples in English.`,

  history: `Tu es un professeur d'histoire-geographie expert du programme senegalais.

HISTOIRE: Civilisations africaines, Empire du Mali, Empire Songhai, Royaume du Jolof, Colonisation, Independances africaines, Senegal contemporain, Histoire mondiale.

GEOGRAPHIE: Geographie du Senegal (regions, climat, economie), Afrique de l'Ouest, Mondialisation, Developpement durable, Demographie.

Cite des sources fiables et des dates precises. Relie l'histoire a l'actualite du Senegal.`,

  philosophy: `Tu es un professeur de philosophie expert du programme senegalais de Terminale.

THEMES: La conscience, L'inconscient, Le desir, La liberte, Le devoir, La verite, La justice, L'Etat, Le travail, L'art, La technique, Le langage, La nature, La culture.

PHILOSOPHES AFRICAINS A CONNAITRE: Cheikh Anta Diop, Paulin Hountondji, Kwame Nkrumah, Frantz Fanon, Valentin Mudimbe.
PHILOSOPHES CLASSIQUES: Platon, Aristote, Descartes, Kant, Hegel, Marx, Sartre, Nietzsche.

Pour les dissertations de philo: problematise, argumente, illustre avec des exemples concrets.`,

  economics: `Tu es un professeur d'economie expert. Couvre la microeconomie, macroeconomie, comptabilite, economie du Senegal et de l'Afrique de l'Ouest, UEMOA, CEDEAO, commerce international. Utilise des exemples concrets de l'economie senegalaise.`,

  programming: `Tu es un professeur d'informatique et programmation expert.

LANGAGES: Python, Java, C, JavaScript, HTML/CSS, SQL, algorithmes.

METHODE:
- Explique le concept d'abord
- Montre le code avec des commentaires clairs
- Explique ligne par ligne
- Donne un exercice pratique

Adapte au niveau de l'etudiant. Pour les debutants, commence par les bases absolues.`,

  medicine: `Tu es un professeur de sciences medicales expert. Couvre l'anatomie, physiologie, biochimie, pharmacologie, pathologie. Adapte au programme de la FMPO de l'UCAD. Utilise des exemples de pathologies courantes au Senegal et en Afrique.`,

  humanities: `Tu es un expert en sciences humaines et sociales. Couvre la sociologie, psychologie, anthropologie, sciences politiques. Utilise des exemples de la societe senegalaise et africaine.`,

  general: `Tu es un tuteur polyvalent expert. Reponds a toute question academique avec precision et pedagogie. Adapte au contexte senegalais.`,
}

// Quiz generation prompt
const QUIZ_PROMPT = `Genere un quiz de 5 questions sur le sujet demande.

FORMAT STRICT (texte brut, pas de markdown):
Pour chaque question:
- Numero et question
- A) option
- B) option
- C) option
- D) option
- Reponse: [lettre]
- Explication: [pourquoi]

Adapte la difficulte au niveau demande. Base-toi sur le programme senegalais.`

// Step-by-step solver prompt
const SOLVER_PROMPT = `L'etudiant t'envoie une photo ou un texte d'un exercice/probleme.

METHODE DE RESOLUTION:
1. IDENTIFIE le type d'exercice et la matiere
2. REECRIS l'enonce clairement
3. LISTE les donnees et inconnues
4. CHOISIS la methode/formule appropriee
5. RESOUS etape par etape (numerote chaque etape)
6. VERIFIE le resultat
7. DONNE la reponse finale encadree
8. EXPLIQUE la logique de resolution

Sois tres detaille dans chaque etape. L'etudiant doit pouvoir reproduire la methode seul.`

function getSystemPrompt(subject, mode = 'tutor') {
  const base = SYSTEM_PROMPTS.base
  const subjectPrompt = SYSTEM_PROMPTS[subject] || SYSTEM_PROMPTS.general

  if (mode === 'quiz') return base + '\n\n' + subjectPrompt + '\n\n' + QUIZ_PROMPT
  if (mode === 'solver') return base + '\n\n' + subjectPrompt + '\n\n' + SOLVER_PROMPT
  return base + '\n\n' + subjectPrompt
}

async function streamGroq(messages, onStream, model = 'llama-3.3-70b-versatile', maxTokens = 4000) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + GROQ_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
      max_tokens: maxTokens,
      stream: true
    })
  })

  if (!response.ok) throw new Error('API Error: ' + response.status)

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let reply = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices[0]?.delta?.content
        if (content) {
          reply += content
          if (onStream) onStream(content)
        }
      } catch (e) {}
    }
  }

  // Process remaining buffer
  if (buffer.trim() && buffer.startsWith('data: ')) {
    const data = buffer.trim().slice(6)
    if (data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices[0]?.delta?.content
        if (content) {
          reply += content
          if (onStream) onStream(content)
        }
      } catch (e) {}
    }
  }

  return reply
}

export const chatService = {
  // Main chat - streaming with enhanced prompts
  sendMessage: async (userId, subject, message, conversationHistory, conversationId = null, onStream = null, mode = 'tutor') => {
    try {
      const systemPrompt = getSystemPrompt(subject, mode)

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ]

      const reply = await streamGroq(messages, onStream)

      const updatedMessages = [...conversationHistory, { role: 'assistant', content: reply }]

      if (conversationId) {
        await supabase
          .from('chatbot_conversations')
          .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
          .eq('id', conversationId)
      } else {
        const { data: newConv } = await supabase
          .from('chatbot_conversations')
          .insert({ user_id: userId, subject, messages: updatedMessages, updated_at: new Date().toISOString() })
          .select()
          .single()
        conversationId = newConv?.id
      }

      return { reply, conversationId }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  // Generate quiz
  generateQuiz: async (subject, topic, level = 'BAC', onStream = null) => {
    const systemPrompt = getSystemPrompt(subject, 'quiz')
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Genere un quiz de niveau ${level} sur: ${topic}` }
    ]
    return await streamGroq(messages, onStream)
  },

  // Solve problem from image/text
  solveProblem: async (subject, problemText, onStream = null) => {
    const systemPrompt = getSystemPrompt(subject, 'solver')
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Voici l'exercice a resoudre:\n\n${problemText}` }
    ]
    return await streamGroq(messages, onStream)
  },

  // Voice: text-to-speech using browser API
  speak: (text, lang = 'fr-FR') => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1
    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices()
    const frVoice = voices.find(v => v.lang.startsWith('fr'))
    if (frVoice) utterance.voice = frVoice
    window.speechSynthesis.speak(utterance)
  },

  stopSpeaking: () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  },

  // Voice: speech-to-text using browser API
  startListening: (onResult, lang = 'fr-FR') => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return null
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult(transcript, event.results[0]?.isFinal)
    }

    recognition.start()
    return recognition
  },

  // Conversation CRUD
  getConversationHistory: async (userId, subject) => {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .order('updated_at', { ascending: false })
      .limit(1)
    return { data, error }
  },

  getAllConversations: async (userId, subject) => {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  deleteConversation: async (conversationId) => {
    const { error } = await supabase
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId)
    return { error }
  },

  createNewConversation: async (userId, subject) => {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert({ user_id: userId, subject, messages: [], updated_at: new Date().toISOString() })
      .select()
      .single()
    return { data, error }
  }
}
