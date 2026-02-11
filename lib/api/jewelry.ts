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

export async function getProducts(params?: {
  category?: string
  shape?: string
  carat?: string
}): Promise<JewelryProduct[]> {
  const search = new URLSearchParams(params as Record<string, string>).toString()
  const query = search ? `?${search}` : ''
  const res = await apiGet<{ products?: JewelryProduct[] }>(`/jewelry/products${query}`)
  const arr = (res as { products?: JewelryProduct[] })?.products
  return Array.isArray(arr) ? arr : []
}

export async function getProduct(id: string): Promise<JewelryProduct> {
  return apiGet<JewelryProduct>(`/jewelry/${id}`)
}
