/**
 * Jewelry API — Shopify product data
 */

import { apiGet } from './client'
import type { JewelryCategory, JewelryProduct } from './types'

export async function getCategories(): Promise<JewelryCategory[]> {
  const res = await apiGet<{ categories?: JewelryCategory[] }>('/jewelry/categories')
  const arr = (res as { categories?: JewelryCategory[] })?.categories
  return Array.isArray(arr) ? arr : []
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
  const res = await apiGet<{ products?: JewelryProduct[]; total?: number }>(`/jewelry/products${query}`)
  const arr = (res as { products?: JewelryProduct[] })?.products
  const total = (res as { total?: number })?.total ?? 0
  return { products: Array.isArray(arr) ? arr : [], total }
}

export async function getProduct(id: string): Promise<JewelryProduct> {
  return apiGet<JewelryProduct>(`/jewelry/${encodeURIComponent(id)}`)
}
