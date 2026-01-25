import { User, Bot } from 'lucide-react'

export default function Message({ message }) {
  const isUser = message.role === 'user'
  
  // Simple function to clean markdown symbols
  const cleanText = (text) => {
    if (!text) return ''
    
    console.log('BEFORE CLEAN:', text.substring(0, 100)) // Debug
    
    // Remove all markdown formatting symbols
    let cleaned = text
      .replace(/\*\*/g, '')  // Remove bold **
      .replace(/\*/g, '')    // Remove italic *
      .replace(/__/g, '')    // Remove bold __
      .replace(/_/g, '')     // Remove italic _
      .replace(/`/g, '')     // Remove code `
      .replace(/#{1,6}\s/g, '') // Remove headers #
    
    console.log('AFTER CLEAN:', cleaned.substring(0, 100)) // Debug
    
    return cleaned
  }

  const displayContent = cleanText(message.content)

  return (
    <div className={'flex gap-3 mb-4 ' + (isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-senegal-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md'>
          <Bot size={18} className='text-white' />
        </div>
      )}

      <div 
        className={'max-w-[85%] rounded-2xl p-4 shadow-sm ' + (
          isUser 
            ? 'bg-gradient-to-br from-senegal-green to-emerald-600 text-white' 
            : 'bg-white text-gray-900 border border-gray-200'
        )}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '15px',
          lineHeight: '1.6'
        }}
      >
        <div className='whitespace-pre-wrap break-words'>
          {displayContent}
        </div>
        {message.created_at && (
          <div className={'text-xs mt-2 opacity-70'}>
            {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {isUser && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md'>
          <User size={18} className='text-gray-700' />
        </div>
      )}
    </div>
  )
}
