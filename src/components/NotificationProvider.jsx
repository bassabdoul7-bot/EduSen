import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NotificationContext = createContext({ notifications: [], unreadCount: 0, clearAll: () => {} })

export const useNotifications = () => useContext(NotificationContext)

export default function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [myGroupIds, setMyGroupIds] = useState([])
  const channelsRef = useRef([])

  // Load user's groups
  useEffect(() => {
    if (!user) { setMyGroupIds([]); return }

    async function loadGroups() {
      const { data } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id)
      setMyGroupIds(data?.map(m => m.group_id) || [])
    }
    loadGroups()

    // Re-check every 30s for new group joins
    const interval = setInterval(loadGroups, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Subscribe to realtime events for all groups
  useEffect(() => {
    if (!user || myGroupIds.length === 0) return

    // Cleanup old channels
    channelsRef.current.forEach(ch => supabase.removeChannel(ch))
    channelsRef.current = []

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    myGroupIds.forEach(groupId => {
      // Listen for new messages
      const msgChannel = supabase
        .channel(`notif-msg-${groupId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `group_id=eq.${groupId}`,
        }, async (payload) => {
          const msg = payload.new
          if (msg.user_id === user.id) return

          // Get sender name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', msg.user_id)
            .single()

          // Get group name
          const { data: group } = await supabase
            .from('study_groups')
            .select('name')
            .eq('id', groupId)
            .single()

          const senderName = profile?.full_name || 'Membre'
          const groupName = group?.name || 'Groupe'
          const isVoice = msg.type === 'voice'
          const preview = isVoice ? 'a envoye un vocal' : msg.content?.substring(0, 50) + (msg.content?.length > 50 ? '...' : '')

          const notif = {
            id: msg.id,
            type: 'message',
            groupId,
            groupName,
            senderName,
            content: preview,
            createdAt: msg.created_at,
            read: false,
          }

          setNotifications(prev => [notif, ...prev].slice(0, 50))

          // In-app toast
          toast(senderName + ' dans ' + groupName + ': ' + (isVoice ? 'Vocal' : msg.content?.substring(0, 30)), {
            icon: '💬',
            duration: 4000,
            style: { background: '#0f2b1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }
          })

          // Browser notification if tab is hidden
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(groupName, {
              body: senderName + ': ' + (isVoice ? 'Message vocal' : msg.content?.substring(0, 60)),
              icon: '/vite.svg',
              tag: 'edusen-msg-' + msg.id,
            })
          }
        })
        .subscribe()

      channelsRef.current.push(msgChannel)

      // Listen for new members joining
      const memberChannel = supabase
        .channel(`notif-member-${groupId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_members',
          filter: `group_id=eq.${groupId}`,
        }, async (payload) => {
          const member = payload.new
          if (member.user_id === user.id) return

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', member.user_id)
            .single()

          const { data: group } = await supabase
            .from('study_groups')
            .select('name')
            .eq('id', groupId)
            .single()

          const name = profile?.full_name || 'Quelqu\'un'
          const groupName = group?.name || 'Groupe'

          const notif = {
            id: member.user_id + '-' + Date.now(),
            type: 'join',
            groupId,
            groupName,
            senderName: name,
            content: 'a rejoint ' + groupName,
            createdAt: new Date().toISOString(),
            read: false,
          }

          setNotifications(prev => [notif, ...prev].slice(0, 50))

          toast(name + ' a rejoint ' + groupName, {
            icon: '👋',
            duration: 3000,
            style: { background: '#0f2b1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }
          })

          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(groupName, {
              body: name + ' a rejoint le groupe',
              icon: '/vite.svg',
              tag: 'edusen-join-' + member.user_id,
            })
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

  const unreadCount = notifications.filter(n => !n.read).length

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, clearAll, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
