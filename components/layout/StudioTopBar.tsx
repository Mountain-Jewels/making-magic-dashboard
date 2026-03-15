/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Gem,
  Circle,
  Save,
  Undo2,
  Rocket,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { captureStoreState, getStateTimeline } from '@/lib/api/cinematic'

export function StudioTopBar() {
  const { isAuthenticated, userName, logout } = useAuth()
  const [healthy, setHealthy] = useState<boolean | null>(null)
  const router = useRouter()
  const { scene, avatar, dirty } = useSceneStateStore()

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

  async function handleSave() {
    try {
      await captureStoreState(scene || 'default')
      toast.success('Scene state saved')
    } catch {
      toast.error('Save failed')
    }
  }

  async function handleUndo() {
    try {
      const timeline = await getStateTimeline(scene || 'default', 1)
      if (timeline.length > 0) {
        toast.success('Reverted to last saved state')
      } else {
        toast.info('No saved states to revert to')
      }
    } catch {
      toast.error('Undo failed')
    }
  }

  function handleDeploy() {
    router.push('/export')
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-surface-border bg-surface-panel px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Gem className="h-5 w-5 text-gold" />
        <span className="text-sm font-semibold text-white">The Studio</span>
        <span className="text-[10px] text-white/25 uppercase tracking-widest">
          Mountain Jewels
        </span>
        {scene && (
          <span className="ml-2 px-2 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-semibold">
            {scene}
          </span>
        )}
        {avatar && (
          <span className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-[10px]">
            {avatar}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </button>
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
        <button
          onClick={handleDeploy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold/10 text-gold hover:bg-gold/20 rounded transition-colors"
        >
          <Rocket className="h-3.5 w-3.5" />
          Deploy
        </button>
      </div>

      <div className="flex items-center gap-3">
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

        {dirty && (
          <span className="text-[9px] text-gold/60 bg-gold/10 px-1.5 py-0.5 rounded">
            unsaved
          </span>
        )}

        <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
          <Settings className="h-3.5 w-3.5" />
        </button>

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
