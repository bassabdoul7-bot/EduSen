const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const groqService = {
  chat: async (messages, subject = 'general') => {
    try {
      const systemPrompt = getSystemPrompt(subject)
      
      const payload = {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + GROQ_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Groq API Error:', errorData)
        throw new Error('Groq API request failed: ' + JSON.stringify(errorData))
      }

      const data = await response.json()
      
      return {
        content: data.choices[0].message.content,
        error: null
      }
    } catch (error) {
      console.error('Groq API Error:', error)
      return {
        content: null,
        error: error.message
      }
    }
  },
}

function getSystemPrompt(subject) {
  const basePrompt = 'Tu es un tuteur pedagogique expert pour les etudiants senegalais. Tu aides les eleves du college, du lycee et de l universite. Reponds TOUJOURS en francais. Sois patient et encourageant. Explique etape par etape.'

  const subjectPrompts = {
    math: ' Tu es specialise en MATHEMATIQUES. Couvre: algebre, geometrie, trigonometrie, analyse, probabilites, statistiques.',
    physics: ' Tu es specialise en PHYSIQUE. Couvre: mecanique, electricite, optique, thermodynamique.',
    chemistry: ' Tu es specialise en CHIMIE. Couvre: chimie generale, organique, minerale, reactions chimiques.',
    svt: ' Tu es specialise en SVT. Couvre: biologie, geologie, ecologie, corps humain.',
    philosophy: ' Tu es specialise en PHILOSOPHIE. Aide avec: dissertations, commentaires de texte, concepts philosophiques.',
    french: ' Tu es specialise en FRANCAIS. Aide avec: grammaire, conjugaison, litterature, dissertations.',
    english: ' Tu es specialise en ANGLAIS. Aide avec: grammaire, vocabulaire, comprehension.',
    history: ' Tu es specialise en HISTOIRE-GEOGRAPHIE. Couvre l histoire du Senegal, de l Afrique et du monde.',
    programming: ' Tu es specialise en PROGRAMMATION. Couvre: Python, Java, C++, JavaScript, HTML/CSS, algorithms, debugging. Explique le code ligne par ligne.',
    accounting: ' Tu es specialise en COMPTABILITE et FINANCE. Couvre: comptabilite generale, bilan, compte de resultat, analyse financiere, fiscalite.',
    agriculture: ' Tu es specialise en AGRICULTURE et AGRONOMIE. Couvre: cultures, elevage, irrigation, protection des plantes, gestion agricole, agronomie senegalaise.',
  }

  return basePrompt + (subjectPrompts[subject] || '')
}