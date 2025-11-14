import { supabase } from './supabase'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const chatService = {
  sendMessage: async (userId, subject, message, conversationHistory) => {
    try {
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
              content: 'Tu es un tuteur expert en ' + subject + '. Réponds en français de manière claire et pédagogique.'
            },
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })
      if (!response.ok) {
        throw new Error('API Error: ' + response.status)
      }
      const data = await response.json()
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Format de réponse invalide')
      }
      const reply = data.choices[0].message.content
      await supabase.from('chatbot_conversations').upsert({
        user_id: userId,
        subject: subject,
        messages: [...conversationHistory, { role: 'assistant', content: reply }],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,subject'
      })
      return { reply }
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
    return { data, error }
  }
}
