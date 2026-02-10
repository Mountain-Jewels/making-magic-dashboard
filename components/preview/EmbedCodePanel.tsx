'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type EmbedType = 'video' | 'mux' | 'model_viewer' | 'iframe'

const EMBED_TYPES: { value: EmbedType; label: string }[] = [
  { value: 'video', label: 'Video (<video> tag)' },
  { value: 'mux', label: 'Mux Player' },
  { value: 'model_viewer', label: '3D Model (model-viewer)' },
  { value: 'iframe', label: 'iFrame' },
]

function getCodeForType(type: EmbedType): string {
  switch (type) {
    case 'video':
      return `<video
  autoplay
  muted
  loop
  playsinline
  poster="https://example.com/poster.jpg"
  style="width:100%; border-radius:8px;"
>
  <source src="https://example.com/video.mp4" type="video/mp4">
</video>`
    case 'mux':
      return `<script src="https://cdn.mux.com/player/v2/index.js"></script>
<mux-player
  playback-id="YOUR_PLAYBACK_ID"
  stream-type="on-demand"
  metadata-video-title="My Video"
></mux-player>`
    case 'model_viewer':
      return `<script type="module" src="https://unpkg.com/@google/model-viewer"></script>
<model-viewer
  src="https://example.com/model.glb"
  ios-src="https://example.com/model.usdz"
  alt="3D model"
  auto-rotate
  camera-controls
  style="width:100%; height:400px;"
></model-viewer>`
    case 'iframe':
      return `<iframe
  src="https://example.com/embed/video-id"
  width="560"
  height="315"
  frameborder="0"
  allowfullscreen
></iframe>`
    default:
      return ''
  }
}

function getCdnNote(type: EmbedType): string | null {
  if (type === 'model_viewer')
    return 'Required: <script type="module" src="https://unpkg.com/@google/model-viewer"></script>'
  if (type === 'mux')
    return 'Required: <script src="https://cdn.mux.com/player/v2/index.js"></script>'
  return null
}

export function EmbedCodePanel() {
  const [embedType, setEmbedType] = useState<EmbedType>('video')
  const [copied, setCopied] = useState(false)

  const code = getCodeForType(embedType)
  const cdnNote = getCdnNote(embedType)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Embed type</label>
        <Select value={embedType} onValueChange={(v) => setEmbedType(v as EmbedType)}>
          <SelectTrigger className="w-full max-w-xs bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {EMBED_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-text-primary">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {cdnNote && (
        <div className="rounded-md bg-amber-950/30 border border-amber-500/40 px-3 py-2 text-sm text-amber-200">
          {cdnNote}
        </div>
      )}
      <div className="rounded-lg border border-surface-border bg-surface-panel overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
          <span className="text-xs font-medium text-text-muted">Code preview</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-text-secondary hover:text-text-primary">
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <Highlight theme={themes.nightOwl} code={code} language="html">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre className="p-4 text-sm overflow-x-auto" style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}
