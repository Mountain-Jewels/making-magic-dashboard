/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Panel content shown in viewport when sidebar icon is active.
 */

'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { UploadPanel } from '@/components/create/panels/UploadPanel'
import { AvatarGallery } from '@/components/create/panels/AvatarGallery'
import { BackgroundPicker } from '@/components/create/panels/BackgroundPicker'
import { MusicBrowser } from '@/components/create/panels/MusicBrowser'
import { JewelryGallery } from '@/components/create/panels/JewelryGallery'

const PANEL_MAP: Record<string, React.ReactNode> = {
  assets: <UploadPanel />,
  avatar: <AvatarGallery />,
  background: <BackgroundPicker />,
  music: <MusicBrowser />,
  jewelry: <JewelryGallery />,
}

export function SidebarPanel() {
  const { activePanel } = useSidebarStore()
  const panel = activePanel ? PANEL_MAP[activePanel] : null

  if (!panel) return null

  return (
    <div
      className="w-[280px] flex-shrink-0 flex flex-col border-r border-[#2A2A35] overflow-hidden"
      style={{ backgroundColor: '#111118' }}
    >
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">{panel}</div>
      </ScrollArea>
    </div>
  )
}
