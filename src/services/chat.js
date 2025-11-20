import { supabase } from './supabase'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const chatService = {
  sendMessage: async (userId, subject, message, conversationHistory, conversationId = null) => {
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
      const updatedMessages = [...conversationHistory, { role: 'assistant', content: reply }]

      // Update existing conversation or create new one
      if (conversationId) {
        await supabase
          .from('chatbot_conversations')
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId)
      } else {
        await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: userId,
            subject: subject,
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
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