'use client'

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

export function ToolBar() {
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
  const previewIcons = [
    { icon: Play, label: 'Video' },
    { icon: ListMusic, label: 'Playlist' },
    { icon: ShoppingBag, label: 'Shopify' },
    { icon: Mail, label: 'Email' },
    { icon: Share2, label: 'Social' },
    { icon: Code, label: 'Embed' },
  ]
  const libraryIcons = [
    { icon: Grid3X3, label: 'Grid View' },
    { icon: List, label: 'List View' },
    { icon: Filter, label: 'Filter' },
    { icon: Search, label: 'Search' },
  ]

  let icons: { icon: typeof SlidersHorizontal; label: string }[] = createIcons
  let actions: { icon: typeof Plus; label: string }[] | null = createActions
  if (isPreview) {
    icons = previewIcons
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
        {icons.map(({ icon: Icon, label }) => (
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
