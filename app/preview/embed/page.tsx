/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { EmbedCodePanel } from '@/components/preview/EmbedCodePanel'

export default function EmbedCodePage() {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Embed Code Generator</h1>
        <p className="text-sm text-text-muted mb-6">
          Generate platform-ready embed code for video, Mux Player, 3D model, or iFrame.
        </p>
      </div>
      <EmbedCodePanel />
    </div>
  )
}
