import { supabase } from './supabase'

export const messagesService = {
  // Get all conversations for a user
  getConversations: async (userId) => {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations (
          id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // Send a message
  sendMessage: async (conversationId, senderId, content) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      })
      .select()
      .single()
    
    // Update conversation timestamp
    if (!error) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    }
    
    return { data, error }
  },

  // Create new conversation
  createConversation: async (userId, otherUserId) => {
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single()
    
    if (convError) return { data: null, error: convError }
    
    // Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: userId },
        { conversation_id: conversation.id, user_id: otherUserId }
      ])
    
    if (partError) return { data: null, error: partError }
    
    return { data: conversation, error: null }
  },

  // Get all users (for starting new conversations)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
    
    return { data, error }
  }
}