/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import { Gem, Circle, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'

export function TopBar() {
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

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface-panel px-4">
      <div className="flex items-center gap-3">
        <Gem className="h-5 w-5 text-gold" />
        <span className="text-sm font-semibold text-white">
          The Studio
        </span>
        <span className="text-xs text-white/30">Mountain Jewels</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title={healthy === null ? 'Checking...' : healthy ? 'API healthy' : 'API unreachable'}>
          <Circle
            className={`h-2.5 w-2.5 ${
              healthy === null
                ? 'text-white/30 fill-white/30'
                : healthy
                ? 'text-success fill-success'
                : 'text-error fill-error'
            }`}
          />
          <span className="text-xs text-white/50">API</span>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{userName}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/70"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
