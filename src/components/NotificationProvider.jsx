import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NotificationContext = createContext({ notifications: [], unreadCount: 0, clearAll: () => {}, markRead: () => {} })

export const useNotifications = () => useContext(NotificationContext)

export default function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [myGroupIds, setMyGroupIds] = useState([])
  const channelsRef = useRef([])

  // Load user's groups
  useEffect(() => {
    if (!user) { setMyGroupIds([]); setNotifications([]); return }
    loadGroups()
    loadNotifications()
    const interval = setInterval(loadGroups, 30000)
    return () => clearInterval(interval)
  }, [user])

  async function loadGroups() {
    const { data } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', user.id)
    setMyGroupIds(data?.map(m => m.group_id) || [])
  }

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
  }

  // Subscribe to realtime for all groups
  useEffect(() => {
    if (!user || myGroupIds.length === 0) return

    channelsRef.current.forEach(ch => supabase.removeChannel(ch))
    channelsRef.current = []

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    myGroupIds.forEach(groupId => {
      // New messages
      const msgChannel = supabase
        .channel(`notif-msg-${groupId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'study_group_messages',
          filter: `group_id=eq.${groupId}`,
        }, async (payload) => {
          const msg = payload.new
          if (msg.user_id === user.id) return

          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', msg.user_id).single()
          const { data: group } = await supabase.from('study_groups').select('name').eq('id', groupId).single()

          const senderName = profile?.full_name || 'Membre'
          const groupName = group?.name || 'Groupe'
          const isVoice = msg.type === 'voice'
          const preview = isVoice ? 'a envoye un vocal' : msg.content?.substring(0, 50)

          // Save to DB
          await saveNotification(user.id, 'message', groupId, groupName, senderName, preview)

          toast(`${senderName}: ${isVoice ? 'Vocal' : msg.content?.substring(0, 30)}`, {
            icon: '💬', duration: 4000,
            style: { background: '#0f2b1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }
          })

          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(groupName, { body: `${senderName}: ${isVoice ? 'Message vocal' : msg.content?.substring(0, 60)}`, icon: '/brain-logo.svg', tag: 'kangam-msg-' + msg.id })
          }
        })
        .subscribe()

      channelsRef.current.push(msgChannel)

      // New members
      const memberChannel = supabase
        .channel(`notif-member-${groupId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'study_group_members',
          filter: `group_id=eq.${groupId}`,
        }, async (payload) => {
          const member = payload.new
          if (member.user_id === user.id) return

          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', member.user_id).single()
          const { data: group } = await supabase.from('study_groups').select('name').eq('id', groupId).single()

          const name = profile?.full_name || 'Quelqu\'un'
          const groupName = group?.name || 'Groupe'

          // Notify ALL members of this group (save to DB for each)
          const { data: members } = await supabase
            .from('study_group_members')
            .select('user_id')
            .eq('group_id', groupId)
            .neq('user_id', member.user_id)

          if (members) {
            for (const m of members) {
              if (m.user_id === user.id) {
                await saveNotification(user.id, 'join', groupId, groupName, name, `a rejoint ${groupName}`)
              }
            }
          }

          toast(`${name} a rejoint ${groupName}`, {
            icon: '👋', duration: 3000,
            style: { background: '#0f2b1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }
          })

          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(groupName, { body: `${name} a rejoint le groupe`, icon: '/brain-logo.svg', tag: 'kangam-join-' + member.user_id })
          }
        })
        .subscribe()

      channelsRef.current.push(memberChannel)
    })

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []
    }
  }, [user, myGroupIds.join(',')])

  async function saveNotification(userId, type, groupId, groupName, senderName, content) {
    const { data } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        group_id: groupId,
        group_name: groupName,
        sender_name: senderName,
        content,
        is_read: false,
      })
      .select()
      .single()

    if (data) {
      setNotifications(prev => [data, ...prev].slice(0, 50))
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const clearAll = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, clearAll, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
