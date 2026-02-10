'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gem, Film, Eye, Library, Download, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const tabs = [
  { href: '/create', label: 'Create', icon: Film },
  { href: '/preview', label: 'Preview', icon: Eye },
  { href: '/library', label: 'Library', icon: Library },
]

export function TopBar() {
  const pathname = usePathname()

  return (
    <header
      className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-surface-border"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-brand-gold" />
          <span className="font-semibold text-text-primary">The Studio</span>
        </div>
        <nav className="flex items-center gap-1">
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
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
          Ready
        </div>
        <DropdownMenu>
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
        <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  )
}
