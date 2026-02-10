'use client'

import { useState } from 'react'
import { Star, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type MessageRole = 'ai' | 'user'

interface Message {
  id: string
  role: MessageRole
  text: string
  actions?: 'yes_no'
}

function getAIResponse(userMessage: string): { text: string; actions?: 'yes_no' } {
  const lower = userMessage.toLowerCase()
  if (lower.includes('light')) {
    return {
      text: "Try the 'Dramatic' lighting preset for more depth. I can also increase contrast by 20%.",
      actions: 'yes_no',
    }
  }
  if (lower.includes('short') || lower.includes('length') || lower.includes('duration')) {
    return {
      text: "Instagram Reels perform best at 15-30 seconds. I can trim your video to 20 seconds.",
      actions: 'yes_no',
    }
  }
  if (lower.includes('background')) {
    return {
      text: "A 'Luxury Showroom' background works well for jewelry. Want me to switch?",
      actions: 'yes_no',
    }
  }
  return {
    text: "I can help with lighting, backgrounds, video duration, and platform optimization. What would you like to improve?",
    actions: 'yes_no',
  }
}

interface AIChatDropdownProps {
  onClose: () => void
}

export function AIChatDropdown({ onClose }: AIChatDropdownProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: 'How may I assist?' },
  ])
  const [input, setInput] = useState('')
  const [respondedTo, setRespondedTo] = useState<Set<string>>(new Set())

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    const aiResp = getAIResponse(trimmed)
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: aiResp.text,
      actions: aiResp.actions,
    }
    setTimeout(() => {
      setMessages((prev) => [...prev, aiMsg])
    }, 300)
  }

  const handleYes = (msgId: string) => {
    setRespondedTo((prev) => new Set(prev).add(msgId))
    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: 'ai', text: '✓ Done! Change applied.' },
    ])
  }

  const handleNo = (msgId: string) => {
    setRespondedTo((prev) => new Set(prev).add(msgId))
    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: 'ai', text: 'No problem. What else can I help with?' },
    ])
  }

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-lg overflow-hidden flex flex-col max-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-panel border-b border-zinc-600 shrink-0">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-brand-gold text-brand-gold shrink-0" />
          <span className="text-sm text-zinc-400">Click for AI help</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg p-3 max-w-[85%]',
                msg.role === 'ai'
                  ? 'bg-zinc-800 text-zinc-200 text-left mr-auto'
                  : 'bg-brand-gold/20 text-zinc-100 text-right ml-auto'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.actions === 'yes_no' && !respondedTo.has(msg.id) && (
                <div className="flex gap-2 mt-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleYes(msg.id)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNo(msg.id)}
                  >
                    No
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-zinc-600 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <button
            type="button"
            onClick={handleSend}
            className="p-2 rounded-md hover:bg-zinc-700 text-brand-gold transition-colors"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
