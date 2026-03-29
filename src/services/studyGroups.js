import { supabase } from './supabase'

const SUBJECTS = [
  { id: 'math', name: 'Mathematiques', icon: '📐', color: 'bg-blue-500' },
  { id: 'physics', name: 'Physique', icon: '⚛️', color: 'bg-purple-500' },
  { id: 'chemistry', name: 'Chimie', icon: '🧪', color: 'bg-green-500' },
  { id: 'biology', name: 'Biologie', icon: '🧬', color: 'bg-emerald-500' },
  { id: 'medicine', name: 'Medecine', icon: '🏥', color: 'bg-red-500' },
  { id: 'computer_science', name: 'Informatique', icon: '💻', color: 'bg-indigo-500' },
  { id: 'literature', name: 'Litterature', icon: '📚', color: 'bg-yellow-600' },
  { id: 'philosophy', name: 'Philosophie', icon: '🤔', color: 'bg-pink-500' },
  { id: 'history', name: 'Histoire-Geo', icon: '🌍', color: 'bg-amber-600' },
  { id: 'english', name: 'Anglais', icon: '🇬🇧', color: 'bg-sky-500' },
  { id: 'economics', name: 'Economie', icon: '📊', color: 'bg-teal-500' },
  { id: 'law', name: 'Droit', icon: '⚖️', color: 'bg-gray-600' },
  { id: 'other', name: 'Autre', icon: '📝', color: 'bg-slate-500' },
]

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const studyGroupsService = {
  SUBJECTS,

  getSubjectById: (id) => SUBJECTS.find(s => s.id === id),

  // ============ GROUPS ============

  getGroups: async (options = {}) => {
    let query = supabase
      .from('study_groups')
      .select('*, study_group_members(count)')
      .eq('is_private', false)

    if (options.subject) {
      query = query.eq('subject', options.subject)
    }
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    query = query.order('created_at', { ascending: false })
    if (options.limit) query = query.limit(options.limit)

    const { data, error } = await query
    return { data, error }
  },

  getMyGroups: async (userId) => {
    const { data: memberships, error: memError } = await supabase
      .from('study_group_members')
      .select('group_id, role')
      .eq('user_id', userId)

    if (memError || !memberships?.length) return { data: [], error: memError }

    const groupIds = memberships.map(m => m.group_id)
    const { data: groups, error } = await supabase
      .from('study_groups')
      .select('*, study_group_members(count)')
      .in('id', groupIds)
      .order('created_at', { ascending: false })

    if (groups) {
      groups.forEach(g => {
        const mem = memberships.find(m => m.group_id === g.id)
        g.myRole = mem?.role
      })
    }

    return { data: groups, error }
  },

  getGroupById: async (groupId) => {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', groupId)
      .single()
    return { data, error }
  },

  createGroup: async (userId, groupData) => {
    const inviteCode = generateInviteCode()
    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        name: groupData.name,
        subject: groupData.subject,
        description: groupData.description,
        creator_id: userId,
        max_members: groupData.maxMembers || 50,
        is_private: groupData.isPrivate || false,
        invite_code: inviteCode,
      })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('study_group_members').insert({
        group_id: data.id,
        user_id: userId,
        role: 'admin',
      })
    }

    return { data, error }
  },

  deleteGroup: async (groupId, userId) => {
    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId)
      .eq('creator_id', userId)
    return { error }
  },

  // ============ MEMBERS ============

  getMembers: async (groupId) => {
    const { data, error } = await supabase
      .from('study_group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('role', { ascending: true })

    if (!error && data) {
      const userIds = data.map(m => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_online')
        .in('id', userIds)
      const profileMap = {}
      profiles?.forEach(p => { profileMap[p.id] = p })
      data.forEach(m => { m.profiles = profileMap[m.user_id] || null })
    }

    return { data, error }
  },

  isMember: async (groupId, userId) => {
    const { data } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single()
    return { isMember: !!data, role: data?.role }
  },

  joinGroup: async (groupId, userId) => {
    const { data: group } = await supabase
      .from('study_groups')
      .select('max_members')
      .eq('id', groupId)
      .single()

    const { count } = await supabase
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)

    if (group && count >= group.max_members) {
      return { error: { message: 'Groupe complet' } }
    }

    const { data, error } = await supabase
      .from('study_group_members')
      .insert({ group_id: groupId, user_id: userId, role: 'member' })
      .select()
      .single()
    return { data, error }
  },

  joinByInviteCode: async (code, userId) => {
    const { data: group } = await supabase
      .from('study_groups')
      .select('id')
      .eq('invite_code', code.toUpperCase())
      .single()

    if (!group) return { error: { message: 'Code invalide' } }
    return studyGroupsService.joinGroup(group.id, userId)
  },

  leaveGroup: async (groupId, userId) => {
    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    return { error }
  },

  removeMember: async (groupId, adminId, targetUserId) => {
    const { data: admin } = await supabase
      .from('study_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', adminId)
      .single()
    if (admin?.role !== 'admin') return { error: { message: 'Non autorise' } }

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId)
    return { error }
  },

  // ============ MESSAGES (Chat) ============

  getMessages: async (groupId, limit = 50) => {
    const { data, error } = await supabase
      .from('study_group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!error && data) {
      const userIds = [...new Set(data.map(m => m.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)
      const profileMap = {}
      profiles?.forEach(p => { profileMap[p.id] = p })
      data.forEach(m => { m.profiles = profileMap[m.user_id] || null })
    }
    return { data: data?.reverse(), error }
  },

  sendMessage: async (groupId, userId, content, type = 'text') => {
    const { data, error } = await supabase
      .from('study_group_messages')
      .insert({ group_id: groupId, user_id: userId, content, type, is_pinned: false })
      .select()
      .single()

    if (!error && data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single()
      data.profiles = profile
    }
    return { data, error }
  },

  // ============ Q&A BOARD ============

  getQuestions: async (groupId) => {
    const { data, error } = await supabase
      .from('study_group_questions')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const userIds = [...new Set(data.map(q => q.user_id))]
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        const profileMap = {}
        profiles?.forEach(p => { profileMap[p.id] = p })
        data.forEach(q => { q.profiles = profileMap[q.user_id] || null })
      }
    }
    return { data, error }
  },

  createQuestion: async (groupId, userId, title, content) => {
    const { data, error } = await supabase
      .from('study_group_questions')
      .insert({ group_id: groupId, user_id: userId, title, content, upvotes: 0, is_solved: false })
      .select()
      .single()
    return { data, error }
  },

  getAnswers: async (questionId) => {
    const { data, error } = await supabase
      .from('study_group_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('upvotes', { ascending: false })

    if (!error && data) {
      const userIds = [...new Set(data.map(a => a.user_id))]
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        const profileMap = {}
        profiles?.forEach(p => { profileMap[p.id] = p })
        data.forEach(a => { a.profiles = profileMap[a.user_id] || null })
      }
    }
    return { data, error }
  },

  createAnswer: async (questionId, userId, content) => {
    const { data, error } = await supabase
      .from('study_group_answers')
      .insert({ question_id: questionId, user_id: userId, content, upvotes: 0, is_best: false })
      .select()
      .single()
    return { data, error }
  },

  voteQuestion: async (questionId, increment) => {
    const { data: q } = await supabase
      .from('study_group_questions')
      .select('upvotes')
      .eq('id', questionId)
      .single()
    const { data, error } = await supabase
      .from('study_group_questions')
      .update({ upvotes: (q?.upvotes || 0) + increment })
      .eq('id', questionId)
      .select()
      .single()
    return { data, error }
  },

  voteAnswer: async (answerId, increment) => {
    const { data: a } = await supabase
      .from('study_group_answers')
      .select('upvotes')
      .eq('id', answerId)
      .single()
    const { data, error } = await supabase
      .from('study_group_answers')
      .update({ upvotes: (a?.upvotes || 0) + increment })
      .eq('id', answerId)
      .select()
      .single()
    return { data, error }
  },

  markSolved: async (questionId, answerId) => {
    await supabase.from('study_group_questions').update({ is_solved: true }).eq('id', questionId)
    if (answerId) {
      await supabase.from('study_group_answers').update({ is_best: true }).eq('id', answerId)
    }
  },

  // ============ RESOURCES ============

  getResources: async (groupId) => {
    const { data, error } = await supabase
      .from('study_group_resources')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      const userIds = [...new Set(data.map(r => r.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      const profileMap = {}
      profiles?.forEach(p => { profileMap[p.id] = p })
      data.forEach(r => { r.profiles = profileMap[r.user_id] || null })
    }
    return { data, error }
  },

  addResource: async (groupId, userId, resource) => {
    const { data, error } = await supabase
      .from('study_group_resources')
      .insert({
        group_id: groupId,
        user_id: userId,
        title: resource.title,
        url: resource.url,
        file_type: resource.fileType || 'link',
      })
      .select()
      .single()
    return { data, error }
  },

  deleteResource: async (resourceId, userId) => {
    const { error } = await supabase
      .from('study_group_resources')
      .delete()
      .eq('id', resourceId)
      .eq('user_id', userId)
    return { error }
  },

  // ============ STUDY SESSIONS ============

  getSessions: async (groupId) => {
    const { data, error } = await supabase
      .from('study_group_sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('scheduled_at', { ascending: true })
    return { data, error }
  },

  createSession: async (groupId, userId, session) => {
    const { data, error } = await supabase
      .from('study_group_sessions')
      .insert({
        group_id: groupId,
        creator_id: userId,
        title: session.title,
        description: session.description || '',
        scheduled_at: session.scheduledAt,
        duration_minutes: session.duration || 60,
        status: 'scheduled',
      })
      .select()
      .single()
    return { data, error }
  },

  deleteSession: async (sessionId, userId) => {
    const { error } = await supabase
      .from('study_group_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('creator_id', userId)
    return { error }
  },

  // ============ ACTIVITY FEED ============

  getActivity: async (groupId, limit = 20) => {
    const { data, error } = await supabase
      .from('study_group_activity')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!error && data && data.length > 0) {
      const userIds = [...new Set(data.map(a => a.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)
      const profileMap = {}
      profiles?.forEach(p => { profileMap[p.id] = p })
      data.forEach(a => { a.profiles = profileMap[a.user_id] || null })
    }
    return { data, error }
  },

  logActivity: async (groupId, userId, type, content) => {
    await supabase.from('study_group_activity').insert({
      group_id: groupId,
      user_id: userId,
      type,
      content,
    })
  },

  // ============ LEADERBOARD ============

  getLeaderboard: async (groupId) => {
    const { data: members } = await supabase
      .from('study_group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (!members?.length) return { data: [] }

    const userIds = members.map(m => m.user_id)
    const leaderboard = []

    for (const uid of userIds) {
      const [msgs, questions, answers] = await Promise.all([
        supabase.from('study_group_messages').select('id', { count: 'exact', head: true }).eq('group_id', groupId).eq('user_id', uid),
        supabase.from('study_group_questions').select('id', { count: 'exact', head: true }).eq('group_id', groupId).eq('user_id', uid),
        supabase.from('study_group_answers').select('id, question_id', { count: 'exact', head: true }).eq('user_id', uid),
      ])

      const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', uid).single()

      leaderboard.push({
        user_id: uid,
        profiles: profile,
        messages: msgs.count || 0,
        questions: questions.count || 0,
        answers: answers.count || 0,
        score: (msgs.count || 0) + ((questions.count || 0) * 3) + ((answers.count || 0) * 5),
      })
    }

    leaderboard.sort((a, b) => b.score - a.score)
    return { data: leaderboard }
  },

  // ============ REALTIME ============

  subscribeToMessages: (groupId, callback) => {
    return supabase
      .channel(`group-messages-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'study_group_messages',
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        const msg = payload.new
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', msg.user_id)
          .single()
        msg.profiles = profile
        callback(msg)
      })
      .subscribe()
  },

  unsubscribeFromMessages: (groupId) => {
    supabase.removeChannel(supabase.channel(`group-messages-${groupId}`))
  },
}
