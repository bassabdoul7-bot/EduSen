import { supabase } from './supabase'

export const admissionsService = {
  // Get all universities
  getUniversities: async (filters = {}) => {
    let query = supabase
      .from('universities')
      .select('*')
      .order('ranking', { ascending: true, nullsLast: true })

    // Apply filters
    if (filters.country) {
      query = query.eq('country', filters.country)
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
    }
    if (filters.featured) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get featured universities
  getFeaturedUniversities: async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('is_featured', true)
      .order('ranking', { ascending: true })
      .limit(6)
    
    return { data, error }
  },

  // Get university by ID
  getUniversityById: async (id) => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Save university (Premium feature)
  saveUniversity: async (userId, universityId) => {
    const { data, error } = await supabase
      .from('user_university_applications')
      .insert({
        user_id: userId,
        university_id: universityId,
        status: 'interested'
      })
      .select()
      .single()
    
    return { data, error }
  },

  // Unsave university
  unsaveUniversity: async (userId, universityId) => {
    const { error } = await supabase
      .from('user_university_applications')
      .delete()
      .eq('user_id', userId)
      .eq('university_id', universityId)
    
    return { error }
  },

  // Get saved universities
  getSavedUniversities: async (userId) => {
    const { data, error } = await supabase
      .from('user_university_applications')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', userId)
    
    return { data, error }
  },

  // Check if university is saved
  isUniversitySaved: async (userId, universityId) => {
    const { data, error } = await supabase
      .from('user_university_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('university_id', universityId)
      .single()
    
    return { saved: !!data, error }
  },

  // Track application (Premium feature)
  trackApplication: async (userId, universityId, status, deadline, notes) => {
    const { data, error } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        university_id: universityId,
        status: status,
        deadline: deadline,
        notes: notes
      })
      .select()
      .single()
    
    return { data, error }
  },

  // Update application status
  updateApplicationStatus: async (userId, universityId, status, notes) => {
    const { data, error } = await supabase
      .from('user_university_applications')
      .update({ 
        status: status,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('university_id', universityId)
      .select()
      .single()
    
    return { data, error }
  },

  // Get user applications
  getUserApplications: async (userId) => {
    const { data, error } = await supabase
      .from('user_university_applications')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get countries list
  getCountries: async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('country')
      .order('country')
    
    if (data) {
      const uniqueCountries = [...new Set(data.map(u => u.country).filter(Boolean))]
      return { data: uniqueCountries, error: null }
    }
    
    return { data: [], error }
  }
}