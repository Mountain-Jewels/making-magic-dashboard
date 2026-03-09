// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sparkles, AlertTriangle, Zap, Info, Loader2 } from 'lucide-react'
import { optimizePlan } from '@/lib/api/scraper-plans'
import type { AISuggestion, ScrapeIntent } from '@/lib/types/scraper'

type SuggestionLevel = AISuggestion['type']

interface Props {
  intent: ScrapeIntent | null
  onEmit: () => void
}

const LEVEL_CONFIG: Record<SuggestionLevel, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'border-amber-400/30' },
  optimization: { icon: Zap, color: 'text-emerald-400', bg: 'border-emerald-400/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'border-blue-400/30' },
}

export function AIOptimizationPanel({ intent, onEmit }: Props) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: () => {
      if (!intent) throw new Error('No intent provided')
      return optimizePlan({ intent: intent as unknown as Record<string, unknown> })
    },
    onSuccess: (data) => setSuggestions(data.suggestions),
  })

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="text-white font-semibold text-sm">AI Optimization</h3>
      </div>

      <button
        type="button"
        onClick={() => analyze()}
        disabled={isPending || !intent}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-[#D4AF37]/20 px-4 py-2.5 text-sm font-medium text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isPending ? 'Analyzing…' : 'Analyze Plan'}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          {suggestions.map((s) => {
            const cfg = LEVEL_CONFIG[s.type]
            const Icon = cfg.icon
            return (
              <div
                key={s.id}
                className={`rounded-md border ${cfg.bg} bg-[#111118] p-3`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${cfg.color}`}>{s.title}</p>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {s.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onEmit}
        disabled={!intent}
        className="mt-5 w-full rounded-md bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#D4AF37]/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Emit Plan
      </button>
    </div>
  )
}
