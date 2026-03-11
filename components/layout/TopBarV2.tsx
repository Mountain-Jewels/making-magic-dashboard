/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 TopBar — Logo | Title | Scene Switcher | Save | Undo | Deploy | Settings
 */

'use client'

import { useEffect, useState } from 'react'
import { Gem, Undo2, Send, Settings, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useStudioActionsStore } from '@/lib/stores/studio-actions-store'

export function TopBarV2() {
  const { currentScene, scenes, setCurrentScene } = useSceneStore()
  const { onSave, onUndo } = useStudioActionsStore()
  const [sceneSwitcherOpen, setSceneSwitcherOpen] = useState(false)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL?.replace(/\/$/, '')
        if (!url) { setApiConnected(false); return }
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) })
        setApiConnected(res.ok)
      } catch {
        setApiConnected(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const sceneName = currentScene?.name ?? scenes[0]?.name ?? 'Untitled'

  return (
    <header
      className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#2A2A35]"
      style={{ backgroundColor: '#111118' }}
    >
      {/* Left: Logo + Title + API Status */}
      <div className="flex items-center gap-3">
        <Gem className="h-5 w-5 text-[#D4AF37]" aria-hidden />
        <span className="font-semibold text-white">The Studio</span>
        {apiConnected === null ? null : apiConnected ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400" title="API Connected">
            <Wifi className="h-3 w-3" />
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-400" title="API Offline">
            <WifiOff className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Center: Scene Switcher */}
      <div className="flex-1 flex justify-center min-w-0">
        <DropdownMenu open={sceneSwitcherOpen} onOpenChange={setSceneSwitcherOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 gap-1"
            >
              <span className="truncate max-w-[200px]">Scene: {sceneName}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-[#111118] border-[#2A2A35] z-50 min-w-[200px]">
            {scenes.length === 0 ? (
              <DropdownMenuItem className="text-white/60 italic" disabled>
                No scenes yet
              </DropdownMenuItem>
            ) : (
              scenes.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  className="text-white hover:bg-white/10 focus:bg-white/10"
                  onSelect={() => setCurrentScene(s)}
                >
                  {s.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Save | Undo | Deploy | Settings */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => onSave?.()}
        >
          Save
        </Button>
        <span className="text-[#2A2A35]">|</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => onUndo?.()}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <span className="text-[#2A2A35]">|</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Send className="h-4 w-4 mr-1" />
              Deploy
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111118] border-[#2A2A35]">
            <DropdownMenuItem
              className="text-white hover:bg-white/10 focus:bg-white/10"
              onSelect={() => toast.info('Deploy to Shopify — coming soon')}
            >
              Deploy to Shopify
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white hover:bg-white/10 focus:bg-white/10"
              onSelect={() => toast.info('Export MP4 — coming soon')}
            >
              Export MP4
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white hover:bg-white/10 focus:bg-white/10"
              onSelect={() => toast.info('Export GIF — coming soon')}
            >
              Export GIF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white hover:bg-white/10 focus:bg-white/10"
              onSelect={() => toast.info('Copy Embed Code — coming soon')}
            >
              Copy Embed Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-[#2A2A35]">|</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
