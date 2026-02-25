'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Save, Code2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { patchRecipe } from '@/lib/api/studio-v1'
import { useCandidateStore } from '@/lib/stores/candidate-store'
import { AssetPicker } from './AssetPicker'
import type { CandidateResponse, JsonPatchOp, RecipeJson } from '@/lib/types/studio-v1'

interface EditPanelProps {
  candidate: CandidateResponse
  onClose: () => void
}

interface SliderConfig {
  label: string
  path: string
  min: number
  max: number
  step: number
  getter: (r: RecipeJson) => number
}

const SLIDER_CONFIGS: SliderConfig[] = [
  {
    label: 'Focal Length (mm)',
    path: '/camera/focal_length_mm',
    min: 12,
    max: 200,
    step: 1,
    getter: (r) => r.camera.focal_length_mm,
  },
  {
    label: 'Sun Azimuth (\u00b0)',
    path: '/lighting/sun_azimuth_deg',
    min: 0,
    max: 360,
    step: 1,
    getter: (r) => r.lighting.sun_azimuth_deg,
  },
  {
    label: 'Sun Elevation (\u00b0)',
    path: '/lighting/sun_elevation_deg',
    min: -10,
    max: 90,
    step: 1,
    getter: (r) => r.lighting.sun_elevation_deg,
  },
  {
    label: 'Light Intensity',
    path: '/lighting/intensity',
    min: 0,
    max: 3,
    step: 0.05,
    getter: (r) => r.lighting.intensity,
  },
  {
    label: 'Warmth',
    path: '/lighting/warmth',
    min: 0,
    max: 1,
    step: 0.01,
    getter: (r) => r.lighting.warmth,
  },
  {
    label: 'Fog Density',
    path: '/atmosphere/fog_density',
    min: 0,
    max: 0.2,
    step: 0.001,
    getter: (r) => r.atmosphere.fog_density,
  },
  {
    label: 'Fog Height',
    path: '/atmosphere/fog_height',
    min: 0,
    max: 2000,
    step: 10,
    getter: (r) => r.atmosphere.fog_height,
  },
  {
    label: 'Mist',
    path: '/atmosphere/mist',
    min: 0,
    max: 1,
    step: 0.01,
    getter: (r) => r.atmosphere.mist,
  },
]

function SliderField({
  config,
  value,
  onChange,
}: {
  config: SliderConfig
  value: number
  onChange: (value: number) => void
}) {
  const decimals = config.step < 0.01 ? 3 : config.step < 1 ? 2 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{config.label}</label>
        <span className="text-xs font-mono tabular-nums">
          {value.toFixed(decimals)}
        </span>
      </div>
      <Slider
        min={config.min}
        max={config.max}
        step={config.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

export function EditPanel({ candidate, onClose }: EditPanelProps) {
  const { editMode, setEditMode } = useCandidateStore()
  const recipe = candidate.recipe_json

  const [localValues, setLocalValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const cfg of SLIDER_CONFIGS) {
      init[cfg.path] = cfg.getter(recipe)
    }
    return init
  })

  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(recipe, null, 2)
  )
  const [saving, setSaving] = useState(false)

  const handleSliderChange = useCallback((path: string, value: number) => {
    setLocalValues((prev) => ({ ...prev, [path]: value }))
  }, [])

  const buildPatchOps = useCallback((): JsonPatchOp[] => {
    if (editMode === 'advanced') {
      try {
        const edited = JSON.parse(jsonText)
        return [{ op: 'replace', path: '', value: edited }]
      } catch {
        toast.error('Invalid JSON')
        return []
      }
    }
    const ops: JsonPatchOp[] = []
    for (const cfg of SLIDER_CONFIGS) {
      const original = cfg.getter(recipe)
      const current = localValues[cfg.path]
      if (current !== undefined && Math.abs(current - original) > 0.0001) {
        ops.push({ op: 'replace', path: cfg.path, value: current })
      }
    }
    return ops
  }, [editMode, jsonText, localValues, recipe])

  const handleSave = useCallback(async () => {
    const ops = buildPatchOps()
    if (ops.length === 0) {
      toast.info('No changes to save')
      return
    }
    try {
      setSaving(true)
      await patchRecipe(candidate.recipe_id, ops)
      toast.success('Recipe updated')
      onClose()
    } catch (err) {
      toast.error(
        `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setSaving(false)
    }
  }, [buildPatchOps, candidate.recipe_id, onClose])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">Edit Recipe</h2>
      </div>

      <Tabs
        value={editMode}
        onValueChange={(v) => setEditMode(v as 'simple' | 'advanced')}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="simple" className="flex-1">
              <SlidersHorizontal className="h-3 w-3 mr-1.5" />
              Simple
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">
              <Code2 className="h-3 w-3 mr-1.5" />
              Advanced
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="simple" className="p-4 space-y-5 mt-0">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Camera
              </h3>
              {SLIDER_CONFIGS.filter((c) => c.path.startsWith('/camera')).map(
                (cfg) => (
                  <SliderField
                    key={cfg.path}
                    config={cfg}
                    value={localValues[cfg.path] ?? cfg.getter(recipe)}
                    onChange={(v) => handleSliderChange(cfg.path, v)}
                  />
                )
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Lighting
              </h3>
              {SLIDER_CONFIGS.filter((c) => c.path.startsWith('/lighting')).map(
                (cfg) => (
                  <SliderField
                    key={cfg.path}
                    config={cfg}
                    value={localValues[cfg.path] ?? cfg.getter(recipe)}
                    onChange={(v) => handleSliderChange(cfg.path, v)}
                  />
                )
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Atmosphere
              </h3>
              {SLIDER_CONFIGS.filter((c) =>
                c.path.startsWith('/atmosphere')
              ).map((cfg) => (
                <SliderField
                  key={cfg.path}
                  config={cfg}
                  value={localValues[cfg.path] ?? cfg.getter(recipe)}
                  onChange={(v) => handleSliderChange(cfg.path, v)}
                />
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Assets ({recipe.actors.length})
              </h3>
              <AssetPicker />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="p-4 mt-0">
            <textarea
              className="w-full h-96 font-mono text-xs bg-muted rounded-lg p-3 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </TabsContent>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
