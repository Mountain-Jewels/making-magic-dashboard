/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Unified Jewelry panel — tabs between Shopify catalog (Gallery)
 * and the Parametric Product Configurator.
 */

'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { JewelryGallery } from './JewelryGallery'
import { ProductConfigurator } from './ProductConfigurator'

export function JewelryPanel() {
  return (
    <div className="space-y-3">
      <Tabs defaultValue="configurator" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-[#1A1A24] h-8">
          <TabsTrigger
            value="configurator"
            className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]"
          >
            Configure
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]"
          >
            Catalog
          </TabsTrigger>
        </TabsList>
        <TabsContent value="configurator">
          <ProductConfigurator />
        </TabsContent>
        <TabsContent value="catalog">
          <JewelryGallery />
        </TabsContent>
      </Tabs>
    </div>
  )
}
