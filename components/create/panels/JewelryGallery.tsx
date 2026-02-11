'use client'

import { useState, useEffect, useMemo } from 'react'
import { Gem } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { getCategories, getProducts } from '@/lib/api/jewelry'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { JewelryCategory, JewelryProduct } from '@/lib/api/types'

export function JewelryGallery() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()

  const [categories, setCategories] = useState<JewelryCategory[]>([])
  const [products, setProducts] = useState<JewelryProduct[]>([])
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState<string>('')
  const [shape, setShape] = useState<string>('')
  const [carat, setCarat] = useState<string>('')
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  // Load categories on mount
  useEffect(() => {
    let cancelled = false
    setCategoriesLoading(true)
    setCategoriesError(null)
    getCategories()
      .then((list) => {
        if (!cancelled) {
          setCategories(list)
          if (list.length > 0 && !category) {
            setCategory(list[0].id)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCategoriesError(err?.message ?? 'Failed to load categories')
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Load products when category, shape, or carat changes
  useEffect(() => {
    if (!category) return
    let cancelled = false
    setProductsLoading(true)
    setProductsError(null)
    getProducts({
      category,
      shape: shape || undefined,
      carat: carat || undefined,
      limit: 20,
    })
      .then(({ products: list, total: t }) => {
        if (!cancelled) {
          setProducts(list)
          setTotal(t)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProductsError(err?.message ?? 'Failed to load products')
          setProducts([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false)
      })
    return () => { cancelled = true }
  }, [category, shape, carat])

  // Extract unique shapes and carats from current products
  const { shapes, carats } = useMemo(() => {
    const s = new Set<string>()
    const c = new Set<string>()
    for (const p of products) {
      for (const v of p.variants ?? []) {
        if (v.shape) s.add(String(v.shape))
        if (v.carat) c.add(String(v.carat))
      }
    }
    return {
      shapes: Array.from(s).sort(),
      carats: Array.from(c).sort((a, b) => parseFloat(a) - parseFloat(b)),
    }
  }, [products])

  const ensureScene = () => {
    if (currentScene) return currentScene.id
    const scene = {
      id: `scene-${Date.now()}`,
      name: 'Untitled Scene',
      background: 'jewelry_studio' as const,
      camera: 'close_up' as const,
      lighting: 'warm_golden' as const,
      jewelry_position: 'center_pedestal' as const,
      duration_seconds: 15,
      created_at: new Date().toISOString(),
      status: 'draft' as const,
    }
    addScene(scene)
    setCurrentScene(scene)
    return scene.id
  }

  const handleAddToScene = (product: JewelryProduct) => {
    const id = ensureScene()
    const firstImage = product.images?.[0] ?? ''
    updateScene(id, {
      jewelry_sku: product.id,
      jewelry_product_id: product.id,
      jewelry_title: product.title,
      jewelry_image_url: firstImage,
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Gem className="h-5 w-5 text-brand-gold" />
        <h3 className="text-sm font-semibold text-gray-900">Jewelry Selection</h3>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Category</p>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            setShape('')
            setCarat('')
          }}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
            <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.product_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoriesError && (
          <p className="text-xs text-red-600 mt-1">{categoriesError}</p>
        )}
      </div>

      {/* Shape */}
      {shapes.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Diamond Shape</p>
          <Select value={shape} onValueChange={setShape}>
            <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
              <SelectValue placeholder="Any shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any shape</SelectItem>
              {shapes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Carat */}
      {carats.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Carat Weight</p>
          <Select value={carat} onValueChange={setCarat}>
            <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
              <SelectValue placeholder="Any carat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any carat</SelectItem>
              {carats.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} carats
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Product grid */}
      <div>
        <p className="text-xs text-gray-500 mb-2">
          {productsLoading ? 'Loading products...' : `${total} product${total !== 1 ? 's' : ''}`}
        </p>
        {productsError && (
          <p className="text-xs text-red-600 mb-2">{productsError}</p>
        )}
        {!productsLoading && !productsError && products.length === 0 && (
          <p className="text-xs text-gray-500 py-4 text-center">No products in this category</p>
        )}
        {!productsLoading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
            {products.map((p) => {
              const firstImage = p.images?.[0] ?? ''
              const firstVariant = p.variants?.[0]
              const price = firstVariant?.price ?? ''
              return (
                <div
                  key={p.id}
                  className="rounded-lg border-2 border-brand-gold/40 overflow-hidden bg-white"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-xs text-gray-400">No image</p>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={p.title}>
                      {p.title}
                    </p>
                    {price && (
                      <p className="text-xs text-gray-600">${price}</p>
                    )}
                    <Button
                      size="sm"
                      className="w-full mt-1 bg-brand-gold text-black hover:bg-brand-gold/90 text-xs py-1 h-7"
                      onClick={() => handleAddToScene(p)}
                    >
                      Add to Scene
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        All jewelry images are AI generated — powered by GPT-4o (Phase 7)
      </p>
    </div>
  )
}
