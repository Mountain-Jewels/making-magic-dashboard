'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, Play, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCandidateStore } from '@/lib/stores/candidate-store'
import { createRenderJob, getStudioStaticUrl } from '@/lib/api/studio-v1'
import type { CandidateResponse, RecipeJson } from '@/lib/types/studio-v1'

function recipeSummary(r: RecipeJson): string {
  const fl = r.camera.focal_length_mm
  const lens = fl < 30 ? 'Wide' : fl < 50 ? 'Standard' : 'Telephoto'
  const w = r.lighting.warmth
  const mood = w > 0.6 ? 'Warm' : w < 0.4 ? 'Cool' : 'Neutral'
  const n = r.actors.length
  return `${lens} ${Math.round(fl)}mm \u00b7 ${mood} \u00b7 ${n} actor${n !== 1 ? 's' : ''}`
}

interface CandidateCardProps {
  candidate: CandidateResponse
  index: number
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
}

export function CandidateCard({
  candidate,
  index,
  isSelected,
  onSelect,
  onEdit,
}: CandidateCardProps) {
  const { addRenderJob } = useCandidateStore()

  const handleRender = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        const job = await createRenderJob({
          recipe_id: candidate.recipe_id,
          type: 'preview',
        })
        addRenderJob(job)
        toast.success(`Render queued: ${job.render_id.slice(0, 8)}...`)
      } catch (err) {
        toast.error(
          `Render failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    },
    [candidate.recipe_id, addRenderJob]
  )

  const previewUrl =
    candidate.preview.type === 'reference'
      ? getStudioStaticUrl(candidate.preview.image_url)
      : null

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 transition-colors cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Candidate ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Mountain className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              #{index + 1}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {candidate.mode}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {recipeSummary(candidate.recipe_json)}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          disabled
          title="Apply to Viewport (coming soon)"
          onClick={(e) => e.stopPropagation()}
        >
          <Check className="h-3 w-3 mr-1" />
          Apply
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={handleRender}
        >
          <Play className="h-3 w-3 mr-1" />
          Render
        </Button>
      </div>
    </div>
  )
}
