/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  getCategories,
  getMetals,
  getShapes,
  getRingSizes,
  configureProduct,
  getPricingTiers,
  setPricingTier,
  deletePricingTier,
  getGoldPrice,
  getMaterials,
} from '@/lib/api/products'
import type {
  ProductCategory,
  MetalOption,
  RingSizeEntry,
  ConfigureResult,
  PricingTier,
} from '@/lib/api/products'

type Tab = 'configurator' | 'pricing' | 'materials'

const TABS: { id: Tab; label: string }[] = [
  { id: 'configurator', label: 'Configurator' },
  { id: 'pricing', label: 'Pricing Admin' },
  { id: 'materials', label: 'Materials' },
]

const inputCls =
  'w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm'
const btnCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-4 py-2 text-sm'
const btnDangerCls =
  'bg-red-600/80 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 text-xs'

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>('configurator')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Products</h1>
        <p className="text-sm text-white/50 mt-1">Jewelry configurator &amp; pricing</p>
      </div>

      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'configurator' && <ConfiguratorTab />}
        {tab === 'pricing' && <PricingTab />}
        {tab === 'materials' && <MaterialsTab />}
      </div>
    </div>
  )
}

/* ─── Configurator ─────────────────────────────────────────────────── */

function ConfiguratorTab() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [metals, setMetals] = useState<MetalOption[]>([])
  const [shapes, setShapes] = useState<string[]>([])
  const [ringSizes, setRingSizes] = useState<RingSizeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConfigureResult | null>(null)

  const [category, setCategory] = useState('')
  const [metal, setMetal] = useState('')
  const [shape, setShape] = useState('')
  const [carat, setCarat] = useState('1.0')
  const [ringSize, setRingSize] = useState('')

  useEffect(() => {
    Promise.all([getCategories(), getMetals(), getShapes(), getRingSizes()])
      .then(([cats, mets, shps, sizes]) => {
        setCategories(cats)
        setMetals(mets)
        setShapes(shps)
        setRingSizes(sizes)
        if (cats.length) setCategory(cats[0].id)
        if (mets.length) setMetal(mets[0].id)
        if (shps.length) setShape(shps[0])
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load options'))
  }, [])

  const handleConfigure = useCallback(async () => {
    if (!category) return
    setLoading(true)
    try {
      const res = await configureProduct({
        category,
        shape: shape || undefined,
        metal: metal || undefined,
        total_carat: parseFloat(carat) || undefined,
        ring_size: ringSize ? parseFloat(ringSize) : undefined,
      })
      setResult(res)
      toast.success('Product configured')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Configuration failed')
    } finally {
      setLoading(false)
    }
  }, [category, metal, shape, carat, ringSize])

  return (
    <div className="space-y-6">
      <Card title="Configure Product">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Category</span>
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-white/60">Metal</span>
            <select className={inputCls} value={metal} onChange={(e) => setMetal(e.target.value)}>
              {metals.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-white/60">Shape</span>
            <select className={inputCls} value={shape} onChange={(e) => setShape(e.target.value)}>
              {shapes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-white/60">Carat</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              className={inputCls}
              value={carat}
              onChange={(e) => setCarat(e.target.value)}
              placeholder="1.0"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-white/60">Ring Size (US)</span>
            <select className={inputCls} value={ringSize} onChange={(e) => setRingSize(e.target.value)}>
              <option value="">N/A</option>
              {ringSizes.map((s) => (
                <option key={s.us_size} value={String(s.us_size)}>{s.us_size}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button className={btnCls} onClick={handleConfigure} disabled={loading || !category}>
              {loading ? 'Configuring…' : 'Configure'}
            </button>
          </div>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Dimensions">
            <pre className="text-xs text-white/70 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(result.product, null, 2)}
            </pre>
          </Card>
          <Card title="Pricing">
            <pre className="text-xs text-white/70 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(result.pricing, null, 2)}
            </pre>
          </Card>
          <Card title="UE Commands">
            <pre className="text-xs text-white/70 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(result.ue_commands, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  )
}

/* ─── Pricing Admin ───────────────────────────────────────────────── */

function PricingTab() {
  const [goldPrice, setGoldPrice] = useState<{ gold_usd_per_oz: number; source: string } | null>(null)
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)

  const [newShape, setNewShape] = useState('')
  const [newMin, setNewMin] = useState('')
  const [newMax, setNewMax] = useState('')
  const [newCost, setNewCost] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [gp, pt] = await Promise.all([getGoldPrice(), getPricingTiers()])
      setGoldPrice(gp)
      setTiers(pt.tiers)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load pricing data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleAddTier = useCallback(async () => {
    if (!newShape || !newMin || !newMax || !newCost) return
    setSaving(true)
    try {
      await setPricingTier({
        shape: newShape,
        min_carat: parseFloat(newMin),
        max_carat: parseFloat(newMax),
        cost_per_carat: parseFloat(newCost),
      })
      toast.success('Pricing tier added')
      setNewShape('')
      setNewMin('')
      setNewMax('')
      setNewCost('')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add tier')
    } finally {
      setSaving(false)
    }
  }, [newShape, newMin, newMax, newCost, refresh])

  const handleDelete = useCallback(async (tierId: string) => {
    try {
      await deletePricingTier(tierId)
      toast.success('Tier deleted')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }, [refresh])

  if (loading) {
    return <div className="text-center text-white/60 py-8">Loading pricing data…</div>
  }

  return (
    <div className="space-y-6">
      {goldPrice && (
        <Card title="Gold Spot Price">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-gold">
              ${goldPrice.gold_usd_per_oz.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-white/40">USD / oz — {goldPrice.source}</span>
          </div>
        </Card>
      )}

      <Card title="Pricing Tiers">
        {tiers.length === 0 ? (
          <EmptyState title="No pricing tiers configured" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Shape</th>
                  <th className="pb-2 pr-4 font-medium">Min Carat</th>
                  <th className="pb-2 pr-4 font-medium">Max Carat</th>
                  <th className="pb-2 pr-4 font-medium">$ / Carat</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.id ?? `${t.shape}-${t.min_carat}`} className="border-b border-surface-border/50 text-white/80">
                    <td className="py-2 pr-4">{t.shape}</td>
                    <td className="py-2 pr-4">{t.min_carat}</td>
                    <td className="py-2 pr-4">{t.max_carat}</td>
                    <td className="py-2 pr-4">${t.cost_per_carat.toLocaleString()}</td>
                    <td className="py-2">
                      {t.id && (
                        <button className={btnDangerCls} onClick={() => handleDelete(t.id!)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add Pricing Tier">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <input className={inputCls} placeholder="Shape" value={newShape} onChange={(e) => setNewShape(e.target.value)} />
          <input className={inputCls} type="number" placeholder="Min Carat" value={newMin} onChange={(e) => setNewMin(e.target.value)} />
          <input className={inputCls} type="number" placeholder="Max Carat" value={newMax} onChange={(e) => setNewMax(e.target.value)} />
          <input className={inputCls} type="number" placeholder="$/Carat" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
        </div>
        <button
          className={`${btnCls} mt-4`}
          onClick={handleAddTier}
          disabled={saving || !newShape || !newMin || !newMax || !newCost}
        >
          {saving ? 'Saving…' : 'Add Tier'}
        </button>
      </Card>
    </div>
  )
}

/* ─── Materials ───────────────────────────────────────────────────── */

function MaterialsTab() {
  const [materials, setMaterials] = useState<{ diamond: Record<string, number>; metals: Record<string, unknown> } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMaterials()
      .then(setMaterials)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load materials'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center text-white/60 py-8">Loading materials…</div>
  }

  if (!materials) {
    return <EmptyState title="No material data available" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Diamond UE Material">
        <pre className="text-xs text-white/70 overflow-auto max-h-80 whitespace-pre-wrap rounded-md bg-black/30 p-3">
          {JSON.stringify(materials.diamond, null, 2)}
        </pre>
      </Card>
      <Card title="Metal UE Materials">
        <pre className="text-xs text-white/70 overflow-auto max-h-80 whitespace-pre-wrap rounded-md bg-black/30 p-3">
          {JSON.stringify(materials.metals, null, 2)}
        </pre>
      </Card>
    </div>
  )
}
