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
  Mountain,
  Users,
  Shirt,
  MessageCircle,
  UserCircle,
  Server,
  Radio,
  Film,
  Calendar,
  Sun,
  Clapperboard,
  Gem,
  Upload,
  Wand2,
  FolderOpen,
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
      { label: 'System', href: '/system', icon: Activity },
    ],
  },
  {
    title: 'Production',
    items: [
      { label: 'Scenes', href: '/scenes', icon: Mountain },
      { label: 'Avatars', href: '/avatars', icon: Users },
      { label: 'Fashion', href: '/fashion', icon: Shirt },
      { label: 'Concierge', href: '/concierge', icon: MessageCircle },
      { label: 'Customers', href: '/customers', icon: UserCircle },
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
    ],
  },
  {
    title: 'Studio',
    items: [
      { label: 'Generate', href: '/generate', icon: Wand2 },
      { label: 'Assets', href: '/assets', icon: FolderOpen },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col border-r border-surface-border bg-surface-panel transition-all duration-200 ${
        collapsed ? 'w-[56px]' : 'w-[220px]'
      }`}
    >
      <div className="flex h-14 items-center justify-between px-3 border-b border-surface-border">
        {!collapsed && (
          <span className="text-sm font-semibold text-gold tracking-wide">
            MJ Studio
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-white/5 text-white/50 hover:text-white/80"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {NAV.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? 'bg-gold/10 text-gold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
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
