import { User, Bot } from 'lucide-react'
import { useMemo } from 'react'

// Robust markdown parser that handles streaming properly
const parseMarkdown = (text) => {
  if (!text) return ''
  
  let html = text
  
  // Escape HTML first
  html = html.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
  
  // Parse bold **text** or __text__ (non-greedy, handles incomplete streaming)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Parse italic *text* or _text_ (but not when part of bold)
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>')
  
  // Parse inline code `code`
  html = html.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>')
  
  // Parse code blocks ```code```
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="code-block"><code>$2</code></pre>')
  
  // Parse headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')
  
  // Parse numbered lists (more robust)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="list-item">$1</li>')
  
  // Parse bullet lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, '<li class="list-item">$1</li>')
  
  // Wrap consecutive list items
  html = html.replace(/(<li class="list-item">.*?<\/li>\s*)+/g, '<ul class="list-group">$&</ul>')
  
  // Parse line breaks (preserve whitespace structure)
  html = html.replace(/\n\n/g, '<br/><br/>')
  html = html.replace(/\n/g, '<br/>')
  
  return html
}

export default function Message({ message }) {
  const isUser = message.role === 'user'
  
  // Memoize parsed content to avoid re-parsing on every render
  const formattedContent = useMemo(() => {
    return parseMarkdown(message.content)
  }, [message.content])

  return (
    <div className={'flex gap-3 mb-4 animate-fade-in ' + (isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-senegal-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md'>
          <Bot size={18} className='text-white' />
        </div>
      )}

      <div 
        className={'max-w-[85%] rounded-2xl p-4 shadow-sm ' + (
          isUser 
            ? 'bg-gradient-to-br from-senegal-green to-emerald-600 text-white' 
            : 'bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-100'
        )}
      >
        <div 
          className='markdown-content leading-relaxed'
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        {message.created_at && (
          <div className={'text-xs mt-2 ' + (isUser ? 'text-emerald-100' : 'text-gray-400')}>
            {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {isUser && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md'>
          <User size={18} className='text-gray-700' />
        </div>
      )}
      
      <style jsx>{`
        .markdown-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        
        .markdown-content strong {
          font-weight: 700;
        }
        
        .markdown-content em {
          font-style: italic;
        }
        
        .markdown-content .inline-code {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .markdown-content .code-block {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 12px;
          border-radius: 8px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .markdown-content .list-group {
          margin: 8px 0;
          padding-left: 0;
        }
        
        .markdown-content .list-item {
          margin-left: 24px;
          list-style: disc;
          margin-bottom: 4px;
        }
        
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}
