import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../services/supabase'
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, Maximize2, Minimize2
} from 'lucide-react'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Open Relay - free TURN server, no signup, no limits
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'turn:global.relay.metered.ca:80', username: 'e8dd65b92aee3e4fb4b51f1c', credential: '3bOPhJHkNie8JnRR' },
    { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: 'e8dd65b92aee3e4fb4b51f1c', credential: '3bOPhJHkNie8JnRR' },
    { urls: 'turn:global.relay.metered.ca:443', username: 'e8dd65b92aee3e4fb4b51f1c', credential: '3bOPhJHkNie8JnRR' },
    { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: 'e8dd65b92aee3e4fb4b51f1c', credential: '3bOPhJHkNie8JnRR' },
  ]
}

export default function VideoRoom({ roomId, userId, userName, onLeave }) {
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({}) // { oderId: { stream, name, connection } }
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState(null)

  const localVideoRef = useRef(null)
  const peersRef = useRef({})
  const channelRef = useRef(null)
  const containerRef = useRef(null)

  const channelName = `video-room-${roomId}`

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom()
    }
  }, [])

  // Update local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      })
      return stream
    } catch (err) {
      console.error('Media error:', err)
      setError('Impossible d\'acceder a la camera/micro. Verifiez les permissions.')
      return null
    }
  }

  const createPeerConnection = useCallback((peerId, peerName, isInitiator) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId].connection

    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      peersRef.current[peerId] = { ...peersRef.current[peerId], stream: remoteStream, name: peerName }
      setPeers(prev => ({ ...prev, [peerId]: { stream: remoteStream, name: peerName } }))
    }

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'ice-candidate',
            candidate: event.candidate,
            from: userId,
            to: peerId,
            fromName: userName,
          }
        })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(peerId)
      }
    }

    peersRef.current[peerId] = { connection: pc, stream: null, name: peerName }
    return pc
  }, [localStream, userId, userName])

  const removePeer = (peerId) => {
    if (peersRef.current[peerId]) {
      peersRef.current[peerId].connection?.close()
      delete peersRef.current[peerId]
      setPeers(prev => {
        const next = { ...prev }
        delete next[peerId]
        return next
      })
    }
  }

  const joinRoom = async () => {
    const stream = await getMedia()
    if (!stream) return

    setLocalStream(stream)
    setJoined(true)

    // Subscribe to signaling channel
    const channel = supabase.channel(channelName)

    channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      if (payload.to && payload.to !== userId) return

      if (payload.type === 'join' && payload.from !== userId) {
        // New peer joined — create offer
        const pc = createPeerConnection(payload.from, payload.fromName, true)

        // Re-add tracks if needed
        stream.getTracks().forEach(track => {
          const senders = pc.getSenders()
          if (!senders.find(s => s.track === track)) {
            pc.addTrack(track, stream)
          }
        })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'offer',
            offer: pc.localDescription,
            from: userId,
            to: payload.from,
            fromName: userName,
          }
        })
      }

      if (payload.type === 'offer' && payload.from !== userId) {
        const pc = createPeerConnection(payload.from, payload.fromName, false)

        stream.getTracks().forEach(track => {
          const senders = pc.getSenders()
          if (!senders.find(s => s.track === track)) {
            pc.addTrack(track, stream)
          }
        })

        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'answer',
            answer: pc.localDescription,
            from: userId,
            to: payload.from,
            fromName: userName,
          }
        })
      }

      if (payload.type === 'answer' && payload.from !== userId) {
        const pc = peersRef.current[payload.from]?.connection
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
        }
      }

      if (payload.type === 'ice-candidate' && payload.from !== userId) {
        const pc = peersRef.current[payload.from]?.connection
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
        }
      }

      if (payload.type === 'leave' && payload.from !== userId) {
        removePeer(payload.from)
      }
    })

    await channel.subscribe()
    channelRef.current = channel

    // Announce join
    channel.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type: 'join', from: userId, fromName: userName }
    })
  }

  const leaveRoom = () => {
    // Announce leave
    channelRef.current?.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type: 'leave', from: userId }
    })

    // Close all peers
    Object.keys(peersRef.current).forEach(removePeer)

    // Stop local stream
    localStream?.getTracks().forEach(t => t.stop())
    setLocalStream(null)

    // Unsubscribe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    setJoined(false)
    setPeers({})
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
      setIsVideoOff(!isVideoOff)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleLeave = () => {
    leaveRoom()
    onLeave?.()
  }

  const peerEntries = Object.entries(peers)

  // ============ PRE-JOIN SCREEN ============

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-5 border border-red-500/20">
          <Video size={32} className="text-red-400" />
        </div>
        <h3 className="text-lg font-black text-white mb-1">Session Live</h3>
        <p className="text-xs text-white/25 max-w-[260px] mb-6">
          Video et audio en direct avec les membres du groupe. Aucune limite de temps.
        </p>

        {error && (
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 mb-4 max-w-[300px]">
            <p className="text-[11px] text-red-400">{error}</p>
          </div>
        )}

        <button onClick={joinRoom}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-sm shadow-xl hover:shadow-red-500/20 transition-all flex items-center gap-2">
          <Video size={18} />
          Rejoindre le Live
        </button>

        <div className="mt-6 bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] max-w-[280px]">
          <p className="text-[10px] text-white/25 leading-relaxed">
            Camera et micro requis. Fonctionne mieux avec 2-6 personnes.
          </p>
        </div>
      </div>
    )
  }

  // ============ VIDEO ROOM ============

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#050f0a]">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 bg-[#0a1f14] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
          <span className="text-[10px] text-white/30 flex items-center gap-1">
            <Users size={10} /> {peerEntries.length + 1}
          </span>
        </div>
        <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-white/10">
          {isFullscreen ? <Minimize2 size={14} className="text-white/40" /> : <Maximize2 size={14} className="text-white/40" />}
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center bg-[#050f0a] p-3 overflow-hidden">
        <div className="relative w-full h-full max-w-2xl flex flex-wrap gap-2 justify-center content-center">

          {/* Local Video Tile */}
          <div className={`relative rounded-2xl overflow-hidden bg-black/40 shadow-xl ${
            peerEntries.length === 0 ? 'w-full max-w-md aspect-[3/4]' :
            peerEntries.length <= 2 ? 'w-[48%] aspect-[3/4]' :
            'w-[48%] aspect-[4/3]'
          }`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center bg-[#0a1f14]">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-3xl">
                  {(userName || 'M')[0].toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-[10px] text-white font-semibold">Vous</span>
              {isMuted && <MicOff size={10} className="text-red-400" />}
            </div>
          </div>

          {/* Remote Video Tiles */}
          {peerEntries.map(([peerId, peer]) => (
            <div key={peerId} className={`relative rounded-2xl overflow-hidden shadow-xl ${
              peerEntries.length <= 2 ? 'w-[48%] aspect-[3/4]' : 'w-[48%] aspect-[4/3]'
            }`}>
              <PeerVideo stream={peer.stream} name={peer.name} />
            </div>
          ))}

          {/* Waiting overlay when alone */}
          {peerEntries.length === 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-white/70">En attente d'autres membres...</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 py-3 px-4 bg-[#0a1f14] border-t border-white/[0.06]">
        <div className="flex items-center justify-center gap-3">
          <button onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button onClick={handleLeave}
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Separate component for remote peer video
function PeerVideo({ stream, name }) {
  const videoRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(true)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        setHasVideo(videoTrack.enabled)
        videoTrack.onmute = () => setHasVideo(false)
        videoTrack.onunmute = () => setHasVideo(true)
      }
    }
  }, [stream])

  return (
    <div className="relative w-full h-full bg-black/40">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!hasVideo ? 'hidden' : ''}`}
      />
      {!hasVideo && (
        <div className="w-full h-full flex items-center justify-center bg-[#0a1f14]">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
            {(name || 'M')[0].toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur rounded px-1.5 py-0.5">
        <span className="text-[9px] text-white font-semibold">{name || 'Membre'}</span>
      </div>
    </div>
  )
}
