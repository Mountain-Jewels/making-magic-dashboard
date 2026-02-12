/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const OUTFITS = [
  { id: '1', label: 'Blazer', category: 'suits' },
  { id: '2', label: 'Summer Dress', category: 'dresses' },
  { id: '3', label: 'Silk Blouse', category: 'tops' },
  { id: '4', label: 'Scarf', category: 'accessories' },
]

export function DressingRoomPanel() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="tops">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tops">Tops</TabsTrigger>
          <TabsTrigger value="dresses">Dresses</TabsTrigger>
          <TabsTrigger value="suits">Suits</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>
        <TabsContent value="tops" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OUTFITS.filter((o) => o.category === 'tops').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                className={cn(
                  'h-20 rounded-lg border-2 transition-colors flex items-center justify-center',
                  selected === item.id
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-brand-gold/40 bg-gray-100 hover:border-brand-gold/60'
                )}
              >
                <span className="text-sm text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="dresses" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OUTFITS.filter((o) => o.category === 'dresses').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                className={cn(
                  'h-20 rounded-lg border-2 transition-colors flex items-center justify-center',
                  selected === item.id
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-brand-gold/40 bg-gray-100'
                )}
              >
                <span className="text-sm text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="suits" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OUTFITS.filter((o) => o.category === 'suits').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                className={cn(
                  'h-20 rounded-lg border-2 transition-colors flex items-center justify-center',
                  selected === item.id
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-brand-gold/40 bg-gray-100'
                )}
              >
                <span className="text-sm text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="accessories" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OUTFITS.filter((o) => o.category === 'accessories').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                className={cn(
                  'h-20 rounded-lg border-2 transition-colors flex items-center justify-center',
                  selected === item.id
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-brand-gold/40 bg-gray-100'
                )}
              >
                <span className="text-sm text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <p className="text-xs text-gray-500 text-center">
        Coming soon — requires avatar rendering engine
      </p>
    </div>
  )
}
