/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect } from 'react'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getVoices, previewVoice } from '@/lib/api/voices'
import { generateAvatar } from '@/lib/api/generate'
import { getApiBaseUrl } from '@/lib/api/client'
import type { Voice } from '@/lib/api/types'

const CUSTOM_SLOT_COUNT = 10

type CustomSlot = { name: string; filled: boolean; age: number; voice: string }

const SELECTED_CLASS = 'border-brand-gold bg-brand-gold/10'

export function AvatarGallery() {
  const { presets, setSelectedPreset } = useAvatarStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [avatarAge, setAvatarAge] = useState<Record<string, number>>({})
  const [avatarVoice, setAvatarVoice] = useState<Record<string, string>>({})
  const [customSlots, setCustomSlots] = useState<CustomSlot[]>(
    Array.from({ length: CUSTOM_SLOT_COUNT }, () => ({ name: '', filled: false, age: 21, voice: '' }))
  )

  const [voices, setVoices] = useState<Voice[]>([])
  const [voicesLoading, setVoicesLoading] = useState(true)
  const [voicesError, setVoicesError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [quickPreviewLoading, setQuickPreviewLoading] = useState<Record<string, boolean>>({})
  const [quickPreviewStatus, setQuickPreviewStatus] = useState<Record<string, string>>({})

  const getAge = (id: string) => avatarAge[id] ?? 21
  const getVoice = (id: string) => avatarVoice[id] ?? ''
  const safePresets = presets ?? []

  useEffect(() => {
    let cancelled = false
    setVoicesLoading(true)
    setVoicesError(null)
    getVoices()
      .then((v) => {
        if (!cancelled) setVoices(v)
      })
      .catch((err) => {
        if (!cancelled) setVoicesError(err?.message ?? 'Failed to load voices')
      })
      .finally(() => {
        if (!cancelled) setVoicesLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const VOICE_OPTIONS = voices.length > 0 ? voices : []
  const apiBase = getApiBaseUrl()

  const handlePreviewVoice = async (presetId: string) => {
    const voiceId = getVoice(presetId)
    if (!voiceId || voiceId === 'create_custom') return
    setPreviewLoading(true)
    try {
      const res = await previewVoice(voiceId, 'Hello, welcome to Mountain Jewels')
      if (!res) return
      const audioPath = (res as Record<string, unknown>).audio_url as string ?? (res as Record<string, unknown>).url as string
      if (audioPath && apiBase) {
        const fullUrl = audioPath.startsWith('http') ? audioPath : `${apiBase}${audioPath.startsWith('/') ? '' : '/'}${audioPath}`
        const audio = new Audio(fullUrl)
        await audio.play()
      }
    } catch (err) {
      console.error('Preview voice failed:', err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleQuickPreview = async (presetId: string) => {
    const voiceId = getVoice(presetId) || undefined
    if (!voiceId || voiceId === 'create_custom') {
      setQuickPreviewStatus((s) => ({ ...s, [presetId]: 'Select a voice first' }))
      return
    }
    setQuickPreviewLoading((s) => ({ ...s, [presetId]: true }))
    setQuickPreviewStatus((s) => ({ ...s, [presetId]: '' }))
    try {
      const res = await generateAvatar({
        avatar_id: presetId,
        script: 'Welcome to Mountain Jewels',
        voice_id: voiceId,
      })
      setQuickPreviewStatus((s) => ({
        ...s,
        [presetId]: res.status === 'queued' ? 'Generating...' : res.status,
      }))
    } catch (err) {
      setQuickPreviewStatus((s) => ({
        ...s,
        [presetId]: (err as Error)?.message ?? 'Failed',
      }))
    } finally {
      setQuickPreviewLoading((s) => ({ ...s, [presetId]: false }))
    }
  }

  const handleAddToScene = () => {
    if (!selectedId) return
    const preset = safePresets.find((p) => p.id === selectedId)
    if (preset) setSelectedPreset(preset)
  }

  const updateCustomSlot = (index: number, updates: Partial<CustomSlot>) => {
    setCustomSlots((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Avatars</h3>
      {voicesError && (
        <p className="text-[11px] text-amber-600">{voicesError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {/* Pre-made avatars — no initials circle, name + Age + Voice only */}
        {safePresets.map((preset) => {
          const isSelected = selectedId === preset.id
          const age = getAge(preset.id)
          const voice = getVoice(preset.id)
          const isQuickPreviewLoading = quickPreviewLoading[preset.id]
          const quickStatus = quickPreviewStatus[preset.id]
          return (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(preset.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedId(preset.id)}
              className={cn(
                'h-[76px] w-full p-2 rounded-lg border-2 border-brand-gold/40 overflow-hidden flex flex-col justify-between bg-gray-100',
                isSelected && SELECTED_CLASS
              )}
            >
              <span className="text-[11px] font-semibold truncate block">{preset.name}</span>
              <Select
                value={age.toString()}
                onValueChange={(v) => setAvatarAge((prev) => ({ ...prev, [preset.id]: parseInt(v, 10) }))}
              >
                <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {[0, 3, 5, 8, 13, 16, 21, 30, 40, 50, 60, 70, 80].map((a) => (
                    <SelectItem key={a} value={a.toString()} className="text-[11px]">
                      {a === 0 ? 'Newborn' : a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1 items-center min-w-0">
                <Select
                  value={voice || undefined}
                  onValueChange={(v) => setAvatarVoice((prev) => ({ ...prev, [preset.id]: v === 'create_custom' ? '' : v }))}
                >
                  <SelectTrigger className="h-5 text-[10px] flex-1 min-w-0 border-2 border-brand-gold/40">
                    <SelectValue placeholder={voicesLoading ? 'Loading...' : 'Voice'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {VOICE_OPTIONS.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-[11px]">
                        {v.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_custom" className="text-[11px] font-medium">
                      + Create Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  title="Preview Voice"
                  disabled={previewLoading || !voice || voice === 'create_custom'}
                  onClick={(e) => { e.stopPropagation(); handlePreviewVoice(preset.id) }}
                  className="shrink-0 h-5 w-5 flex items-center justify-center rounded border border-brand-gold/40 text-[10px] hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  🔊
                </button>
                <button
                  type="button"
                  title="Quick Preview"
                  disabled={isQuickPreviewLoading || !voice || voice === 'create_custom'}
                  onClick={(e) => { e.stopPropagation(); handleQuickPreview(preset.id) }}
                  className="shrink-0 text-[9px] px-1 py-0.5 rounded border border-brand-gold/40 hover:bg-gray-200 disabled:opacity-50"
                >
                  {isQuickPreviewLoading ? '...' : 'Preview'}
                </button>
              </div>
              {quickStatus ? <span className="text-[9px] truncate block text-gray-500">{quickStatus}</span> : null}
            </div>
          )
        })}

        {/* Custom slots — same h-[76px], same layout when filled */}
        {customSlots.map((slot, i) => (
          <div
            key={`custom-${i}`}
            className={
              slot.filled
                ? 'h-[76px] w-full p-2 rounded-lg border-2 border-brand-gold/40 overflow-hidden flex flex-col justify-between bg-gray-100'
                : 'h-[76px] w-full p-2 rounded-lg border-2 border-brand-gold/40 overflow-hidden flex flex-col justify-between bg-white'
            }
          >
            {slot.filled ? (
              <>
                <span className="text-[11px] font-semibold truncate block">{slot.name || 'Custom'}</span>
                <Select
                  value={slot.age.toString()}
                  onValueChange={(v) => updateCustomSlot(i, { age: parseInt(v, 10) })}
                >
                  <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                    <SelectValue placeholder="Age" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {[0, 3, 5, 8, 13, 16, 21, 30, 40, 50, 60, 70, 80].map((a) => (
                      <SelectItem key={a} value={a.toString()} className="text-[11px]">
                        {a === 0 ? 'Newborn' : a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={slot.voice || undefined}
                  onValueChange={(v) => updateCustomSlot(i, { voice: v === 'create_custom' ? '' : v })}
                >
                  <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                    <SelectValue placeholder={voicesLoading ? 'Loading...' : 'Voice'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {VOICE_OPTIONS.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-[11px]">
                        {v.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_custom" className="text-[11px] font-medium">
                      + Create Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <input
                type="text"
                placeholder="Name..."
                className="text-[11px] bg-transparent border-none focus:outline-none placeholder:text-gray-400 w-full truncate min-w-0"
                value={slot.name}
                onChange={(e) => updateCustomSlot(i, { name: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      {/* Upload + Create (AI) — same h-[76px] so visually identical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block">
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" className="hidden" />
          <div
            className="h-[76px] w-full p-2 rounded-lg border-2 border-brand-gold/40 overflow-hidden flex flex-col justify-between bg-white flex items-center justify-center text-[11px] text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            📤 Upload Image
          </div>
        </label>
        <button
          type="button"
          className="h-[76px] w-full p-2 rounded-lg border-2 border-brand-gold/40 overflow-hidden flex flex-col justify-between bg-white flex items-center justify-center text-[11px] text-gray-500 hover:bg-gray-50"
        >
          ✨ Create (AI)
        </button>
      </div>

      <Button
        className="w-full bg-brand-gold text-black hover:bg-brand-gold/90 h-8 text-xs"
        onClick={handleAddToScene}
        disabled={!selectedId}
      >
        + Add to Scene
      </Button>
    </div>
  )
}
