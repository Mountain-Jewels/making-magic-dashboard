'use client'

import { useState, useEffect } from 'react'
import { Star, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getSuggestions, chatMessage, chatWithGrok } from '@/lib/api/ai'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import type { SuggestionItem } from '@/lib/api/types'

type MessageRole = 'ai' | 'user'

interface Message {
  id: string
  role: MessageRole
  text: string
  actions?: 'yes_no'
  trends?: string[]
}

interface AIChatDropdownProps {
  onClose: () => void
  creationConfig?: { event?: string } | null
}

export function AIChatDropdown({ onClose, creationConfig }: AIChatDropdownProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: 'How may I assist?' },
  ])
  const [input, setInput] = useState('')
  const [respondedTo, setRespondedTo] = useState<Set<string>>(new Set())
  const [useGrok, setUseGrok] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)

  const { updateScene, currentScene, scenes } = useSceneStore()
  const { selectedPreset } = useAvatarStore()
  const scene = currentScene ?? scenes[0]

  const buildSceneContext = (): Record<string, unknown> => ({
    avatar: selectedPreset?.name ?? null,
    jewelry: scene ? { sku: scene.jewelry_sku, position: scene.jewelry_position } : null,
    background: scene?.background ?? null,
    lighting: scene?.lighting ?? null,
    music: null,
    event: creationConfig?.event ?? null,
  })

  useEffect(() => {
    let cancelled = false
    setSuggestionsLoading(true)
    const ctx = buildSceneContext()
    getSuggestions({ scene_state: ctx })
      .then((res) => {
        if (!cancelled) setSuggestions(res.suggestions ?? [])
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleApplySuggestion = (s: SuggestionItem) => {
    if (!scene) return
    const id = scene.id
    if (s.type === 'lighting') updateScene(id, { lighting: s.value as typeof scene.lighting })
    else if (s.type === 'background') updateScene(id, { background: s.value as typeof scene.background })
    else if (s.type === 'jewelry') updateScene(id, { jewelry_sku: s.value })
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSendLoading(true)

    try {
      const ctx = buildSceneContext()
      const res = useGrok
        ? await chatWithGrok({ message: trimmed, scene_context: ctx })
        : await chatMessage({ message: trimmed, scene_context: ctx })
      const text = (res as { content?: string; response?: string }).content ?? (res as { response?: string }).response ?? ''
      const trends = (res as { trends?: string[] }).trends ?? []
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', text, trends: trends.length > 0 ? trends : undefined },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', text: (err as Error)?.message ?? 'Failed to get response' },
      ])
    } finally {
      setSendLoading(false)
    }
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
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-zinc-400">Use Grok</span>
          <input
            type="checkbox"
            checked={useGrok}
            onChange={(e) => setUseGrok(e.target.checked)}
            className="rounded border-zinc-600"
          />
        </label>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-b border-zinc-600 shrink-0">
          <p className="text-xs text-zinc-500 mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-xs text-zinc-300">{s.action || s.value}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => handleApplySuggestion(s)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              {msg.trends && msg.trends.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {msg.trends.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
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
            disabled={sendLoading}
            className="p-2 rounded-md hover:bg-zinc-700 text-brand-gold transition-colors disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
