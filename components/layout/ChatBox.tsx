/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Send } from 'lucide-react'
import { chatMessage } from '@/lib/api/ai'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { ScrollArea } from '@/components/ui/scroll-area'

type SuggestionItem = { type: string; action: string; value: string }
type Message = { role: 'user' | 'assistant'; content: string; suggestions?: SuggestionItem[] }

export function ChatBox() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const { updateScene, currentScene, scenes } = useSceneStore()
  const { selectedPreset } = useAvatarStore()
  const scene = currentScene ?? scenes[0]

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildSceneContext = (): Record<string, unknown> => ({
    avatar: selectedPreset?.name ?? null,
    jewelry: scene ? { sku: scene.jewelry_sku, position: scene.jewelry_position } : null,
    background: scene?.background ?? null,
    lighting: scene?.lighting ?? null,
    music: scene?.musicUrl ?? null,
    event: scene?.event ?? null,
    destination: scene?.destination ?? null,
  })

  const handleApplySuggestion = (s: SuggestionItem) => {
    if (!s || !scene) return
    const id = scene.id
    if (s.type === 'lighting') updateScene(id, { lighting: s.value as typeof scene.lighting })
    else if (s.type === 'background') updateScene(id, { background: s.value as typeof scene.background })
    else if (s.type === 'jewelry') updateScene(id, { jewelry_sku: s.value })
  }

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return
    setValue('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setLoading(true)
    try {
      const sceneContext = buildSceneContext()
      const res = await chatMessage({ message: trimmed, scene_context: sceneContext })
      const text = (res as { content?: string; response?: string }).content ?? (res as { response?: string }).response ?? ''
      const sugg = (res as { suggestions?: Message['suggestions'] }).suggestions ?? []
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: text, suggestions: Array.isArray(sugg) ? sugg : [] },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: (err as Error)?.message ?? 'Failed to get response' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col border-t-2 border-brand-gold/30 flex-shrink-0 bg-surface-elevated"
      style={{ minHeight: 160 }}
    >
      <ScrollArea className="flex-1 min-h-[60px] max-h-32 px-3 py-2">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-gold/20 text-text-primary'
                    : 'bg-surface-elevated text-text-primary border border-surface-border'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.suggestions.map((s, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleApplySuggestion(s)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-brand-gold/40 hover:bg-brand-gold/10 transition-colors"
                      >
                        {s.action || s.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>
      <div className="flex items-end gap-2 p-3 border-t border-surface-border">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Tell the AI what you want to create..."
          rows={2}
          className="flex-1 min-w-0 bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="shrink-0 p-2.5 rounded-lg bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors disabled:opacity-70"
          aria-label="Send"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
