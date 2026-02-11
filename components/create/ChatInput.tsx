'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { chatMessage } from '@/lib/api/ai'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import type { CreationConfig } from './CreationWizard'

interface ChatInputProps {
  placeholder: string
  onSubmit?: (text: string) => void
  className?: string
  creationConfig?: CreationConfig | null
}

type SuggestionItem = { type: string; action: string; value: string }

export function ChatInput({ placeholder, onSubmit, className = '', creationConfig }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])

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

  const handleApplySuggestion = (s: SuggestionItem) => {
    if (!scene) return
    const id = scene.id
    if (s.type === 'lighting') updateScene(id, { lighting: s.value as typeof scene.lighting })
    else if (s.type === 'background') updateScene(id, { background: s.value as typeof scene.background })
    else if (s.type === 'jewelry') updateScene(id, { jewelry_sku: s.value })
    else if (s.type === 'avatar') {
      // Avatar is in avatar store - would need setSelectedPreset by name; skip for now
    }
  }

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
    setValue('')
    setLoading(true)
    setLastResponse(null)
    setSuggestions([])
    try {
      const sceneContext = buildSceneContext()
      const res = await chatMessage({ message: trimmed, scene_context: sceneContext })
      const text = (res as { content?: string; response?: string }).content ?? (res as { response?: string }).response ?? ''
      setLastResponse(text)
      const sugg = (res as { suggestions?: SuggestionItem[] }).suggestions ?? []
      setSuggestions(Array.isArray(sugg) ? sugg : [])
    } catch (err) {
      setLastResponse((err as Error)?.message ?? 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`border-t border-brand-gold/40 p-4 ${className}`}
      style={{ backgroundColor: '#F3F4F6', minHeight: 120 }}
    >
      {lastResponse && (
        <div className="mb-3 rounded-lg bg-white border border-brand-gold/40 p-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{lastResponse}</p>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplySuggestion(s)}
                  className="text-[11px] px-2 py-1 rounded-full border border-brand-gold/40 hover:bg-brand-gold/10 transition-colors"
                >
                  {s.action || s.value}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 rounded-2xl border-2 border-brand-gold/40 shadow-sm px-3 sm:px-4 py-3"
        style={{ backgroundColor: '#FFFFFF', minHeight: 90 }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          rows={4}
          style={{ minHeight: 70, color: '#111827' }}
          className="flex-1 min-w-0 w-full bg-transparent placeholder:text-gray-400 text-sm resize-none focus:outline-none leading-relaxed"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="shrink-0 p-3 rounded-full bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors disabled:opacity-70"
          aria-label="Send"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
