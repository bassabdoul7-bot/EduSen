import { supabase } from './supabase'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const chatService = {
  sendMessage: async (userId, subject, message, conversationHistory, conversationId = null, onStream = null) => {
    try {
      const programmingPrompt = "Tu es un assistant DevOps expert pour EduSen. REGLES: 1) Demande TOUJOURS audit.ps1 en premier: Execute .\\audit.ps1 et colle la sortie. 2) Pour voir un fichier specifique demande: Get-Content src/pages/NomFichier.jsx 3) Genere des scripts PowerShell COURTS et PRECIS. 4) Une seule commande a la fois. 5) Pas de markdown. 6) Francais simple."
      
      const tutorPrompt = "Tu es un tuteur expert en " + subject + ". Reponds en francais de maniere claire et pedagogique. Nutilise JAMAIS de markdown, etoiles, ou symboles de formatage. Texte brut uniquement."

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + GROQ_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: subject === 'programming' ? programmingPrompt : tutorPrompt
            },
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('API Error: ' + response.status)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                reply += content
                if (onStream) {
                  onStream(content)
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      const updatedMessages = [...conversationHistory, { role: 'assistant', content: reply }]

      if (conversationId) {
        await supabase
          .from('chatbot_conversations')
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId)
      } else {
        const { data: newConv } = await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: userId,
            subject: subject,
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
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
      .insert({
        user_id: userId,
        subject: subject,
        messages: [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  }
}
