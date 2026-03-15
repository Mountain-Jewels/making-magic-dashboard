/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  Bot,
  Activity,
  Server,
  Radio,
  Film,
  Calendar,
  Sun,
  Clapperboard,
  Gem,
  Upload,
  FolderOpen,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    title: 'Intelligence',
    items: [
      { label: 'Director', href: '/director', icon: Brain },
      { label: 'Agents', href: '/agents', icon: Bot },
      { label: 'Concierge', href: '/concierge', icon: MessageCircle },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { label: 'VMs', href: '/vms', icon: Server },
      { label: 'Streaming', href: '/streaming', icon: Radio },
      { label: 'Renders', href: '/renders', icon: Film },
      { label: 'Scheduling', href: '/scheduling', icon: Calendar },
      { label: 'Lighting', href: '/lighting', icon: Sun },
      { label: 'Cinematic', href: '/cinematic', icon: Clapperboard },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Products', href: '/products', icon: Gem },
      { label: 'Export', href: '/export', icon: Upload },
      { label: 'Assets', href: '/assets', icon: FolderOpen },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'System', href: '/system', icon: Activity },
    ],
  },
]

export function CommandSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col border-r border-surface-border bg-surface-panel transition-all duration-200 shrink-0 ${
        collapsed ? 'w-[52px]' : 'w-[200px]'
      }`}
    >
      <div className="flex h-10 items-center justify-between px-3 border-b border-surface-border">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Command Center
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3">
        {NAV.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-white/20">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors ${
                      active
                        ? 'bg-gold/10 text-gold'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
