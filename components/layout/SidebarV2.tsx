/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Sidebar — Collapsible icon sidebar (56px → 240px).
 * Icons wire to panels in viewport.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plus,
  Layers,
  User,
  Image,
  Music,
  Gem,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Search,
  Box,
  Monitor,
} from 'lucide-react'
import { useSidebarStore, type SidebarPanelId } from '@/lib/stores/sidebar-store'
import { useAuth } from '@/lib/auth/useAuth'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

const ITEMS: { id: SidebarPanelId; icon: typeof Plus; label: string }[] = [
  { id: 'add', icon: Plus, label: 'Add' },
  { id: 'assets', icon: Layers, label: 'Assets' },
  { id: 'avatar', icon: User, label: 'Avatar' },
  { id: 'background', icon: Image, label: 'BG' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'jewelry', icon: Gem, label: 'Jewelry' },
  { id: 'more', icon: MoreHorizontal, label: 'More' },
]

export function SidebarV2() {
  const { isExpanded, activePanel, toggleExpanded, setExpanded, setActivePanel } = useSidebarStore()
  const isNarrow = useMediaQuery('(max-width: 1023px)')
  const { getRoles } = useAuth()
  const pathname = usePathname()
  const isActiveRoute = pathname === '/system'
  const isAssetsRoute = pathname === '/assets'
  const isOperationsRoute = pathname === '/operations'
  const isScraperRoute = pathname.startsWith('/scraper')

  const [isAdmin, setIsAdmin] = useState(false)
  const [roleResolved, setRoleResolved] = useState(false)

  useEffect(() => {
    if (isNarrow) setExpanded(false)
  }, [isNarrow, setExpanded])

  useEffect(() => {
    let cancelled = false
    void getRoles().then((roles) => {
      if (cancelled) return
      setIsAdmin(roles.includes('admin'))
      setRoleResolved(true)
    })
    return () => {
      cancelled = true
    }
  }, [getRoles])

  return (
    <aside
      className={cn(
        'flex-shrink-0 flex flex-col border-r border-[#2A2A35] transition-[width] duration-200',
        isExpanded ? 'w-60' : 'w-14'
      )}
      style={{ backgroundColor: '#111118' }}
    >
      {/* Toggle */}
      <div className="flex items-center justify-between h-12 px-2 border-b border-[#2A2A35] shrink-0">
        <button
          type="button"
          onClick={toggleExpanded}
          className="p-2 rounded text-white/70 hover:text-white hover:bg-white/10"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </button>
        {isExpanded && (
          <span className="text-xs text-white/60 truncate">Tools</span>
        )}
      </div>

      {/* Icons */}
      <div className="flex flex-col items-center py-4 gap-2">
        {ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActivePanel(isActive ? null : id)}
              className={cn(
                'flex items-center gap-3 w-full rounded transition-colors',
                isExpanded ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
                isActive
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              aria-label={label}
              aria-pressed={isActive}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          )
        })}
        <div className="w-full">
          <Link
            href="/scraper"
            className={cn(
              'w-full flex items-center gap-3 rounded transition-colors',
              isExpanded ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
              isScraperRoute
                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
            aria-label="Scraper"
          >
            <Search className="h-5 w-5 shrink-0" />
            {isExpanded && (
              <span className="text-sm truncate">Scraper</span>
            )}
          </Link>
        </div>
        {roleResolved && isAdmin && (
          <div className="w-full">
            <Link
              href="/system"
              className={cn(
                'w-full flex items-center gap-3 rounded transition-colors',
                isExpanded ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
                isActiveRoute
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              aria-label="System"
            >
              <Shield className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm truncate">System</span>
              )}
            </Link>
          </div>
        )}
        {roleResolved && isAdmin && (
          <div className="w-full">
            <Link
              href="/operations"
              className={cn(
                'w-full flex items-center gap-3 rounded transition-colors',
                isExpanded ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
                isOperationsRoute
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              aria-label="Operations"
            >
              <Monitor className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm truncate">Operations</span>
              )}
            </Link>
          </div>
        )}
        {roleResolved && isAdmin && process.env.NEXT_PUBLIC_FEATURE_ASSETS_TAB !== 'false' && (
          <div className="w-full">
            <Link
              href="/assets"
              className={cn(
                'w-full flex items-center gap-3 rounded transition-colors',
                isExpanded ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
                isAssetsRoute
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              aria-label="Assets"
            >
              <Box className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm truncate">Assets</span>
              )}
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
