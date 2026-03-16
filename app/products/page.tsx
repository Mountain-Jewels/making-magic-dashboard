/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
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
  type ProductCategory,
  type MetalOption,
  type RingSizeEntry,
  type ConfigureResult,
  type PricingTier,
} from '@/lib/api/products'
import { useAuth } from '@/lib/auth/useAuth'

type Tab = 'configurator' | 'pricing' | 'materials'

export default function ProductsPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('configurator')

  // Configurator
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [metals, setMetals] = useState<MetalOption[]>([])
  const [shapes, setShapes] = useState<string[]>([])
  const [ringSizes, setRingSizes] = useState<RingSizeEntry[]>([])
  const [category, setCategory] = useState('')
  const [metal, setMetal] = useState('')
  const [shape, setShape] = useState('')
  const [caratWeight, setCaratWeight] = useState('')
  const [ringSize, setRingSize] = useState('')
  const [configResult, setConfigResult] = useState<ConfigureResult | null>(null)
  const [configuring, setConfiguring] = useState(false)

  // Pricing Admin
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [pricingSource, setPricingSource] = useState('')
  const [goldPrice, setGoldPrice] = useState<{ gold_usd_per_oz: number; source: string } | null>(null)
  const [tierForm, setTierForm] = useState({
    shape: '',
    min_carat: '',
    max_carat: '',
    cost_per_carat: '',
  })
  const [savingTier, setSavingTier] = useState(false)
  const [loadingPricing, setLoadingPricing] = useState(false)

  // Materials
  const [materials, setMaterials] = useState<{
    diamond: Record<string, number>
    metals: Record<string, unknown>
  } | null>(null)
  const [loadingMaterials, setLoadingMaterials] = useState(false)

  const loadConfigOptions = useCallback(async () => {
    try {
      const [catRes, metalRes, shapeRes, sizeRes] = await Promise.all([
        getCategories(),
        getMetals(),
        getShapes(),
        getRingSizes(),
      ])
      setCategories(catRes)
      setMetals(metalRes)
      setShapes(shapeRes)
      setRingSizes(sizeRes)
      if (catRes.length && !category) setCategory(catRes[0].id)
      if (metalRes.length && !metal) setMetal(metalRes[0].id)
      if (shapeRes.length && !shape) setShape(shapeRes[0])
      if (sizeRes.length && !ringSize) setRingSize(String(sizeRes[0].us_size))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load options')
    }
  }, [category, metal, shape, ringSize])

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true)
    try {
      const [tiersRes, goldRes] = await Promise.all([getPricingTiers(), getGoldPrice()])
      setPricingTiers(tiersRes.tiers ?? [])
      setPricingSource(tiersRes.source ?? '')
      setGoldPrice(goldRes)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load pricing')
    } finally {
      setLoadingPricing(false)
    }
  }, [])

  const loadMaterials = useCallback(async () => {
    setLoadingMaterials(true)
    try {
      const res = await getMaterials()
      setMaterials(res)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load materials')
    } finally {
      setLoadingMaterials(false)
    }
  }, [])

  useEffect(() => {
    void loadConfigOptions()
  }, [loadConfigOptions])

  useEffect(() => {
    if (activeTab === 'pricing') void loadPricing()
  }, [activeTab, loadPricing])

  useEffect(() => {
    if (activeTab === 'materials') void loadMaterials()
  }, [activeTab, loadMaterials])

  const handleConfigure = async () => {
    if (!category) {
      toast.error('Select a category')
      return
    }
    const carat = parseFloat(caratWeight)
    if (isNaN(carat) || carat <= 0) {
      toast.error('Enter a valid carat weight')
      return
    }
    setConfiguring(true)
    setConfigResult(null)
    try {
      const res = await configureProduct({
        category,
        total_carat: carat,
        shape: shape || undefined,
        metal: metal || undefined,
        ring_size: ringSize ? parseFloat(ringSize) : undefined,
      })
      setConfigResult(res)
      toast.success('Configuration complete')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Configure failed')
    } finally {
      setConfiguring(false)
    }
  }

  const handleSaveTier = async () => {
    const minC = parseFloat(tierForm.min_carat)
    const maxC = parseFloat(tierForm.max_carat)
    const cost = parseFloat(tierForm.cost_per_carat)
    if (!tierForm.shape || isNaN(minC) || isNaN(maxC) || isNaN(cost)) {
      toast.error('Fill all tier fields')
      return
    }
    setSavingTier(true)
    try {
      await setPricingTier({
        shape: tierForm.shape,
        min_carat: minC,
        max_carat: maxC,
        cost_per_carat: cost,
      })
      toast.success('Pricing tier saved')
      setTierForm({ shape: '', min_carat: '', max_carat: '', cost_per_carat: '' })
      void loadPricing()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save tier')
    } finally {
      setSavingTier(false)
    }
  }

  const handleDeleteTier = async (tierId: string) => {
    try {
      await deletePricingTier(tierId)
      toast.success('Tier deleted')
      void loadPricing()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete tier')
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]'
  const labelClass = 'block text-sm text-white/70 mb-1'
  const btnClass =
    'px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-md hover:bg-[#E5C04A] disabled:opacity-50 disabled:cursor-not-allowed'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-white/60">Sign in to access Product Management</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white">Product Management</h1>
          <p className="text-sm text-white/60 mt-1">
            Configure jewelry, manage pricing tiers, view material specs
          </p>
        </header>

        <div className="flex gap-2 border-b border-[#2A2A35]">
          {(['configurator', 'pricing', 'materials'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab
                  ? 'bg-[#111118] text-[#D4AF37] border border-[#2A2A35] border-b-transparent -mb-px'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'configurator' ? 'Configurator' : tab === 'pricing' ? 'Pricing Admin' : 'Materials'}
            </button>
          ))}
        </div>

        {activeTab === 'configurator' && (
          <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Configurator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Metal type</label>
                <select value={metal} onChange={(e) => setMetal(e.target.value)} className={inputClass}>
                  {metals.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Diamond shape</label>
                <select value={shape} onChange={(e) => setShape(e.target.value)} className={inputClass}>
                  {shapes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Carat weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={caratWeight}
                  onChange={(e) => setCaratWeight(e.target.value)}
                  placeholder="e.g. 1.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ring size</label>
                <select
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                  className={inputClass}
                >
                  {ringSizes.map((r) => (
                    <option key={r.us_size} value={String(r.us_size)}>
                      US {r.us_size} ({r.circumference_mm}mm)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleConfigure}
              disabled={configuring}
              className={`${btnClass} mt-4`}
            >
              {configuring ? 'Configuring…' : 'Configure'}
            </button>
            {configResult && (
              <div className="mt-6 p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md space-y-4">
                <h3 className="text-sm font-medium text-[#D4AF37]">Result</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 mb-2">Dimensions & metal</p>
                    <pre className="text-white font-mono text-xs overflow-x-auto">
                      {JSON.stringify(configResult.product, null, 2)}
                    </pre>
                    {configResult.metal && (
                      <p className="text-white mt-2">
                        {configResult.metal.display_name}: {configResult.metal.total_weight_grams}g total,{' '}
                        {configResult.metal.gold_content_grams}g gold
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-white/60 mb-2">Pricing breakdown</p>
                    <pre className="text-white font-mono text-xs overflow-x-auto">
                      {JSON.stringify(configResult.pricing, null, 2)}
                    </pre>
                  </div>
                </div>
                {configResult.ue_commands?.length ? (
                  <div>
                    <p className="text-white/60 mb-2">UE material commands</p>
                    <pre className="text-white font-mono text-xs overflow-x-auto p-2 bg-black/30 rounded">
                      {JSON.stringify(configResult.ue_commands, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}

        {activeTab === 'pricing' && (
          <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-medium text-white">Pricing Admin</h2>
            {goldPrice && (
              <div className="p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md">
                <p className="text-sm text-white/60">Current gold price</p>
                <p className="text-xl font-semibold text-[#D4AF37]">
                  ${goldPrice.gold_usd_per_oz.toLocaleString()}/oz
                </p>
                <p className="text-xs text-white/50 mt-1">Source: {goldPrice.source}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Add / Edit tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Shape</label>
                  <input
                    type="text"
                    value={tierForm.shape}
                    onChange={(e) => setTierForm((f) => ({ ...f, shape: e.target.value }))}
                    placeholder="round"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Min carat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tierForm.min_carat}
                    onChange={(e) => setTierForm((f) => ({ ...f, min_carat: e.target.value }))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max carat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tierForm.max_carat}
                    onChange={(e) => setTierForm((f) => ({ ...f, max_carat: e.target.value }))}
                    placeholder="1"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price per carat ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tierForm.cost_per_carat}
                    onChange={(e) => setTierForm((f) => ({ ...f, cost_per_carat: e.target.value }))}
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTier}
                disabled={savingTier}
                className={`${btnClass} mt-3`}
              >
                {savingTier ? 'Saving…' : 'Save tier'}
              </button>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-3">
                Pricing tiers {pricingSource ? `(${pricingSource})` : ''}
              </h3>
              {loadingPricing ? (
                <p className="text-white/60">Loading…</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2A35]">
                        <th className="text-left py-2 text-white/60 font-medium">Shape</th>
                        <th className="text-left py-2 text-white/60 font-medium">Min carat</th>
                        <th className="text-left py-2 text-white/60 font-medium">Max carat</th>
                        <th className="text-left py-2 text-white/60 font-medium">$/carat</th>
                        <th className="text-right py-2 text-white/60 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingTiers.map((t) => (
                        <tr key={t.id ?? `${t.shape}-${t.min_carat}-${t.max_carat}`} className="border-b border-[#2A2A35]">
                          <td className="py-2 text-white">{t.shape}</td>
                          <td className="py-2 text-white">{t.min_carat}</td>
                          <td className="py-2 text-white">{t.max_carat}</td>
                          <td className="py-2 text-white">${t.cost_per_carat.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            {t.id && (
                              <button
                                onClick={() => handleDeleteTier(t.id!)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pricingTiers.length === 0 && (
                    <p className="py-4 text-white/50 text-sm">No pricing tiers</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'materials' && (
          <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Materials</h2>
            <p className="text-sm text-white/60 mb-4">UE material specs for diamond and metals</p>
            {loadingMaterials ? (
              <p className="text-white/60">Loading…</p>
            ) : materials ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#D4AF37] mb-2">Diamond</h3>
                  <div className="p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md">
                    <pre className="text-white font-mono text-sm overflow-x-auto">
                      {JSON.stringify(materials.diamond, null, 2)}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#D4AF37] mb-2">Metals</h3>
                  <div className="p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md">
                    <pre className="text-white font-mono text-sm overflow-x-auto">
                      {JSON.stringify(materials.metals, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/50">No material data</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
