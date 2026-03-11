/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import type { ToolId } from './CreativeToolBar'
import { GeneratePanel } from './panels/GeneratePanel'
import { UploadPanel } from './panels/UploadPanel'
import { BackgroundPicker } from './panels/BackgroundPicker'
import { LightingPanel } from './panels/LightingPanel'
import { AvatarGallery } from './panels/AvatarGallery'
import { MusicBrowser } from './panels/MusicBrowser'
import { JewelryPanel } from './panels/JewelryPanel'
import { DressingRoomPanel } from './panels/DressingRoomPanel'
import { HairMakeupPanel } from './panels/HairMakeupPanel'
import { DecorationsPanel } from './panels/DecorationsPanel'

interface ToolPanelProps {
  activeTool: ToolId | null
  wizardCompleted: boolean
}

const PANEL_MAP: Partial<Record<ToolId, React.ReactNode>> = {
  generate: <GeneratePanel />,
  upload: <UploadPanel />,
  backgrounds: <BackgroundPicker />,
  lighting: <LightingPanel />,
  avatars: <AvatarGallery />,
  music: <MusicBrowser />,
  jewelry: <JewelryPanel />,
  dressing: <DressingRoomPanel />,
  hair: <HairMakeupPanel />,
  decorations: <DecorationsPanel />,
}

export function ToolPanel({ activeTool, wizardCompleted }: ToolPanelProps) {
  const effectiveTool = activeTool ?? 'generate'
  const panel = PANEL_MAP[effectiveTool]

  if (!wizardCompleted) {
    return <div className="flex-1 min-h-0" />
  }

  if (!activeTool) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <p className="text-base text-gray-500">Select assets</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      {panel ?? (
        <div className="p-4">
          <p className="text-sm text-gray-500">Tool panel: {effectiveTool}</p>
        </div>
      )}
    </ScrollArea>
  )
}
