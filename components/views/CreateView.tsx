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
  const Component = TOOL_MAP[activeTool] || AvatarStudio

  return <Component />
}
