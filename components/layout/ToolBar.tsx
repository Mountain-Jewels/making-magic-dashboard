/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  Clapperboard,
  UserCircle,
  Music,
  Box,
  Plus,
  Copy,
  Trash2,
  Play,
  ListMusic,
  ShoppingBag,
  Mail,
  Share2,
  Code,
  Grid3X3,
  List,
  Filter,
  Search,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

const PREVIEW_ROUTES: { href: string; icon: typeof Play; label: string }[] = [
  { href: '/preview/video', icon: Play, label: 'Video' },
  { href: '/preview/playlist', icon: ListMusic, label: 'Playlist' },
  { href: '/preview/shopify', icon: ShoppingBag, label: 'Shopify' },
  { href: '/preview/email', icon: Mail, label: 'Email' },
  { href: '/preview/social', icon: Share2, label: 'Social' },
  { href: '/preview/embed', icon: Code, label: 'Embed' },
]

export function ToolBar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const isCreate = pathname.startsWith('/create')
  const isPreview = pathname.startsWith('/preview')
  const isLibrary = pathname.startsWith('/library')

  const createIcons = [
    { icon: SlidersHorizontal, label: 'Output' },
    { icon: Clapperboard, label: 'Scene' },
    { icon: UserCircle, label: 'Avatar' },
    { icon: Music, label: 'Singing' },
    { icon: Box, label: '3D' },
  ]
  const createActions = [
    { icon: Plus, label: 'New Asset' },
    { icon: Copy, label: 'Duplicate' },
    { icon: Trash2, label: 'Delete' },
  ]
  const libraryIcons = [
    { icon: Grid3X3, label: 'Grid View' },
    { icon: List, label: 'List View' },
    { icon: Filter, label: 'Filter' },
    { icon: Search, label: 'Search' },
  ]

  let icons: { icon: typeof SlidersHorizontal; label: string }[] = createIcons
  let actions: { icon: typeof Plus; label: string }[] | null = createActions
  let previewNav: typeof PREVIEW_ROUTES | null = null
  if (isPreview) {
    previewNav = PREVIEW_ROUTES
    actions = null
  } else if (isLibrary) {
    icons = libraryIcons
    actions = null
  }

  return (
    <aside
      className="w-14 flex-shrink-0 flex flex-col items-center py-3 gap-1 border-r border-surface-border"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <TooltipProvider delayDuration={300}>
        {previewNav ? (
          previewNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/preview' && pathname.startsWith(href))
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
                      isActive ? 'bg-brand-gold/20 text-brand-gold' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-surface-panel border-surface-border">
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })
        ) : (
          icons.map(({ icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center h-9 w-9 rounded-md text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface-panel border-surface-border">
                {label}
              </TooltipContent>
            </Tooltip>
          ))
        )}
        {actions && (
          <>
            <Separator className="my-2 w-8 bg-surface-border" />
            {actions.map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center h-9 w-9 rounded-md text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-surface-panel border-surface-border">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </>
        )}
      </TooltipProvider>
    </aside>
  )
}
