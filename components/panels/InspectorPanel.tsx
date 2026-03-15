/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PropertySection {
  label: string
  fields: { name: string; value: string }[]
}

const EMPTY_SECTIONS: PropertySection[] = []

export function InspectorPanel() {
  const [sections] = useState<PropertySection[]>(EMPTY_SECTIONS)

  return (
    <div className="flex-1 overflow-y-auto border-b border-surface-border">
      <div className="flex items-center h-8 px-3 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Inspector
        </span>
      </div>
      {sections.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-[11px] text-white/25">
          Select an object to inspect
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
              <span className="text-white/70 font-mono">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
