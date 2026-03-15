/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Gem, Sparkles } from 'lucide-react'
import { getCategories, getShapes, getMetals, getRingSizes, configureProduct } from '@/lib/api/products'
import { addJewelry } from '@/lib/api/scene-control'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

interface OptionItem {
  id: string
  name: string
  [key: string]: unknown
}

export function JewelryDesigner() {
  const [categories, setCategories] = useState<OptionItem[]>([])
  const [shapes, setShapes] = useState<OptionItem[]>([])
  const [metals, setMetals] = useState<OptionItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const [category, setCategory] = useState('')
  const [shape, setShape] = useState('')
  const [metal, setMetal] = useState('')
  const [carat, setCarat] = useState('1.0')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [busy, setBusy] = useState(false)

  const loadOptions = useCallback(async () => {
    if (loaded) return
    try {
      const [cats, sh, met] = await Promise.all([getCategories(), getShapes(), getMetals()])
      setCategories(cats as unknown as OptionItem[])
      setShapes(sh as unknown as OptionItem[])
      setMetals(met as unknown as OptionItem[])
      setLoaded(true)
    } catch { toast.error('Failed to load product options') }
  }, [loaded])

  useState(() => { loadOptions() })

  async function handleConfigure() {
    if (!category) return
    setBusy(true)
    try {
      const res = await configureProduct({
        category,
        total_carat: parseFloat(carat) || 1.0,
        shape: shape || undefined,
        metal: metal || undefined,
      })
      setResult(res as unknown as Record<string, unknown>)
      toast.success('Product configured')
    } catch { toast.error('Configuration failed') }
    finally { setBusy(false) }
  }

  const sceneStore = useSceneStateStore()

  async function handleAddToScene() {
    if (!result) return
    try {
      const sku = String((result as Record<string, unknown>).sku || 'configured-jewelry')
      await addJewelry(sku)
      sceneStore.addJewelry(sku)
      toast.success('Jewelry added to scene')
    } catch { toast.error('Failed to add to scene') }
  }

  const selectCls = 'h-8 w-full px-2 bg-surface border border-surface-border rounded text-[11px] text-white/70 focus:outline-none focus:ring-1 focus:ring-gold'
  const inputCls = 'h-8 w-full px-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Jewelry Designer</h2>
        <p className="text-[11px] text-white/30">Parametric configuration with AI-powered proportions and materials</p>
      </div>

      {/* Configurator */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1 block">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="">Select category...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1 block">Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value)} className={selectCls}>
              <option value="">Any</option>
              {shapes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1 block">Metal</label>
            <select value={metal} onChange={(e) => setMetal(e.target.value)} className={selectCls}>
              <option value="">Any</option>
              {metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1 block">Total Carat</label>
          <input value={carat} onChange={(e) => setCarat(e.target.value)} type="number" step="0.1" min="0.1" max="20" className={inputCls} />
        </div>

        <button
          onClick={handleConfigure}
          disabled={busy || !category}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Configure
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="p-3 bg-surface-panel rounded-lg border border-surface-border space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Configuration Result</p>
          <pre className="text-[10px] text-white/50 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            onClick={handleAddToScene}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-[11px] rounded hover:bg-gold/20"
          >
            <Gem className="h-3 w-3" />
            Add to Scene
          </button>
        </div>
      )}
    </div>
  )
}
