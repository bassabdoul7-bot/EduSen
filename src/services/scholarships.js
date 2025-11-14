import { supabase } from './supabase'

export const scholarshipsService = {
  getScholarships: async () => {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .order('deadline', { ascending: true })
    
    return { data, error }
  },

  getSavedScholarships: async (userId) => {
    const { data, error } = await supabase
      .from('saved_scholarships')
      .select('*')
      .eq('user_id', userId)
    
    return { data, error }
  },

  saveScholarship: async (userId, scholarshipId) => {
    const { data, error } = await supabase
      .from('saved_scholarships')
      .insert({ user_id: userId, scholarship_id: scholarshipId })
    
    return { data, error }
  },

  unsaveScholarship: async (userId, scholarshipId) => {
    const { error } = await supabase
      .from('saved_scholarships')
      .delete()
      .eq('user_id', userId)
      .eq('scholarship_id', scholarshipId)
    
    return { error }
  }
}