/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Parametric Product Engine API client.
 * Replaces the old jewelry.ts mock catalog.
 */

import { apiGet, apiPost, apiDelete } from './client'

export interface ProductCategory {
  id: string
  name: string
  default_shape: string
  default_metal: string
}

export interface MetalOption {
  id: string
  name: string
  color_srgb: [number, number, number]
}

export interface RingSizeEntry {
  us_size: number
  circumference_mm: number
  diameter_mm: number
}

export interface DiamondSize {
  shape: string
  carat: number
  length_mm: number
  width_mm: number
  depth_mm?: number
  diameter_mm?: number
}

export interface ProductSpec {
  category: string
  total_carat?: number
  per_stone_carat?: number
  stone_count?: number
  stone_shape?: string
  stone_length_mm?: number
  stone_width_mm?: number
  length_inches?: number
  total_length_mm?: number
  ring_size_us?: number
  finger_circumference_mm?: number
  band_width_mm?: number
  hoop_diameter_mm?: number
  stones_per_hoop?: number
  [key: string]: unknown
}

export interface PricingBreakdown {
  diamond: {
    total_carat: number
    per_stone_carat: number
    cost_per_carat: number
    diamond_cost_usd: number
  }
  metal: {
    gold_content_grams: number
    gold_usd_per_oz: number
    gold_usd_per_gram: number
    metal_cost_usd: number
    gold_price_available: boolean
  }
  price: {
    diamond_cost_usd: number
    metal_cost_usd: number
    total_cost_usd: number
    markup_multiplier: number
    retail_price_usd: number
    margin_percent: number
  }
  gold_spot: {
    gold_usd_per_oz: number
    source: string
  }
}

export interface ConfigureResult {
  category: string
  input: Record<string, unknown>
  product: ProductSpec
  metal: {
    metal_type: string
    display_name: string
    total_weight_grams: number
    gold_content_grams: number
  }
  pricing: PricingBreakdown
  ue_commands: Record<string, unknown>[]
  avatar: Record<string, number>
}

export interface PricingTier {
  id?: string
  shape: string
  min_carat: number
  max_carat: number
  cost_per_carat: number
  updated_at?: string
}

export interface ConfigureRequest {
  category: string
  total_carat?: number
  shape?: string
  metal?: string
  length_inches?: number
  ring_size?: number
  chain_length_inches?: number
  hoop_diameter_mm?: number
}

// -- Customer endpoints --

export async function getCategories(): Promise<ProductCategory[]> {
  const res = await apiGet<{ categories: ProductCategory[] }>('/products/categories')
  return res.categories ?? []
}

export async function getShapes(): Promise<string[]> {
  const res = await apiGet<{ shapes: string[] }>('/products/shapes')
  return res.shapes ?? []
}

export async function getMetals(): Promise<MetalOption[]> {
  const res = await apiGet<{ metals: MetalOption[] }>('/products/metals')
  return res.metals ?? []
}

export async function getRingSizes(): Promise<RingSizeEntry[]> {
  const res = await apiGet<{ sizes: RingSizeEntry[] }>('/products/ring-sizes')
  return res.sizes ?? []
}

export async function getDiamondSize(shape: string, carat: number): Promise<DiamondSize> {
  return apiGet<DiamondSize>(`/products/diamond-size?shape=${encodeURIComponent(shape)}&carat=${carat}`)
}

export async function calculateProduct(req: ConfigureRequest): Promise<ProductSpec> {
  const res = await apiPost<{ product: ProductSpec }>('/products/calculate', req)
  return res.product
}

export async function configureProduct(req: ConfigureRequest): Promise<ConfigureResult> {
  return apiPost<ConfigureResult>('/products/configure', req)
}

// -- Admin endpoints --

export async function getPricingTiers(): Promise<{ source: string; tiers: PricingTier[] }> {
  return apiGet<{ source: string; tiers: PricingTier[] }>('/products/admin/pricing-tiers')
}

export async function setPricingTier(tier: {
  shape: string
  min_carat: number
  max_carat: number
  cost_per_carat: number
}): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/products/admin/pricing-tiers', tier)
}

export async function deletePricingTier(tierId: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/products/admin/pricing-tiers/${tierId}`)
}

export async function getGoldPrice(): Promise<{ gold_usd_per_oz: number; source: string }> {
  return apiGet<{ gold_usd_per_oz: number; source: string }>('/products/admin/gold-price')
}

export async function getMaterials(): Promise<{ diamond: Record<string, number>; metals: Record<string, unknown> }> {
  return apiGet('/products/admin/materials')
}
