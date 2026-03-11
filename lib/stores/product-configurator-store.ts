/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * State for the Parametric Product Configurator panel.
 */

import { create } from 'zustand'
import type {
  ProductCategory,
  MetalOption,
  ConfigureRequest,
  ConfigureResult,
} from '@/lib/api/products'

interface ProductConfiguratorState {
  categories: ProductCategory[]
  shapes: string[]
  metals: MetalOption[]

  selectedCategory: string
  selectedShape: string
  selectedMetal: string
  totalCarat: number
  ringSize: number
  chainLengthInches: number
  hoopDiameterMm: number

  result: ConfigureResult | null
  loading: boolean
  error: string | null

  optionsLoading: boolean
  optionsError: string | null

  setCategories: (c: ProductCategory[]) => void
  setShapes: (s: string[]) => void
  setMetals: (m: MetalOption[]) => void
  setSelectedCategory: (id: string) => void
  setSelectedShape: (s: string) => void
  setSelectedMetal: (m: string) => void
  setTotalCarat: (c: number) => void
  setRingSize: (s: number) => void
  setChainLengthInches: (l: number) => void
  setHoopDiameterMm: (d: number) => void
  setResult: (r: ConfigureResult | null) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  setOptionsLoading: (l: boolean) => void
  setOptionsError: (e: string | null) => void
  buildRequest: () => ConfigureRequest
  reset: () => void
}

const INITIAL = {
  categories: [] as ProductCategory[],
  shapes: [] as string[],
  metals: [] as MetalOption[],
  selectedCategory: '',
  selectedShape: '',
  selectedMetal: '',
  totalCarat: 1.0,
  ringSize: 7,
  chainLengthInches: 18,
  hoopDiameterMm: 25,
  result: null as ConfigureResult | null,
  loading: false,
  error: null as string | null,
  optionsLoading: false,
  optionsError: null as string | null,
}

export const useProductConfiguratorStore = create<ProductConfiguratorState>(
  (set, get) => ({
    ...INITIAL,

    setCategories: (c) => set({ categories: c }),
    setShapes: (s) => set({ shapes: s }),
    setMetals: (m) => set({ metals: m }),
    setSelectedCategory: (id) => set({ selectedCategory: id, result: null, error: null }),
    setSelectedShape: (s) => set({ selectedShape: s, result: null }),
    setSelectedMetal: (m) => set({ selectedMetal: m, result: null }),
    setTotalCarat: (c) => set({ totalCarat: c, result: null }),
    setRingSize: (s) => set({ ringSize: s, result: null }),
    setChainLengthInches: (l) => set({ chainLengthInches: l, result: null }),
    setHoopDiameterMm: (d) => set({ hoopDiameterMm: d, result: null }),
    setResult: (r) => set({ result: r }),
    setLoading: (l) => set({ loading: l }),
    setError: (e) => set({ error: e }),
    setOptionsLoading: (l) => set({ optionsLoading: l }),
    setOptionsError: (e) => set({ optionsError: e }),

    buildRequest: (): ConfigureRequest => {
      const s = get()
      const req: ConfigureRequest = {
        category: s.selectedCategory,
        total_carat: s.totalCarat,
        shape: s.selectedShape || undefined,
        metal: s.selectedMetal || undefined,
      }
      const cat = s.selectedCategory.toLowerCase()
      if (cat === 'ring' || cat === 'rings') {
        req.ring_size = s.ringSize
      }
      if (cat === 'necklace' || cat === 'necklaces' || cat === 'pendant' || cat === 'pendants') {
        req.chain_length_inches = s.chainLengthInches
      }
      if (cat === 'earring' || cat === 'earrings') {
        req.hoop_diameter_mm = s.hoopDiameterMm
      }
      return req
    },

    reset: () => set(INITIAL),
  })
)
