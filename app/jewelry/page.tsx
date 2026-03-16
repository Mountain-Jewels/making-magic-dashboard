/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Diamond,
  Box,
  Gem,
  Hand,
  Upload,
  Loader2,
  Search,
  Eye,
  Link2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'

import { useAuth } from '@/lib/auth/useAuth'
import { apiGet, apiPost } from '@/lib/api/client'
import {
  getCategories,
  getShapes,
  getMetals,
  getRingSizes,
  getDiamondSize,
  configureProduct,
  type ProductCategory,
  type MetalOption,
  type RingSizeEntry,
  type DiamondSize,
  type ConfigureResult,
  type ConfigureRequest,
} from '@/lib/api/products'
import { meshyListTasks, meshyGetTask, uploadAndGenerateMesh, type MeshyTask } from '@/lib/api/meshy'
import { suggestGeneration, confirmGeneration, type AgenticSuggestion } from '@/lib/api/generate'

const inputClass =
  'w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]'
const buttonClass =
  'px-4 py-2 bg-[#D4AF37] text-black font-medium text-sm rounded-md hover:bg-[#E5C04A] disabled:opacity-50'
const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
    active
      ? 'border-[#D4AF37] text-[#D4AF37]'
      : 'border-transparent text-white/50 hover:text-white/70'
  }`

type Tab = 'meshes' | 'configure' | 'tryon' | 'diamonds'

interface MeshBrowserItem {
  task_id: string
  status: string
  result: Record<string, unknown> | null
  name?: string
}

export default function JewelryPage() {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>('meshes')

  /* ─── Mesh Library ─── */
  const [meshes, setMeshes] = useState<MeshBrowserItem[]>([])
  const [loadingMeshes, setLoadingMeshes] = useState(true)
  const [selectedMesh, setSelectedMesh] = useState<MeshyTask | null>(null)
  const [uploading, setUploading] = useState(false)
  const [meshSearchQuery, setMeshSearchQuery] = useState('')

  /* ─── Configure (Product Engine) ─── */
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [shapes, setShapes] = useState<string[]>([])
  const [metals, setMetals] = useState<MetalOption[]>([])
  const [ringSizes, setRingSizes] = useState<RingSizeEntry[]>([])

  const [cfgCategory, setCfgCategory] = useState('')
  const [cfgShape, setCfgShape] = useState('round')
  const [cfgMetal, setCfgMetal] = useState('14k_white')
  const [cfgCarat, setCfgCarat] = useState(1.0)
  const [cfgRingSize, setCfgRingSize] = useState(7)
  const [configuring, setConfiguring] = useState(false)
  const [configResult, setConfigResult] = useState<ConfigureResult | null>(null)

  /* ─── Try On ─── */
  const [tryOnMeshUrl, setTryOnMeshUrl] = useState('')
  const [tryOnSuggestion, setTryOnSuggestion] = useState<AgenticSuggestion | null>(null)
  const [tryOnLoading, setTryOnLoading] = useState(false)

  /* ─── Diamond Packs ─── */
  const [diamondShape, setDiamondShape] = useState('round')
  const [diamondCarat, setDiamondCarat] = useState(1.0)
  const [diamondResult, setDiamondResult] = useState<DiamondSize | null>(null)
  const [loadingDiamond, setLoadingDiamond] = useState(false)

  /* ─── Loaders ─── */

  const loadMeshes = useCallback(async () => {
    setLoadingMeshes(true)
    try {
      const res = await meshyListTasks(1, 50)
      setMeshes(
        (res.tasks ?? []).map((t) => ({
          task_id: (t as Record<string, unknown>).task_id as string ?? (t as Record<string, unknown>).id as string ?? '',
          status: (t as Record<string, unknown>).status as string ?? 'unknown',
          result: t as Record<string, unknown>,
          name: (t as Record<string, unknown>).name as string ?? undefined,
        })),
      )
    } catch {
      setMeshes([])
    } finally {
      setLoadingMeshes(false)
    }
  }, [])

  const loadProductData = useCallback(async () => {
    const [cats, sh, mt, rs] = await Promise.all([
      getCategories(),
      getShapes(),
      getMetals(),
      getRingSizes(),
    ])
    setCategories(cats)
    setShapes(sh)
    setMetals(mt)
    setRingSizes(rs)
    if (cats.length > 0 && !cfgCategory) setCfgCategory(cats[0].id)
  }, [cfgCategory])

  useEffect(() => {
    void loadMeshes()
    void loadProductData()
  }, [])

  /* ─── Handlers ─── */

  const handleUploadMesh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadAndGenerateMesh(file, { name: file.name })
      if (result) {
        toast.success(`Mesh generation started: ${result.task_id}`)
        void loadMeshes()
      } else {
        toast.error('Mesh generation failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleViewMesh = async (taskId: string) => {
    try {
      const task = await meshyGetTask(taskId)
      setSelectedMesh(task)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load mesh')
    }
  }

  const handleConfigure = async () => {
    setConfiguring(true)
    setConfigResult(null)
    try {
      const req: ConfigureRequest = {
        category: cfgCategory,
        total_carat: cfgCarat,
        shape: cfgShape,
        metal: cfgMetal,
        ring_size: cfgRingSize,
      }
      const result = await configureProduct(req)
      setConfigResult(result)
      if (result) {
        toast.success(`Configured! Retail price: $${result.pricing.price.retail_price_usd.toFixed(2)}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Configuration failed')
    } finally {
      setConfiguring(false)
    }
  }

  const handleTryOn = async () => {
    if (!tryOnMeshUrl.trim()) {
      toast.error('Enter a mesh URL or select from library')
      return
    }
    setTryOnLoading(true)
    setTryOnSuggestion(null)
    try {
      const suggestion = await suggestGeneration('3d', {
        prompt: `Try-on visualization: attach jewelry mesh to MetaHuman avatar for customer preview`,
        extra: {
          mesh_url: tryOnMeshUrl,
          mode: 'try_on',
          category: cfgCategory || 'ring',
        },
      })
      setTryOnSuggestion(suggestion)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Try-on failed')
    } finally {
      setTryOnLoading(false)
    }
  }

  const handleConfirmTryOn = async () => {
    if (!tryOnSuggestion) return
    setTryOnLoading(true)
    try {
      const result = await confirmGeneration('3d', tryOnSuggestion.id)
      setTryOnSuggestion(result)
      if (result?.status === 'complete') toast.success('Try-on ready!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Try-on execution failed')
    } finally {
      setTryOnLoading(false)
    }
  }

  const handleDiamondLookup = async () => {
    setLoadingDiamond(true)
    setDiamondResult(null)
    try {
      const result = await getDiamondSize(diamondShape, diamondCarat)
      setDiamondResult(result)
    } catch {
      toast.error('Diamond lookup failed')
    } finally {
      setLoadingDiamond(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-white/60">Sign in to access Jewelry Studio</p>
      </div>
    )
  }

  const filteredMeshes = meshSearchQuery
    ? meshes.filter(
        (m) =>
          m.name?.toLowerCase().includes(meshSearchQuery.toLowerCase()) ||
          m.task_id.includes(meshSearchQuery),
      )
    : meshes

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Diamond className="h-6 w-6 text-[#D4AF37]" /> Jewelry Studio
          </h1>
          <p className="text-sm text-white/60 mt-1">
            3D mesh library, product configuration, virtual try-on, diamond packs
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#2A2A35]">
          {([
            { key: 'meshes' as Tab, icon: Box, label: '3D Mesh Library' },
            { key: 'configure' as Tab, icon: Gem, label: 'Configure Product' },
            { key: 'tryon' as Tab, icon: Hand, label: 'Virtual Try-On' },
            { key: 'diamonds' as Tab, icon: Sparkles, label: 'Diamond Packs' },
          ]).map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={tabClass(tab === t.key)}>
              <t.icon className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── MESH LIBRARY ─── */}
        {tab === 'meshes' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  value={meshSearchQuery}
                  onChange={(e) => setMeshSearchQuery(e.target.value)}
                  placeholder="Search meshes..."
                  className="w-full pl-10 pr-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <label className={`${buttonClass} cursor-pointer flex items-center gap-2`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadMesh} disabled={uploading} />
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Generating...' : 'Image to 3D'}
              </label>
              <button type="button" onClick={loadMeshes} className="p-2 text-white/40 hover:text-white transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loadingMeshes ? (
              <div className="flex items-center justify-center py-12 gap-2 text-white/40">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading mesh library...
              </div>
            ) : filteredMeshes.length === 0 ? (
              <div className="text-center py-12">
                <Box className="h-12 w-12 mx-auto text-white/10 mb-3" />
                <p className="text-white/40 text-sm">No meshes yet. Upload an image to generate a 3D mesh.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMeshes.map((mesh) => (
                  <div
                    key={mesh.task_id}
                    className="bg-[#111118] border border-[#2A2A35] rounded-lg overflow-hidden hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <div className="aspect-square bg-[#0A0A0F] flex items-center justify-center">
                      <Box className="h-10 w-10 text-white/10" />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs text-white font-medium truncate">{mesh.name || mesh.task_id.slice(0, 12)}</p>
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${
                        mesh.status === 'succeeded' ? 'text-green-500' :
                        mesh.status === 'processing' ? 'text-yellow-500' :
                        mesh.status === 'failed' ? 'text-red-500' : 'text-white/40'
                      }`}>
                        {mesh.status}
                      </p>
                      <div className="flex gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleViewMesh(mesh.task_id)}
                          className="flex-1 px-2 py-1 text-[10px] rounded bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                        >
                          <Eye className="h-3 w-3 inline-block mr-0.5" /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => setTryOnMeshUrl((mesh.result?.glb_url as string) ?? mesh.task_id)}
                          className="flex-1 px-2 py-1 text-[10px] rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                        >
                          <Link2 className="h-3 w-3 inline-block mr-0.5" /> Attach
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mesh Detail */}
            {selectedMesh && (
              <div className="bg-[#111118] border border-[#2A2A35] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Mesh Detail</h3>
                <pre className="text-xs text-white/60 max-h-40 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedMesh, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ─── CONFIGURE PRODUCT ─── */}
        {tab === 'configure' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-white">Product Configurator</h2>
              <div>
                <label className="text-xs text-white/50 block mb-1">Category</label>
                <select value={cfgCategory} onChange={(e) => setCfgCategory(e.target.value)} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Diamond Shape</label>
                  <select value={cfgShape} onChange={(e) => setCfgShape(e.target.value)} className={inputClass}>
                    {shapes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Metal</label>
                  <select value={cfgMetal} onChange={(e) => setCfgMetal(e.target.value)} className={inputClass}>
                    {metals.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Total Carat Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={cfgCarat}
                    onChange={(e) => setCfgCarat(parseFloat(e.target.value) || 0.1)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Ring Size (US)</label>
                  <select value={cfgRingSize} onChange={(e) => setCfgRingSize(Number(e.target.value))} className={inputClass}>
                    {ringSizes.map((r) => (
                      <option key={r.us_size} value={r.us_size}>{r.us_size} ({r.diameter_mm}mm)</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="button" onClick={handleConfigure} disabled={configuring} className={`w-full ${buttonClass}`}>
                {configuring ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : null}
                {configuring ? 'Configuring...' : 'Configure & Price'}
              </button>
            </div>

            {/* Results */}
            <div className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Result</h2>
              {configResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#0A0A0F] rounded-md p-3">
                      <p className="text-white/50 text-xs">Retail Price</p>
                      <p className="text-2xl font-bold text-[#D4AF37]">
                        ${configResult.pricing.price.retail_price_usd.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0F] rounded-md p-3">
                      <p className="text-white/50 text-xs">Margin</p>
                      <p className="text-2xl font-bold text-green-400">
                        {configResult.pricing.price.margin_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-white/40">Diamond Cost</p>
                      <p className="text-white">${configResult.pricing.diamond.diamond_cost_usd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Metal Cost</p>
                      <p className="text-white">${configResult.pricing.metal.metal_cost_usd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Gold Content</p>
                      <p className="text-white">{configResult.metal.gold_content_grams.toFixed(2)}g</p>
                    </div>
                    <div>
                      <p className="text-white/40">Gold Spot</p>
                      <p className="text-white">${configResult.pricing.gold_spot.gold_usd_per_oz.toFixed(2)}/oz</p>
                    </div>
                  </div>
                  {configResult.ue_commands.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">UE Commands ({configResult.ue_commands.length})</p>
                      <pre className="text-[10px] text-white/50 bg-[#0A0A0F] p-2 rounded max-h-24 overflow-auto">
                        {JSON.stringify(configResult.ue_commands, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30">
                  <Gem className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Configure a product to see pricing</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── VIRTUAL TRY-ON ─── */}
        {tab === 'tryon' && (
          <div className="space-y-6">
            <div className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Hand className="h-5 w-5 text-[#D4AF37]" /> Virtual Try-On
              </h2>
              <p className="text-sm text-white/50">
                Select a 3D mesh from the library or paste a URL. AI will suggest attachment
                points and MetaHuman rendering for customer preview.
              </p>
              <div>
                <label className="text-xs text-white/50 block mb-1">Mesh URL / Task ID</label>
                <input
                  type="text"
                  value={tryOnMeshUrl}
                  onChange={(e) => setTryOnMeshUrl(e.target.value)}
                  placeholder="Paste mesh URL or select from library..."
                  className={inputClass}
                />
              </div>
              <button type="button" onClick={handleTryOn} disabled={tryOnLoading || !tryOnMeshUrl.trim()} className={buttonClass}>
                {tryOnLoading ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : <Sparkles className="h-4 w-4 inline-block mr-2" />}
                Suggest Try-On
              </button>

              {tryOnSuggestion?.suggestion && (
                <div className="rounded-lg border border-yellow-600/30 bg-yellow-900/10 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-500">AI Try-On Suggestion</p>
                  {tryOnSuggestion.suggestion.reasoning && (
                    <p className="text-xs text-white/60">{tryOnSuggestion.suggestion.reasoning as string}</p>
                  )}
                  <pre className="text-xs text-white/50 max-h-24 overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(tryOnSuggestion.suggestion, null, 2)}
                  </pre>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleConfirmTryOn} disabled={tryOnLoading} className={buttonClass}>
                      Confirm & Render
                    </button>
                    <button
                      type="button"
                      onClick={() => setTryOnSuggestion(null)}
                      className="px-3 py-2 text-sm text-white/50 border border-white/20 rounded-md hover:text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {tryOnSuggestion?.result && (
                <div className="rounded-lg border border-green-600/30 bg-green-900/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2">Try-On Result</p>
                  <pre className="text-xs text-white/60 max-h-32 overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(tryOnSuggestion.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── DIAMOND PACKS ─── */}
        {tab === 'diamonds' && (
          <div className="space-y-6">
            <div className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Diamond className="h-5 w-5 text-[#D4AF37]" /> Diamond Size Calculator
              </h2>
              <p className="text-sm text-white/50">
                Look up physical dimensions for a diamond by shape and carat weight.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Shape</label>
                  <select value={diamondShape} onChange={(e) => setDiamondShape(e.target.value)} className={inputClass}>
                    {shapes.length > 0
                      ? shapes.map((s) => <option key={s} value={s}>{s}</option>)
                      : ['round', 'princess', 'oval', 'cushion', 'emerald', 'pear', 'marquise', 'radiant', 'asscher', 'heart'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Carat</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={diamondCarat}
                    onChange={(e) => setDiamondCarat(parseFloat(e.target.value) || 0.1)}
                    className={inputClass}
                  />
                </div>
              </div>
              <button type="button" onClick={handleDiamondLookup} disabled={loadingDiamond} className={buttonClass}>
                {loadingDiamond ? 'Looking up...' : 'Look Up Dimensions'}
              </button>

              {diamondResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {diamondResult.length_mm != null && (
                    <div className="bg-[#0A0A0F] rounded-md p-3 text-center">
                      <p className="text-white/40 text-[10px] uppercase">Length</p>
                      <p className="text-lg font-bold text-white">{diamondResult.length_mm}mm</p>
                    </div>
                  )}
                  {diamondResult.width_mm != null && (
                    <div className="bg-[#0A0A0F] rounded-md p-3 text-center">
                      <p className="text-white/40 text-[10px] uppercase">Width</p>
                      <p className="text-lg font-bold text-white">{diamondResult.width_mm}mm</p>
                    </div>
                  )}
                  {diamondResult.depth_mm != null && (
                    <div className="bg-[#0A0A0F] rounded-md p-3 text-center">
                      <p className="text-white/40 text-[10px] uppercase">Depth</p>
                      <p className="text-lg font-bold text-white">{diamondResult.depth_mm}mm</p>
                    </div>
                  )}
                  {diamondResult.diameter_mm != null && (
                    <div className="bg-[#0A0A0F] rounded-md p-3 text-center">
                      <p className="text-white/40 text-[10px] uppercase">Diameter</p>
                      <p className="text-lg font-bold text-white">{diamondResult.diameter_mm}mm</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
