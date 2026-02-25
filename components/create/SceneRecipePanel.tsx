'use client'

import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { X, Upload, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCandidateStore } from '@/lib/stores/candidate-store'
import {
  uploadReferenceImage,
  proposeCandidates,
  getStudioStaticUrl,
} from '@/lib/api/studio-v1'
import { CandidateCard } from './CandidateCard'
import { EditPanel } from './EditPanel'
import { RegenerateLocksModal } from './RegenerateLocksModal'

export function SceneRecipePanel() {
  const {
    panelOpen,
    setPanelOpen,
    candidateSet,
    setCandidateSet,
    selectedCandidate,
    setSelectedCandidate,
    referenceImageId,
    referenceImageUrl,
    setReferenceImage,
    editingRecipeId,
    setEditingRecipeId,
    renderJobs,
    loading,
    setLoading,
  } = useCandidateStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        setLoading(true)
        const res = await uploadReferenceImage(file)
        setReferenceImage(res.reference_image_id, getStudioStaticUrl(res.url))
        toast.success('Reference image uploaded')
      } catch (err) {
        toast.error(
          `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [setReferenceImage, setLoading]
  )

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true)
      const res = await proposeCandidates({
        scene_id: `scene-${Date.now()}`,
        mode: 'vibe',
        reference_image_id: referenceImageId ?? undefined,
      })
      setCandidateSet(res)
      toast.success(`Generated ${res.candidates.length} candidates`)
    } catch (err) {
      toast.error(
        `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }, [referenceImageId, setCandidateSet, setLoading])

  if (!panelOpen) return null

  if (editingRecipeId) {
    const candidate = candidateSet?.candidates.find(
      (c) => c.recipe_id === editingRecipeId
    )
    if (candidate) {
      return (
        <div className="w-[420px] border-l border-border bg-background flex flex-col h-full flex-shrink-0">
          <EditPanel
            candidate={candidate}
            onClose={() => setEditingRecipeId(null)}
          />
        </div>
      )
    }
  }

  return (
    <div className="w-[420px] border-l border-border bg-background flex flex-col h-full flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Scene Recipe Builder</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Reference Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reference Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleUpload}
            />
            {referenceImageUrl ? (
              <div className="relative group">
                <img
                  src={referenceImageUrl}
                  alt="Reference"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                disabled={loading}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">Drop image or click to upload</span>
              </button>
            )}
          </div>

          {/* Generate Button */}
          <Button className="w-full" onClick={handleGenerate} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate 3 Candidates'}
          </Button>

          {/* Candidates */}
          {candidateSet && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Candidates ({candidateSet.candidates.length})
                </label>
                <RegenerateLocksModal
                  candidateSetId={candidateSet.candidate_set_id}
                />
              </div>
              <div className="space-y-2">
                {candidateSet.candidates.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.recipe_id}
                    candidate={candidate}
                    index={index}
                    isSelected={
                      selectedCandidate?.recipe_id === candidate.recipe_id
                    }
                    onSelect={() => setSelectedCandidate(candidate)}
                    onEdit={() => setEditingRecipeId(candidate.recipe_id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Jobs */}
          {renderJobs.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Render Jobs
              </label>
              {renderJobs.map((job) => (
                <div
                  key={job.render_id}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-border text-xs"
                >
                  <span className="font-mono truncate">
                    {job.render_id.slice(0, 8)}...
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      job.status === 'complete'
                        ? 'bg-green-500/10 text-green-500'
                        : job.status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
