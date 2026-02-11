'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gem, Film, Eye, Library, Download, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STUDIO_OPEN_EXPORT } from './KeyboardShortcuts'

const tabs = [
  { href: '/create', label: 'Create', icon: Film },
  { href: '/preview', label: 'Preview', icon: Eye },
  { href: '/library', label: 'Library', icon: Library },
]

export function TopBar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const pathname = usePathname()
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    const handler = () => setExportOpen(true)
    window.addEventListener(STUDIO_OPEN_EXPORT, handler)
    return () => window.removeEventListener(STUDIO_OPEN_EXPORT, handler)
  }, [])

  return (
    <header
      className="h-12 flex-shrink-0 flex items-center justify-between px-3 sm:px-4 border-b border-surface-border gap-2"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="flex items-center gap-2 sm:gap-6 min-w-0">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 text-text-secondary hover:text-text-primary"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-brand-gold" />
          <span className="font-semibold text-text-primary">The Studio</span>
          <span className="text-xs font-mono text-text-muted">v3.0</span>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/create' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-gold/20 text-brand-gold'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {!pathname.startsWith('/create') && (
          <>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              ● Online
            </div>
            <DropdownMenu open={exportOpen} onOpenChange={setExportOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-brand-gold text-brand-gold hover:bg-brand-gold/10">
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px] bg-surface-panel border-surface-border">
            <DropdownMenuItem>JSON</DropdownMenuItem>
            <DropdownMenuItem>Image</DropdownMenuItem>
            <DropdownMenuItem>Video</DropdownMenuItem>
            <DropdownMenuItem>Audio</DropdownMenuItem>
            <DropdownMenuItem>Bundle</DropdownMenuItem>
          </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  )
}
