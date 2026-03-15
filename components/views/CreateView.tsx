/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useStudioStore } from '@/lib/stores/studio-store'
import { AvatarStudio } from '@/components/studio/AvatarStudio'
import { SceneBuilder } from '@/components/studio/SceneBuilder'
import { ContentCreator } from '@/components/studio/ContentCreator'
import { AssetBrowser } from '@/components/studio/AssetBrowser'
import { MusicBrowser } from '@/components/studio/MusicBrowser'
import { JewelryDesigner } from '@/components/studio/JewelryDesigner'
import { LiveViewport } from '@/components/studio/LiveViewport'

const TOOL_MAP: Record<string, React.ComponentType> = {
  avatar: AvatarStudio,
  scene: SceneBuilder,
  content: ContentCreator,
  assets: AssetBrowser,
  music: MusicBrowser,
  jewelry: JewelryDesigner,
}

export function CreateView() {
  const { activeTool } = useStudioStore()
  const ToolComponent = TOOL_MAP[activeTool] || AvatarStudio

  return (
    <div className="h-full flex min-h-0">
      {/* Tool panel — left side, scrollable */}
      <div className="w-[380px] shrink-0 border-r border-surface-border overflow-y-auto bg-surface-panel">
        <ToolComponent />
      </div>

      {/* Live viewport — center, fills remaining space */}
      <div className="flex-1 min-w-0 p-1">
        <LiveViewport />
      </div>
    </div>
  )
}
