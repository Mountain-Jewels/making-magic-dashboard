/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Per-avatar custom piece designer.
 * Pre-fills from customer preferences, uses diamond reference,
 * calls configureProduct, and records the design in the avatar's brain.
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Gem, Diamond, Ruler } from 'lucide-react'
import { configureProduct, type ConfigureResult, type ConfigureRequest } from '@/lib/api/products'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { lookupDiamondSizeSync } from '@/lib/services/diamond-reference'
import { DIAMOND_SHAPES } from '@/lib/types/guardrails'
import { Card } from '@/components/shared/Card'

const INPUT =
  'w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'px-4 py-2 bg-gold text-black font-medium text-sm rounded-md hover:bg-gold-hover disabled:opacity-50 transition-colors'

interface CustomPieceDesignerProps {
  avatarId?: string
  avatarName?: string
  onDesigned?: (result: ConfigureResult) => void
}

export function CustomPieceDesigner({ avatarId, avatarName, onDesigned }: CustomPieceDesignerProps) {
  const activeCustomer = useCustomerStore((s) => s.getActiveCustomer())
  const { recordFashionChoice, incrementInteraction } = useAvatarBrainStore()
  const { addJewelry: addJewelryToScene } = useSceneStateStore()

  const prefs = activeCustomer?.preferences

  const [category, setCategory] = useState('ring')
  const [shape, setShape] = useState(prefs?.preferred_shapes?.[0] ?? 'round')
  const [metal, setMetal] = useState(prefs?.preferred_metal ?? 'yellow_gold_14k')
  const [carat, setCarat] = useState('1.0')
  const [ringSize, setRingSize] = useState(String(prefs?.ring_size_us ?? ''))
  const [chainLength, setChainLength] = useState('')
  const [hoopDiameter, setHoopDiameter] = useState('')
  const [configuring, setConfiguring] = useState(false)
  const [result, setResult] = useState<ConfigureResult | null>(null)

  const dims = lookupDiamondSizeSync(shape, Number(carat) || 1)

  const handleConfigure = async () => {
    setConfiguring(true)
    setResult(null)
    try {
      const req: ConfigureRequest = {
        category,
        total_carat: Number(carat) || 1,
        shape,
        metal,
      }
      if (category === 'ring' && ringSize) req.ring_size = Number(ringSize)
      if ((category === 'necklace' || category === 'pendant') && chainLength) req.chain_length_inches = Number(chainLength)
      if (category === 'earring' && hoopDiameter) req.hoop_diameter_mm = Number(hoopDiameter)

      const res = await configureProduct(req)
      setResult(res)

      if (avatarId) {
        recordFashionChoice(avatarId, `${category}_${shape}_${metal}`, true)
        incrementInteraction(avatarId)
      }

      toast.success(`Piece configured — ${res.pricing?.price?.retail_price_usd ? `$${res.pricing.price.retail_price_usd.toLocaleString()}` : 'pricing calculated'}`)
      onDesigned?.(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Configuration failed')
    } finally {
      setConfiguring(false)
    }
  }

  const handleAddToScene = () => {
    if (!result) return
    const sku = `custom_${category}_${shape}_${carat}ct_${metal}`
    addJewelryToScene(sku)
    toast.success('Added to scene')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Gem className="h-4 w-4 text-gold" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {avatarName ? `${avatarName} Designs` : 'Custom Piece Designer'}
        </h3>
        {activeCustomer && (
          <span className="ml-auto text-[10px] text-white/30">
            For: <span className="text-gold/60">{activeCustomer.name}</span>
          </span>
        )}
      </div>

      {/* Diamond dimensions preview */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface border border-surface-border">
        <Diamond className="h-3 w-3 text-white/30" />
        <span className="text-[10px] text-white/40 capitalize">{shape}</span>
        <span className="text-[10px] text-white/30">{carat} ct</span>
        <Ruler className="h-3 w-3 text-white/20 ml-auto" />
        <span className="text-[10px] text-gold font-mono">
          {dims.length_mm > 0 ? `${dims.length_mm}x${dims.width_mm}x${dims.depth_mm}mm` : '—'}
        </span>
      </div>

      {/* Configuration form */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-white/40 mb-0.5">Category</label>
          <select className={INPUT} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ring">Ring</option>
            <option value="necklace">Necklace</option>
            <option value="earring">Earrings</option>
            <option value="bracelet">Bracelet</option>
            <option value="pendant">Pendant</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-white/40 mb-0.5">Shape</label>
          <select className={INPUT} value={shape} onChange={(e) => setShape(e.target.value)}>
            {DIAMOND_SHAPES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-white/40 mb-0.5">Metal</label>
          <select className={INPUT} value={metal} onChange={(e) => setMetal(e.target.value)}>
            <option value="yellow_gold_14k">14K Yellow Gold</option>
            <option value="yellow_gold_18k">18K Yellow Gold</option>
            <option value="white_gold_14k">14K White Gold</option>
            <option value="white_gold_18k">18K White Gold</option>
            <option value="rose_gold_14k">14K Rose Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-white/40 mb-0.5">Carat</label>
          <input className={INPUT} type="number" step="0.05" min="0.1" max="10" value={carat} onChange={(e) => setCarat(e.target.value)} />
        </div>
        {category === 'ring' && (
          <div>
            <label className="block text-[10px] text-white/40 mb-0.5">Ring Size (US)</label>
            <input className={INPUT} placeholder={prefs?.ring_size_us ? String(prefs.ring_size_us) : '6.5'} value={ringSize} onChange={(e) => setRingSize(e.target.value)} />
          </div>
        )}
        {(category === 'necklace' || category === 'pendant') && (
          <div>
            <label className="block text-[10px] text-white/40 mb-0.5">Chain Length (in)</label>
            <input className={INPUT} placeholder="18" value={chainLength} onChange={(e) => setChainLength(e.target.value)} />
          </div>
        )}
        {category === 'earring' && (
          <div>
            <label className="block text-[10px] text-white/40 mb-0.5">Hoop Diameter (mm)</label>
            <input className={INPUT} placeholder="15" value={hoopDiameter} onChange={(e) => setHoopDiameter(e.target.value)} />
          </div>
        )}
      </div>

      <button onClick={handleConfigure} disabled={configuring} className={`w-full ${BTN_GOLD}`}>
        {configuring ? 'Configuring...' : 'Configure & Price'}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-2 p-3 rounded-lg bg-surface border border-surface-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-white/30">Total Carat</p>
              <p className="text-sm text-white/70 font-mono">{result.product?.total_carat ?? '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30">Metal Weight</p>
              <p className="text-sm text-white/70 font-mono">{result.metal?.total_weight_grams ? `${result.metal.total_weight_grams}g` : '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30">Retail Price</p>
              <p className="text-sm text-gold font-mono font-semibold">
                {result.pricing?.price?.retail_price_usd ? `$${result.pricing.price.retail_price_usd.toLocaleString()}` : '—'}
              </p>
            </div>
          </div>
          {result.pricing?.price && (
            <div className="text-[10px] text-white/30 space-y-0.5">
              <div className="flex justify-between">
                <span>Diamond cost</span>
                <span className="font-mono">${result.pricing.price.diamond_cost_usd?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Metal cost</span>
                <span className="font-mono">${result.pricing.price.metal_cost_usd?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Margin</span>
                <span className="font-mono">{result.pricing.price.margin_percent ? `${Math.round(result.pricing.price.margin_percent)}%` : '—'}</span>
              </div>
            </div>
          )}
          <button onClick={handleAddToScene} className={`w-full ${BTN_GOLD}`}>
            Add to Scene
          </button>
        </div>
      )}
    </div>
  )
}
