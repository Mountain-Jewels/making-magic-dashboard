/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import {
  Gem,
  Circle,
  Save,
  Undo2,
  Rocket,
  Settings,
  LayoutGrid,
  LogOut,
} from 'lucide-react'
import { useModeStore } from '@/lib/stores/mode-store'
import { useAuth } from '@/lib/auth/useAuth'

export function StudioTopBar() {
  const { mode, setMode, studioView } = useModeStore()
  const { isAuthenticated, userName, logout } = useAuth()
  const [healthy, setHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL
    if (!url) return
    const check = () =>
      fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) })
        .then((r) => setHealthy(r.ok))
        .catch(() => setHealthy(false))
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [])

  const viewLabel =
    studioView === 'create'
      ? 'Create'
      : studioView === 'stage'
        ? 'Stage'
        : studioView === 'approve'
          ? 'Approve'
          : 'Deploy'

  return (
    <header className="flex h-12 items-center justify-between border-b border-surface-border bg-surface-panel px-4 shrink-0">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <Gem className="h-5 w-5 text-gold" />
        <span className="text-sm font-semibold text-white">The Studio</span>
        <span className="text-[10px] text-white/25 uppercase tracking-widest">
          Mountain Jewels
        </span>
        {mode === 'studio' && (
          <span className="ml-2 px-2 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-semibold uppercase tracking-wide">
            {viewLabel}
          </span>
        )}
      </div>

      {/* Center: Actions (studio mode) */}
      {mode === 'studio' && (
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors">
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors">
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors">
            <Rocket className="h-3.5 w-3.5" />
            Deploy
          </button>
        </div>
      )}

      {/* Right: Mode switch, health, user */}
      <div className="flex items-center gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center bg-surface rounded-md border border-surface-border overflow-hidden">
          <button
            onClick={() => setMode('studio')}
            className={`px-3 py-1 text-[11px] font-medium transition-colors ${
              mode === 'studio'
                ? 'bg-gold/15 text-gold'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setMode('command')}
            className={`px-3 py-1 text-[11px] font-medium transition-colors ${
              mode === 'command'
                ? 'bg-gold/15 text-gold'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Command
          </button>
        </div>

        {/* API Health */}
        <div
          className="flex items-center gap-1.5"
          title={
            healthy === null
              ? 'Checking...'
              : healthy
                ? 'API healthy'
                : 'API unreachable'
          }
        >
          <Circle
            className={`h-2 w-2 ${
              healthy === null
                ? 'text-white/30 fill-white/30'
                : healthy
                  ? 'text-success fill-success'
                  : 'text-error fill-error'
            }`}
          />
          <span className="text-[10px] text-white/40">API</span>
        </div>

        {/* Settings */}
        <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* User */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50">{userName}</span>
            <button
              onClick={logout}
              className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70"
              title="Sign out"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
