/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import Link from 'next/link'
import { Play, ListMusic, ShoppingBag, Mail, Share2, Code } from 'lucide-react'

const PREVIEW_MODES = [
  { href: '/preview/video', label: 'Video Preview', description: 'Mux player, side-by-side comparison', icon: Play },
  { href: '/preview/playlist', label: 'Playlist Manager', description: 'Browse, play, edit playlists', icon: ListMusic },
  { href: '/preview/shopify', label: 'Shopify PDP Preview', description: 'Mock product page + Liquid code', icon: ShoppingBag },
  { href: '/preview/email', label: 'Email Preview', description: 'Moment type templates, mobile/desktop', icon: Mail },
  { href: '/preview/social', label: 'Social Export', description: 'Multi-platform export with compliance', icon: Share2 },
  { href: '/preview/embed', label: 'Embed Code', description: 'Video, 3D, iFrame code generator', icon: Code },
]

export default function PreviewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-gold mb-2">PREVIEW</h1>
      <p className="text-text-muted mb-8">Review content before publishing</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PREVIEW_MODES.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-surface-panel border border-surface-border rounded-lg p-6 hover:border-brand-gold/50 transition-colors group"
          >
            <Icon className="h-6 w-6 text-text-muted group-hover:text-brand-gold mb-2" />
            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-brand-gold transition-colors">{label}</h3>
            <p className="text-sm text-text-muted">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
