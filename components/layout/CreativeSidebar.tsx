/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import {
  User,
  Mountain,
  Paintbrush,
  FolderOpen,
  Music,
  Gem,
  Plus,
  MoreHorizontal,
} from 'lucide-react'
import { useStudioStore, type CreativeTool } from '@/lib/stores/studio-store'

interface ToolEntry {
  id: CreativeTool
  label: string
  icon: React.ElementType
}

const TOOLS: ToolEntry[] = [
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'scene', label: 'Scene', icon: Mountain },
  { id: 'content', label: 'Content', icon: Paintbrush },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'jewelry', label: 'Jewelry', icon: Gem },
]

export function CreativeSidebar() {
  const { activeTool, setActiveTool, sidebarExpanded, setSidebarExpanded } =
    useStudioStore()

  return (
    <aside
      className={`flex flex-col border-r border-surface-border bg-surface-panel transition-all duration-200 shrink-0 ${
        sidebarExpanded ? 'w-[200px]' : 'w-[52px]'
      }`}
    >
      {/* Add button */}
      <button
        className="flex items-center justify-center h-11 border-b border-surface-border text-gold hover:bg-gold/5 transition-colors"
        title="Add asset"
      >
        <Plus className="h-4 w-4" />
        {sidebarExpanded && (
          <span className="ml-2 text-xs font-medium">Add New</span>
        )}
      </button>

      {/* Tool icons */}
      <nav className="flex-1 py-2 px-1.5 space-y-1">
        {TOOLS.map((tool) => {
          const active = activeTool === tool.id
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center w-full rounded-md px-2 py-2 transition-colors ${
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              title={!sidebarExpanded ? tool.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarExpanded && (
                <span className="ml-2.5 text-xs font-medium">{tool.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Expand toggle */}
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="flex items-center justify-center h-10 border-t border-surface-border text-white/30 hover:text-white/60 transition-colors"
        title={sidebarExpanded ? 'Collapse' : 'Expand'}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </aside>
  )
}
