'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader2, Copy, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantPanelProps {
  scriptTitle: string
  getScriptText: () => string
  onClose: () => void
  onInsert: (text: string) => void
}

const QUICK_PROMPTS = [
  'Suggest dialogue for this scene',
  'Write a scene heading for a church in Nairobi',
  'Help me develop this character\'s arc',
  'Suggest a redemption moment for this story',
  'Write action lines for a matatu chase scene',
  'How can I deepen the faith theme here?',
]

export default function AIAssistantPanel({
  scriptTitle, getScriptText, onClose, onInsert
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Habari! I'm your NuruLife Script Assistant. I'm here to help you write "${scriptTitle}" — a story that shines light and transforms lives.\n\nHow can I help you today? You can ask me to suggest dialogue, develop characters, strengthen your faith themes, or help with any aspect of your screenplay.`,
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const messagesEndRef           = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const scriptContext = getScriptText().slice(0, 2000)
      const res = await fetch('/api/ai/script-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          scriptContext,
          scriptTitle,
        }),
      })

      if (!res.ok) throw new Error('AI request failed')
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      let assistantContent = ''
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              assistantContent += delta
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                return updated
              })
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize — I encountered an error. Please try again. Remember, every great story is worth the effort!',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-xl">
      {/* Header */}
      <div className="bg-nuru-blue px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-nuru-orange" />
          <div>
            <h3 className="font-heading font-bold text-white text-sm">AI Script Assistant</h3>
            <p className="text-white text-opacity-50 text-[10px]">Faith-aligned · Africa-first</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors">
          <X size={16} className="text-white text-opacity-60" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {QUICK_PROMPTS.slice(0, 3).map(prompt => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 text-[10px] bg-nuru-lgray text-nuru-dgray px-2 py-1 rounded-full
                       hover:bg-nuru-orange hover:text-white transition-colors font-body"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('group', msg.role === 'user' ? 'flex justify-end' : '')}>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1 mb-1">
                <Sparkles size={10} className="text-nuru-orange" />
                <span className="text-[10px] text-gray-400 font-heading font-semibold">NuruLife AI</span>
              </div>
            )}
            <div className={cn(
              'rounded-lg p-3 text-xs font-body leading-relaxed',
              msg.role === 'user'
                ? 'ai-message-user max-w-[85%]'
                : 'ai-message-assistant'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'assistant' && msg.content && (
              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="text-[10px] text-gray-400 hover:text-nuru-dgray flex items-center gap-0.5"
                >
                  <Copy size={10} /> Copy
                </button>
                <button
                  onClick={() => onInsert(msg.content)}
                  className="text-[10px] text-nuru-orange hover:text-nuru-maroon flex items-center gap-0.5 ml-2"
                >
                  <PlusCircle size={10} /> Insert
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-message-assistant">
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-nuru-orange" />
              <span className="text-xs text-gray-400 font-body">Writing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            rows={2}
            className="flex-1 nuru-input resize-none text-xs py-2"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="nuru-btn-secondary px-3 flex items-center justify-center flex-shrink-0 self-end"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-1.5 font-body text-center">
          "Shining Light, Transforming Lives." — Matthew 5:14
        </p>
      </div>
    </div>
  )
}