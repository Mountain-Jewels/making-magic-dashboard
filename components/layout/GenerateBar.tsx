/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Sparkles } from 'lucide-react'
import { useStudioStore } from '@/lib/stores/studio-store'
import { chatWithDirector } from '@/lib/api/director'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { toast } from 'sonner'

const TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'video_2d', label: '2D Video' },
  { value: 'video_3d', label: '3D Video' },
  { value: 'music', label: 'Music' },
  { value: 'dialogue', label: 'Dialogue' },
] as const

export function GenerateBar() {
  const {
    generatePrompt,
    setGeneratePrompt,
    generateType,
    setGenerateType,
    aiStatus,
    setAIStatus,
    setAIProgress,
  } = useStudioStore()

  const busy = aiStatus === 'generating'

  const { getActiveBrain, incrementInteraction } = useAvatarBrainStore()
  const { avatar, scene } = useSceneStateStore()
  const activeCustomer = useCustomerStore((s) => s.getActiveCustomer())

  async function handleGenerate() {
    if (!generatePrompt.trim() || busy) return
    setAIStatus('generating', 'Sending to AI Director...')
    setAIProgress(10)

    const brain = getActiveBrain()
    const contextPrefix = [
      `[${generateType}]`,
      avatar ? `[avatar:${avatar}]` : '',
      scene ? `[scene:${scene}]` : '',
      brain ? `[interactions:${brain.total_interactions}]` : '',
      activeCustomer ? `[customer:${activeCustomer.name}]` : '',
    ].filter(Boolean).join(' ')

    try {
      const res = await chatWithDirector(
        `${contextPrefix} ${generatePrompt}`
      )
      setAIProgress(100)
      setAIStatus('complete', res.response || 'Generation complete')
      if (brain) incrementInteraction(brain.metahuman_id)
      toast.success('AI Director responded')
    } catch (err) {
      setAIStatus('error', String(err))
      toast.error('Generation failed')
    }
  }

  return (
    <div className="flex items-center h-[52px] border-t border-surface-border bg-surface-panel px-3 gap-2 shrink-0">
      {/* Type selector */}
      <select
        value={generateType}
        onChange={(e) =>
          setGenerateType(e.target.value as typeof generateType)
        }
        className="h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white/70 focus:outline-none focus:ring-1 focus:ring-gold appearance-none cursor-pointer"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Prompt input */}
      <input
        value={generatePrompt}
        onChange={(e) => setGeneratePrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        placeholder="Describe scene, mood, lighting, camera path..."
        className="flex-1 h-8 px-3 bg-surface border border-surface-border rounded text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-gold"
        disabled={busy}
      />

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={busy || !generatePrompt.trim()}
        className="flex items-center gap-1.5 h-8 px-4 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate
      </button>
    </div>
  )
}
