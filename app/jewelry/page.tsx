/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Gem,
  Diamond,
  Loader2,
  Ruler,
  Calculator,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Link2,
} from 'lucide-react'
import {
  getCategories,
  getShapes,
  getMetals,
  configureProduct,
  getDiamondSize,
} from '@/lib/api/products'
import type {
  ProductCategory,
  MetalOption,
  ConfigureResult,
  ConfigureRequest,
} from '@/lib/api/products'
import { DIAMOND_SIZE_TABLE } from '@/lib/types/guardrails'
import { LiveViewport } from '@/components/studio/LiveViewport'
import { addJewelry } from '@/lib/api/scene-control'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

const PRODUCT_TYPES = [
  { id: 'bracelet', label: 'Bracelet', icon: '💎' },
  { id: 'necklace', label: 'Necklace', icon: '📿' },
  { id: 'earrings', label: 'Earrings', icon: '✨' },
  { id: 'ring', label: 'Ring', icon: '💍' },
  { id: 'pendant', label: 'Pendant', icon: '🔮' },
]

export default function JewelryPage() {
  const sceneStore = useSceneStateStore()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [shapes, setShapes] = useState<string[]>([])
  const [metals, setMetals] = useState<MetalOption[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedType, setSelectedType] = useState('bracelet')
  const [shape, setShape] = useState('round')
  const [metal, setMetal] = useState('14k_yellow_gold')
  const [totalCarat, setTotalCarat] = useState(15)
  const [stoneCount, setStoneCount] = useState(31)
  const [lengthInches, setLengthInches] = useState(7)
  const [ringSize, setRingSize] = useState(7)

  const [configResult, setConfigResult] = useState<ConfigureResult | null>(null)
  const [configuring, setConfiguring] = useState(false)

  const [shopifySku, setShopifySku] = useState('')
  const [shopifyUrl, setShopifyUrl] = useState('')
  const [shopifyLinked, setShopifyLinked] = useState(false)

  useEffect(() => {
    Promise.all([
      getCategories().catch(() => []),
      getShapes().catch(() => ['round', 'oval', 'pear', 'emerald', 'cushion', 'princess', 'marquise', 'radiant']),
      getMetals().catch(() => []),
    ]).then(([cats, sh, met]) => {
      setCategories(cats)
      if (sh.length > 0) setShapes(sh)
      setMetals(met)
      setLoading(false)
    })
  }, [])

  const perStoneCarat = useMemo(() => {
    if (stoneCount <= 0) return 0
    return totalCarat / stoneCount
  }, [totalCarat, stoneCount])

  const diamondRef = useMemo(() => {
    const closest = DIAMOND_SIZE_TABLE
      .filter((e) => e.shape === shape)
      .sort((a, b) => Math.abs(a.carat - perStoneCarat) - Math.abs(b.carat - perStoneCarat))[0]
    return closest ?? null
  }, [shape, perStoneCarat])

  const handleConfigure = useCallback(async () => {
    setConfiguring(true)
    try {
      const req: ConfigureRequest = {
        category: selectedType,
        total_carat: totalCarat,
        shape,
        metal,
        ...(selectedType === 'ring' ? { ring_size: ringSize } : {}),
        ...(['bracelet', 'necklace'].includes(selectedType) ? { length_inches: lengthInches } : {}),
      }
      const result = await configureProduct(req)
      setConfigResult(result)
      toast.success('Product configured')
    } catch {
      toast.error('Configuration failed')
    } finally {
      setConfiguring(false)
    }
  }, [selectedType, totalCarat, shape, metal, ringSize, lengthInches])

  async function handleAddToScene() {
    if (!configResult) return
    try {
      await addJewelry(selectedType)
      sceneStore.addJewelry(selectedType)
      toast.success('Jewelry added to scene')
    } catch { toast.error('Failed to add jewelry') }
  }

  return (
    <div className="flex h-full min-h-0">
      {/* LEFT — Product categories */}
      <div className="w-[240px] shrink-0 border-r border-surface-border overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-gold" />
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Products</h2>
        </div>
        <div className="space-y-1.5">
          {PRODUCT_TYPES.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setSelectedType(pt.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                selectedType === pt.id
                  ? 'border-gold bg-gold/5'
                  : 'border-surface-border hover:border-white/20 bg-surface-panel'
              }`}
            >
              <span className="text-lg">{pt.icon}</span>
              <span className="text-[11px] font-medium text-white/70">{pt.label}</span>
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="pt-2 border-t border-surface-border">
            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2">From API</p>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedType(c.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-left text-[10px] transition-colors ${
                  selectedType === c.id ? 'text-gold bg-gold/5' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CENTER — Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <LiveViewport />
      </div>

      {/* RIGHT — Calculator + Configurator */}
      <div className="w-[360px] shrink-0 border-l border-surface-border overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            {/* Stone Calculator */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-gold" />
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Stone Calculator</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {shapes.length > 0 ? shapes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    )) : ['round', 'oval', 'pear', 'emerald', 'cushion'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1">Total Carat</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={totalCarat}
                      onChange={(e) => setTotalCarat(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1">Stone Count</label>
                    <input
                      type="number"
                      min="1"
                      value={stoneCount}
                      onChange={(e) => setStoneCount(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {['bracelet', 'necklace'].includes(selectedType) && (
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1">Length (inches)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={lengthInches}
                      onChange={(e) => setLengthInches(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                )}

                {selectedType === 'ring' && (
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1">Ring Size (US)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="3"
                      max="15"
                      value={ringSize}
                      onChange={(e) => setRingSize(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Metal</label>
                  <select
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    className="w-full h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {metals.length > 0 ? metals.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    )) : ['14k_yellow_gold', '14k_white_gold', '14k_rose_gold', '18k_yellow_gold', 'platinum'].map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculated result */}
              <div className="mt-4 p-3 rounded-lg border border-gold/20 bg-gold/5">
                <div className="flex items-center gap-2 mb-2">
                  <Diamond className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Calculated</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-white/30">Per stone</span>
                    <p className="text-white font-mono">{perStoneCarat.toFixed(2)} ct</p>
                  </div>
                  <div>
                    <span className="text-white/30">Diameter</span>
                    <p className="text-white font-mono">
                      {diamondRef ? `~${diamondRef.width_mm.toFixed(1)} mm` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/30">Total weight</span>
                    <p className="text-white font-mono">{totalCarat} ct</p>
                  </div>
                  <div>
                    <span className="text-white/30">Stones</span>
                    <p className="text-white font-mono">{stoneCount}</p>
                  </div>
                </div>
                {diamondRef && (
                  <p className="text-[9px] text-gold/50 mt-2">
                    Reference: {diamondRef.shape} {diamondRef.carat}ct = {diamondRef.length_mm}×{diamondRef.width_mm} mm
                  </p>
                )}
              </div>
            </section>

            {/* MM Sizing Reference */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="h-4 w-4 text-gold" />
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">MM Reference — {shape}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-white/30 border-b border-surface-border">
                      <th className="text-left py-1 pr-2">Carat</th>
                      <th className="text-left py-1 pr-2">L (mm)</th>
                      <th className="text-left py-1 pr-2">W (mm)</th>
                      <th className="text-left py-1">D (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIAMOND_SIZE_TABLE.filter((e) => e.shape === shape).map((e, i) => (
                      <tr key={i} className={`border-b border-surface-border/50 ${Math.abs(e.carat - perStoneCarat) < 0.15 ? 'bg-gold/5 text-gold' : 'text-white/50'}`}>
                        <td className="py-1 pr-2 font-mono">{e.carat}</td>
                        <td className="py-1 pr-2 font-mono">{e.length_mm}</td>
                        <td className="py-1 pr-2 font-mono">{e.width_mm}</td>
                        <td className="py-1 font-mono">{e.depth_mm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Configure + Pricing */}
            <section>
              <button
                onClick={handleConfigure}
                disabled={configuring}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40 transition-colors"
              >
                {configuring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Configure Product
              </button>

              {configResult && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 rounded-lg border border-surface-border bg-surface">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Product Spec</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {configResult.product.per_stone_carat != null && (
                        <div><span className="text-white/30">Per stone</span><p className="text-white font-mono">{configResult.product.per_stone_carat.toFixed(3)} ct</p></div>
                      )}
                      {configResult.product.stone_count != null && (
                        <div><span className="text-white/30">Stones</span><p className="text-white font-mono">{configResult.product.stone_count}</p></div>
                      )}
                      {configResult.product.stone_length_mm != null && (
                        <div><span className="text-white/30">Stone size</span><p className="text-white font-mono">{configResult.product.stone_length_mm}×{configResult.product.stone_width_mm} mm</p></div>
                      )}
                      {configResult.product.total_length_mm != null && (
                        <div><span className="text-white/30">Total length</span><p className="text-white font-mono">{configResult.product.total_length_mm.toFixed(1)} mm</p></div>
                      )}
                    </div>
                  </div>

                  {configResult.pricing && (
                    <div className="p-3 rounded-lg border border-gold/20 bg-gold/5">
                      <p className="text-[10px] font-semibold text-gold uppercase tracking-wider mb-2">Pricing</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-white/30">Diamond cost</span><p className="text-gold font-mono">${configResult.pricing.diamond.diamond_cost_usd.toLocaleString()}</p></div>
                        <div><span className="text-white/30">Metal cost</span><p className="text-gold font-mono">${configResult.pricing.metal.metal_cost_usd.toLocaleString()}</p></div>
                        <div><span className="text-white/30">Retail price</span><p className="text-gold font-bold font-mono">${configResult.pricing.price.retail_price_usd.toLocaleString()}</p></div>
                        <div><span className="text-white/30">Margin</span><p className="text-gold font-mono">{configResult.pricing.price.margin_percent.toFixed(1)}%</p></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToScene}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gold/10 text-gold text-[11px] font-medium rounded hover:bg-gold/20 transition-colors"
                    >
                      <Gem className="h-3.5 w-3.5" />
                      Add to Scene
                    </button>
                  </div>

                  {/* Shopify Product Link */}
                  <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Shopify Product Link</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-white/30 block mb-1">Product SKU</label>
                        <input
                          type="text"
                          placeholder="e.g. MJ-TB-15CT-YG"
                          value={shopifySku}
                          onChange={(e) => setShopifySku(e.target.value)}
                          className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/30 block mb-1">Shopify Product URL</label>
                        <input
                          type="url"
                          placeholder="https://mountainjewels.com/products/..."
                          value={shopifyUrl}
                          onChange={(e) => setShopifyUrl(e.target.value)}
                          className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!shopifySku.trim() && !shopifyUrl.trim()) {
                            toast.error('Enter a SKU or URL')
                            return
                          }
                          setShopifyLinked(true)
                          toast.success(`Linked to Shopify: ${shopifySku || shopifyUrl}`)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 text-white text-[10px] font-semibold rounded hover:bg-emerald-500 transition-colors"
                      >
                        <Link2 className="h-3 w-3" />
                        {shopifyLinked ? 'Update Link' : 'Link Product'}
                      </button>
                      {shopifyLinked && shopifyUrl && (
                        <a
                          href={shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium rounded hover:bg-emerald-500/10 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on Shopify
                        </a>
                      )}
                    </div>
                    {shopifyLinked && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[9px] text-emerald-400/80">
                          Linked: {shopifySku || 'via URL'}{configResult?.pricing ? ` · $${configResult.pricing.price.retail_price_usd.toLocaleString()}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
