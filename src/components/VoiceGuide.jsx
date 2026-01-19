// ============ VOICE GUIDE - French Narration ============
import { useEffect, useRef } from 'react'

export function VoiceGuide({ text, autoPlay = true, rate = 0.9, onComplete }) {
  const utteranceRef = useRef(null)
  
  useEffect(() => {
    if (!text || !autoPlay) return
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text)
    utteranceRef.current.lang = 'fr-FR'
    utteranceRef.current.rate = rate
    utteranceRef.current.pitch = 1.0
    utteranceRef.current.volume = 1.0
    
    // Event listeners
    utteranceRef.current.onend = () => {
      onComplete?.()
    }
    
    utteranceRef.current.onerror = (event) => {
      console.error('Speech error:', event)
    }
    
    // Speak after small delay for better flow
    setTimeout(() => {
      window.speechSynthesis.speak(utteranceRef.current)
    }, 500)
    
    // Cleanup
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [text, autoPlay, rate, onComplete])
  
  return null // No visual component
}

// Helper function to speak immediately
export const speak = (text, options = {}) => {
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.lang || 'fr-FR'
  utterance.rate = options.rate || 0.9
  utterance.pitch = options.pitch || 1.0
  utterance.volume = options.volume || 1.0
  
  if (options.onComplete) {
    utterance.onend = options.onComplete
  }
  
  window.speechSynthesis.speak(utterance)
}