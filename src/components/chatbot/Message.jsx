import { User, Bot } from 'lucide-react'

export default function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={'flex gap-3 mb-4 ' + (isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className='w-8 h-8 rounded-full bg-senegal-green flex items-center justify-center flex-shrink-0'>
          <Bot size={20} className='text-white' />
        </div>
      )}
      
      <div className={'max-w-[80%] rounded-lg p-4 ' + (isUser ? 'bg-senegal-green text-white' : 'bg-gray-100 text-gray-900')}>
        <div className='whitespace-pre-wrap break-words'>{message.content}</div>
        <div className={'text-xs mt-2 ' + (isUser ? 'text-green-100' : 'text-gray-500')}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0'>
          <User size={20} className='text-gray-700' />
        </div>
      )}
    </div>
  )
}