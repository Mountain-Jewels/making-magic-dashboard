/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCandidateStore } from '@/lib/stores/candidate-store'
import { regenerateCandidates } from '@/lib/api/studio-v1'
import type { RegenerateLocks } from '@/lib/types/studio-v1'

const LOCK_LABELS: { key: keyof RegenerateLocks; label: string }[] = [
  { key: 'camera', label: 'Camera' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'atmosphere', label: 'Atmosphere' },
  { key: 'assets', label: 'Assets' },
  { key: 'imports', label: 'Imports' },
]

interface Props {
  candidateSetId: string
}

export function RegenerateLocksModal({ candidateSetId }: Props) {
  const [open, setOpen] = useState(false)
  const {
    locks,
    setLock,
    setAllLocks,
    selectedCandidate,
    candidateSet,
    setCandidateSet,
    setLoading,
    loading,
  } = useCandidateStore()

  const baseRecipeId =
    selectedCandidate?.recipe_id ?? candidateSet?.candidates[0]?.recipe_id

  const handleRegenerate = useCallback(async () => {
    if (!baseRecipeId) {
      toast.error('Select a candidate first')
      return
    }
    try {
      setLoading(true)
      const res = await regenerateCandidates(candidateSetId, {
        based_on_recipe_id: baseRecipeId,
        locks,
      })
      setCandidateSet(res)
      toast.success(`Regenerated ${res.candidates.length} candidates`)
      setOpen(false)
    } catch (err) {
      toast.error(
        `Regeneration failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }, [baseRecipeId, candidateSetId, locks, setCandidateSet, setLoading])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Regenerate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate with Locks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lock properties you want to preserve. Unlocked properties will be
            randomized.
          </p>

          <div className="space-y-2">
            {LOCK_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setLock(key, !locks[key])}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
                  locks[key]
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <span>{label}</span>
                {locks[key] ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setAllLocks(true)}
            >
              Lock All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setAllLocks(false)}
            >
              Unlock All
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleRegenerate}
            disabled={loading || !baseRecipeId}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Regenerating...' : 'Regenerate 3 Candidates'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
