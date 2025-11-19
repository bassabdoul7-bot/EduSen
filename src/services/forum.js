import { supabase } from './supabase'

export const forumService = {
  // ============ CATEGORIES ============
  
  getCategories: async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name', { ascending: true })
    
    return { data, error }
  },

  getCategoryById: async (categoryId) => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', categoryId)
      .single()
    
    return { data, error }
  },

  // ============ TOPICS ============
  
  getTopicsByCategory: async (categoryId, options = {}) => {
    let query = supabase
      .from('forum_topics')
      .select('*')
      .eq('category_id', categoryId)

    if (options.sortBy === 'popular') {
      query = query.order('views', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    return { data, error }
  },

  getAllTopics: async (options = {}) => {
    let query = supabase
      .from('forum_topics')
      .select('*')

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
    }

    if (options.sortBy === 'popular') {
      query = query.order('views', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.limit(options.limit || 20)

    const { data, error } = await query
    return { data, error }
  },

  getTopicById: async (topicId) => {
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .single()

    if (!error && topic) {
      await supabase
        .from('forum_topics')
        .update({ views: (topic.views || 0) + 1 })
        .eq('id', topicId)
    }

    return { data: topic, error }
  },

  createTopic: async (userId, categoryId, title, content) => {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        user_id: userId,
        category_id: categoryId,
        title: title,
        content: content,
        views: 0,
        is_pinned: false,
        is_locked: false
      })
      .select()
      .single()
    
    return { data, error }
  },

  updateTopic: async (topicId, userId, updates) => {
    const { data, error } = await supabase
      .from('forum_topics')
      .update(updates)
      .eq('id', topicId)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  deleteTopic: async (topicId, userId) => {
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId)
      .eq('user_id', userId)
    
    return { error }
  },

  // ============ POSTS ============
  
  getPostsByTopic: async (topicId) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  createPost: async (userId, topicId, content) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: userId,
        topic_id: topicId,
        content: content,
        upvotes: 0
      })
      .select()
      .single()
    
    return { data, error }
  },

  updatePost: async (postId, userId, content) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ 
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  deletePost: async (postId, userId) => {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
    
    return { error }
  },

  // ============ VOTING ============
  
  votePost: async (userId, postId, voteType) => {
    const { data: existingVote } = await supabase
      .from('forum_post_votes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        const { error } = await supabase
          .from('forum_post_votes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId)
        
        return { data: null, error }
      } else {
        const { data, error } = await supabase
          .from('forum_post_votes')
          .update({ vote_type: voteType })
          .eq('user_id', userId)
          .eq('post_id', postId)
          .select()
          .single()
        
        return { data, error }
      }
    } else {
      const { data, error } = await supabase
        .from('forum_post_votes')
        .insert({
          user_id: userId,
          post_id: postId,
          vote_type: voteType
        })
        .select()
        .single()
      
      return { data, error }
    }
  },

  getUserVotes: async (userId, postIds) => {
    const { data, error } = await supabase
      .from('forum_post_votes')
      .select('*')
      .eq('user_id', userId)
      .in('post_id', postIds)
    
    return { data, error }
  },

  getUserStats: async (userId) => {
    const { data: topics } = await supabase
      .from('forum_topics')
      .select('id')
      .eq('user_id', userId)

    const { data: posts } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('user_id', userId)

    return {
      topicsCount: topics?.length || 0,
      postsCount: posts?.length || 0
    }
  }
}