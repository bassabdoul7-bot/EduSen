import { supabase } from './supabase'
import { groqService } from './groq'

export const chatbotService = {
  // Get all conversations for a user
  getConversations: async (userId) => {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    return { data, error }
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // Create new conversation
  createConversation: async (userId, subject) => {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: userId,
        subject: subject,
        title: 'Nouvelle conversation - ' + subject
      })
      .select()
      .single()
    
    return { data, error }
  },

  // Add message to conversation
  addMessage: async (conversationId, role, content) => {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert({
        conversation_id: conversationId,
        role: role,
        content: content
      })
      .select()
      .single()

    // Update conversation updated_at
    await supabase
      .from('chatbot_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
    
    return { data, error }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    const { error } = await supabase
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId)
    
    return { error }
  },

  // Update conversation title
  updateConversationTitle: async (conversationId, title) => {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ title })
      .eq('id', conversationId)
    
    return { error }
  },

  // Send message and get AI response
  sendMessageAndGetResponse: async (conversationId, subject, messages, userMessage) => {
    // Add user message
    await chatbotService.addMessage(conversationId, 'user', userMessage)

    // Prepare messages for Groq
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    formattedMessages.push({ role: 'user', content: userMessage })

    // Get AI response
    const { content, error } = await groqService.chat(formattedMessages, subject)

    if (error) {
      return { data: null, error }
    }

    // Add AI response
    const { data } = await chatbotService.addMessage(conversationId, 'assistant', content)
    
    return { data, error: null }
  }
}