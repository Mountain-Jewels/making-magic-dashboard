'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetafieldMapper } from './MetafieldMapper'

const VIDEO_LIQUID = `{% if product.metafields.mountain_jewels.video_url %}
  <video
    autoplay muted loop playsinline
    poster="{{ product.metafields.mountain_jewels.poster_url }}"
    style="width:100%; border-radius:8px;">
    <source src="{{ product.metafields.mountain_jewels.video_url }}" type="video/mp4">
  </video>
{% endif %}`

const MODEL_VIEWER_LIQUID = `{% if product.metafields.mountain_jewels.model_url %}
  <model-viewer
    src="{{ product.metafields.mountain_jewels.model_url }}"
    ios-src="{{ product.metafields.mountain_jewels.model_usdz_url }}"
    alt="{{ product.title }}"
    auto-rotate camera-controls
    style="width:100%; height:400px;">
  </model-viewer>
{% endif %}`

const METAFIELDS_VIDEO = [
  { namespace: 'mountain_jewels', key: 'video_url', type: 'url', description: 'MP4 video URL' },
  { namespace: 'mountain_jewels', key: 'poster_url', type: 'url', description: 'Poster/thumbnail URL' },
]
const METAFIELDS_3D = [
  { namespace: 'mountain_jewels', key: 'model_url', type: 'url', description: 'GLB model URL' },
  { namespace: 'mountain_jewels', key: 'model_usdz_url', type: 'url', description: 'USDZ model URL (Apple AR)' },
]

type LiquidMode = 'video' | '3d' | 'both'

export function LiquidCodePanel() {
  const [mode, setMode] = useState<LiquidMode>('video')
  const [copied, setCopied] = useState(false)

  const renderCodeBlock = (codeText: string) => (
    <div className="rounded-lg border border-surface-border bg-surface-panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
        <span className="text-xs font-medium text-text-muted">Liquid snippet</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(codeText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="text-text-secondary hover:text-text-primary"
        >
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <Highlight theme={themes.nightOwl} code={codeText} language="markup">
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 text-sm overflow-x-auto max-h-64 overflow-y-auto" style={style}>
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
  )

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as LiquidMode)}>
        <TabsList className="bg-surface-elevated border border-surface-border">
          <TabsTrigger value="video" className="data-[state=active]:bg-brand-gold/20 data-[state=active]:text-brand-gold">Video Liquid</TabsTrigger>
          <TabsTrigger value="3d" className="data-[state=active]:bg-brand-gold/20 data-[state=active]:text-brand-gold">3D Model Liquid</TabsTrigger>
          <TabsTrigger value="both" className="data-[state=active]:bg-brand-gold/20 data-[state=active]:text-brand-gold">Both</TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="mt-3">
          {renderCodeBlock(VIDEO_LIQUID)}
          <MetafieldMapper metafields={METAFIELDS_VIDEO} />
        </TabsContent>
        <TabsContent value="3d" className="mt-3">
          {renderCodeBlock(MODEL_VIEWER_LIQUID)}
          <MetafieldMapper metafields={METAFIELDS_3D} />
        </TabsContent>
        <TabsContent value="both" className="mt-3">
          {renderCodeBlock(`${VIDEO_LIQUID}\n\n${MODEL_VIEWER_LIQUID}`)}
          <MetafieldMapper metafields={[...METAFIELDS_VIDEO, ...METAFIELDS_3D]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
