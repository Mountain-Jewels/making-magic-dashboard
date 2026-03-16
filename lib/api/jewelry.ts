/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Jewelry API — product engine data (categories, shapes, configuration)
 */

import { apiGet } from './client'
import type { JewelryCategory, JewelryProduct } from './types'

export async function getCategories(): Promise<JewelryCategory[]> {
  try {
    const res = await apiGet<{ categories?: JewelryCategory[] }>('/products/categories')
    const arr = (res as { categories?: JewelryCategory[] })?.categories
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export interface GetProductsResult {
  products: JewelryProduct[]
  total: number
}

export async function getProducts(params?: {
  category?: string
  shape?: string
  carat?: string
  limit?: number
}): Promise<GetProductsResult> {
  const p: Record<string, string> = {}
  if (params?.category) p.category = params.category
  if (params?.shape) p.shape = params.shape
  if (params?.carat) p.carat = params.carat
  if (params?.limit) p.limit = String(params.limit)
  const search = new URLSearchParams(p).toString()
  const query = search ? `?${search}` : ''
  try {
    const res = await apiGet<{ products?: JewelryProduct[]; total?: number }>(`/products/shapes${query}`)
    const arr = (res as { products?: JewelryProduct[] })?.products
    const total = (res as { total?: number })?.total ?? 0
    return { products: Array.isArray(arr) ? arr : [], total }
  } catch {
    return { products: [], total: 0 }
  }
}

export async function getProduct(id: string): Promise<JewelryProduct | null> {
  try {
    return await apiGet<JewelryProduct>(`/products/configure?product_id=${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}
