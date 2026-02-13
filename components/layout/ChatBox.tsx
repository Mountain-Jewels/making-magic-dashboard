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

export function ChatBox({ inputRef }: { inputRef?: React.RefObject<HTMLTextAreaElement | null> }) {
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
      id="studio-chatbox"
      className="flex flex-col border-t-2 border-[#D4AF37] flex-shrink-0 bg-[#1A1A24] min-h-[160px]"
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
                    ? 'bg-[#D4AF37]/20 text-white'
                    : 'bg-[#1A1A24] text-white border-2 border-[#3A3A4A]'
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
                        className="text-[11px] px-2 py-1 rounded-lg border-2 border-[#3A3A4A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
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
      <div className="flex items-end gap-2 p-3 border-t-2 border-[#3A3A4A]">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Tell the AI what you want to create..."
          className="flex-1 min-w-0 h-24 bg-black/50 text-white border-2 border-[#3A3A4A] rounded-lg px-4 py-3 resize-none focus:border-[#D4AF37] focus:outline-none placeholder:text-white/60"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="shrink-0 p-2.5 rounded-lg bg-[#D4AF37] text-black border-2 border-[#D4AF37] hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-70 font-medium"
          aria-label="Send"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
