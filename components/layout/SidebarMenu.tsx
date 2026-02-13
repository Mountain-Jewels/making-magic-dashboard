/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Film, Image, User, Gem, Music, Share2, Calendar, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductionTypeSection } from '@/components/sidebar/ProductionTypeSection'
import { BackgroundSection } from '@/components/sidebar/BackgroundSection'
import { AvatarSection } from '@/components/sidebar/AvatarSection'
import { JewelrySection } from '@/components/sidebar/JewelrySection'
import { MusicSection } from '@/components/sidebar/MusicSection'
import { DestinationSection } from '@/components/sidebar/DestinationSection'
import { EventsSection } from '@/components/sidebar/EventsSection'
import { AssetsSection } from '@/components/sidebar/AssetsSection'

const MENU_SECTIONS = [
  { id: 'production_type', label: 'Production Type', icon: Film },
  { id: 'background', label: 'Background', icon: Image },
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'jewelry', label: 'Jewelry', icon: Gem },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'destination', label: 'Destination', icon: Share2 },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
] as const

type SectionId = (typeof MENU_SECTIONS)[number]['id']

export function SidebarMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState<SectionId | null>(null)

  const [productionType, setProductionType] = useState<string | null>(null)
  const [background, setBackground] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [jewelryProduct, setJewelryProduct] = useState('Tennis Necklace')
  const [jewelryColor, setJewelryColor] = useState('Y')
  const [jewelryCarat, setJewelryCarat] = useState('')
  const [jewelryShape, setJewelryShape] = useState('Br')
  const [music, setMusic] = useState<string | null>(null)
  const [destination, setDestination] = useState<string | null>(null)
  const [destinationSub, setDestinationSub] = useState<string | null>(null)
  const [events, setEvents] = useState<string | null>(null)
  const [assetsTab, setAssetsTab] = useState('backgrounds')

  const toggle = (id: SectionId) => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r border-surface-border overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {MENU_SECTIONS.map((section) => {
          const isExpanded = expanded === section.id
          const Icon = section.icon
          return (
            <div key={section.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isExpanded ? 'bg-brand-gold/15 text-brand-gold' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="mt-1 ml-2 pl-4 border-l border-surface-border">
                  {section.id === 'production_type' && (
                    <ProductionTypeSection selected={productionType} onSelect={setProductionType} />
                  )}
                  {section.id === 'background' && (
                    <BackgroundSection
                      selected={background}
                      onSelect={setBackground}
                      onGenerateNew={() => {}}
                    />
                  )}
                  {section.id === 'avatar' && (
                    <AvatarSection
                      selected={avatar}
                      onSelect={setAvatar}
                      onGenerateNew={() => {}}
                    />
                  )}
                  {section.id === 'jewelry' && (
                    <JewelrySection
                      product={jewelryProduct}
                      color={jewelryColor}
                      carat={jewelryCarat}
                      shape={jewelryShape}
                      onProductChange={setJewelryProduct}
                      onColorChange={setJewelryColor}
                      onCaratChange={setJewelryCarat}
                      onShapeChange={setJewelryShape}
                    />
                  )}
                  {section.id === 'music' && (
                    <MusicSection selected={music} onSelect={setMusic} />
                  )}
                  {section.id === 'destination' && (
                    <DestinationSection
                      selected={destination}
                      selectedSub={destinationSub}
                      onSelect={(id) => { setDestination(id); setDestinationSub(null); }}
                      onSubSelect={setDestinationSub}
                    />
                  )}
                  {section.id === 'events' && (
                    <EventsSection selected={events} onSelect={setEvents} />
                  )}
                  {section.id === 'assets' && (
                    <AssetsSection activeTab={assetsTab} onTabChange={setAssetsTab} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
