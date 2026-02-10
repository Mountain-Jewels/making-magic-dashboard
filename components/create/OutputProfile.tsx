'use client'

import { useOutputStore } from '@/lib/stores/output-store'
import type { OutputFormat, ResolutionPreset, DurationPreset } from '@/lib/types/output'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Image, Video, Box } from 'lucide-react'

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'still_image', label: 'Still Image' },
  { value: '2d_video', label: '2D Video' },
  { value: '3d_video', label: '3D Video' },
  { value: '3d_interactive', label: '3D Interactive' },
]

const RESOLUTIONS: { value: ResolutionPreset; label: string }[] = [
  { value: 'web_standard', label: 'Web Standard (1920×1080)' },
  { value: '4k', label: '4K (3840×2160)' },
  { value: 'square', label: 'Square (1080×1080)' },
  { value: 'portrait', label: 'Portrait (1080×1920)' },
  { value: 'shopify_pdp', label: 'Shopify PDP (1200×1200)' },
  { value: 'email_header', label: 'Email Header (600×300)' },
  { value: 'custom', label: 'Custom' },
]

const DURATIONS: { value: DurationPreset; label: string }[] = [
  { value: 'quick_15s', label: 'Quick (15s)' },
  { value: 'standard_30s', label: 'Standard (30s)' },
  { value: 'extended_60s', label: 'Extended (60s)' },
  { value: 'full_90s', label: 'Full (90s)' },
  { value: 'long_form', label: 'Long-form (3–10 min)' },
  { value: 'custom', label: 'Custom' },
]

export function OutputProfile() {
  const { profile, setFormat, setResolution, setDurationPreset, setProfile } = useOutputStore()
  const isVideoOrAudio =
    profile.format === '2d_video' || profile.format === '3d_video'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-text-secondary text-xs">Output format</label>
        <Select
          value={profile.format}
          onValueChange={(v) => setFormat(v as OutputFormat)}
        >
          <SelectTrigger className="mt-1.5 bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value} className="text-text-primary">
                {f.value.startsWith('3d') ? (
                  <span className="flex items-center gap-2">
                    <Box className="h-3.5 w-3.5" />
                    {f.label}
                  </span>
                ) : f.value === 'still_image' ? (
                  <span className="flex items-center gap-2">
                    <Image className="h-3.5 w-3.5" />
                    {f.label}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Video className="h-3.5 w-3.5" />
                    {f.label}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-text-secondary text-xs">Resolution</label>
        <Select
          value={profile.resolution}
          onValueChange={(v) => setResolution(v as ResolutionPreset)}
        >
          <SelectTrigger className="mt-1.5 bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {RESOLUTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value} className="text-text-primary">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isVideoOrAudio && (
        <>
          <div>
            <label className="block text-text-secondary text-xs">Duration preset</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDurationPreset(d.value)}
                  className={`px-2 py-1 rounded text-xs border transition-colors ${
                    profile.duration_preset === d.value
                      ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                      : 'border-surface-border bg-surface-panel text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {profile.duration_preset === 'custom' && (
            <div>
              <label className="block text-text-secondary text-xs">
                Custom duration (seconds)
              </label>
              <Slider
                className="mt-1.5"
                value={[profile.custom_duration_seconds ?? 30]}
                onValueChange={([v]) =>
                  setProfile({ custom_duration_seconds: v })
                }
                min={1}
                max={600}
                step={1}
              />
              <p className="text-xs text-text-muted mt-0.5">
                {profile.custom_duration_seconds ?? 30}s
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
