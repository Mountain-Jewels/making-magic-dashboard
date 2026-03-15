/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, RotateCw } from 'lucide-react'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

interface PropertySection {
  label: string
  fields: { name: string; value: string }[]
}

export function InspectorPanel() {
  const { scene, avatar, lighting, camera, emotion, wardrobe, jewelry, edits, dirty, lastPushed, clearEdits } =
    useSceneStateStore()

  const sections = useMemo<PropertySection[]>(() => {
    const result: PropertySection[] = []

    result.push({
      label: 'Scene',
      fields: [
        { name: 'Environment', value: scene || '—' },
        { name: 'Avatar', value: avatar || '—' },
        { name: 'Status', value: dirty ? 'Unsaved changes' : 'Clean' },
      ],
    })

    result.push({
      label: 'Lighting & Camera',
      fields: [
        { name: 'Lighting', value: lighting?.replace(/_/g, ' ') || '—' },
        { name: 'Camera', value: camera?.replace(/_/g, ' ') || '—' },
        { name: 'Emotion', value: emotion || '—' },
      ],
    })

    if (wardrobe.length > 0 || jewelry.length > 0) {
      result.push({
        label: 'Equipment',
        fields: [
          ...(wardrobe.length > 0
            ? [{ name: 'Wardrobe', value: `${wardrobe.length} items` }]
            : []),
          ...(jewelry.length > 0
            ? [{ name: 'Jewelry', value: `${jewelry.length} pieces` }]
            : []),
        ],
      })
    }

    result.push({
      label: 'History',
      fields: [
        { name: 'Pending edits', value: String(edits.length) },
        {
          name: 'Last pushed',
          value: lastPushed
            ? new Date(lastPushed).toLocaleTimeString()
            : 'Never',
        },
      ],
    })

    return result
  }, [scene, avatar, lighting, camera, emotion, wardrobe, jewelry, edits, dirty, lastPushed])

  const hasState = scene || avatar || lighting || camera || edits.length > 0

  return (
    <div className="flex-1 overflow-y-auto border-b border-surface-border">
      <div className="flex items-center justify-between h-8 px-3 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Inspector
        </span>
        {edits.length > 0 && (
          <button
            onClick={clearEdits}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
            title="Clear edit history"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        )}
      </div>
      {!hasState ? (
        <div className="flex items-center justify-center h-24 text-[11px] text-white/25">
          Load a scene or select an avatar to begin
        </div>
      ) : (
        <div className="p-2 space-y-2">
          {sections.map((s) => (
            <InspectorSection key={s.label} section={s} />
          ))}
        </div>
      )}
    </div>
  )
}

function InspectorSection({ section }: { section: PropertySection }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide py-1"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {section.label}
      </button>
      {open && (
        <div className="pl-4 space-y-1">
          {section.fields.map((f) => (
            <div key={f.name} className="flex justify-between text-[11px]">
              <span className="text-white/40">{f.name}</span>
              <span className="text-white/70 font-mono text-[10px]">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
