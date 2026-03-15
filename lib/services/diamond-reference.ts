/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Diamond size reference service.
 * Provides mm dimensions for a given shape and carat weight.
 * Tries the backend API first, falls back to the static table.
 */

import { getDiamondSize } from '@/lib/api/products'
import { DIAMOND_SIZE_TABLE, type DiamondSizeEntry } from '@/lib/types/guardrails'

export interface DiamondDimensions {
  shape: string
  carat: number
  length_mm: number
  width_mm: number
  depth_mm: number
  source: 'api' | 'table' | 'interpolated'
}

function lookupFromTable(shape: string, carat: number): DiamondSizeEntry | null {
  const normalized = shape.toLowerCase()
  return DIAMOND_SIZE_TABLE.find(
    (e) => e.shape === normalized && e.carat === carat
  ) ?? null
}

function interpolateFromTable(shape: string, carat: number): DiamondDimensions | null {
  const normalized = shape.toLowerCase()
  const entries = DIAMOND_SIZE_TABLE.filter((e) => e.shape === normalized).sort(
    (a, b) => a.carat - b.carat
  )
  if (entries.length === 0) return null

  if (carat <= entries[0].carat) {
    const e = entries[0]
    return { shape: normalized, carat, length_mm: e.length_mm, width_mm: e.width_mm, depth_mm: e.depth_mm, source: 'interpolated' }
  }
  if (carat >= entries[entries.length - 1].carat) {
    const e = entries[entries.length - 1]
    return { shape: normalized, carat, length_mm: e.length_mm, width_mm: e.width_mm, depth_mm: e.depth_mm, source: 'interpolated' }
  }

  let lower = entries[0]
  let upper = entries[1]
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].carat >= carat) {
      lower = entries[i - 1]
      upper = entries[i]
      break
    }
  }

  const ratio = (carat - lower.carat) / (upper.carat - lower.carat)
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * ratio) * 10) / 10

  return {
    shape: normalized,
    carat,
    length_mm: lerp(lower.length_mm, upper.length_mm),
    width_mm: lerp(lower.width_mm, upper.width_mm),
    depth_mm: lerp(lower.depth_mm, upper.depth_mm),
    source: 'interpolated',
  }
}

export async function lookupDiamondSize(
  shape: string,
  carat: number
): Promise<DiamondDimensions> {
  try {
    const res = await getDiamondSize(shape, carat)
    return {
      shape: res.shape,
      carat: res.carat,
      length_mm: res.length_mm,
      width_mm: res.width_mm,
      depth_mm: res.depth_mm ?? 0,
      source: 'api',
    }
  } catch {
    // API unavailable — use static table
  }

  const exact = lookupFromTable(shape, carat)
  if (exact) {
    return { ...exact, source: 'table' }
  }

  const interpolated = interpolateFromTable(shape, carat)
  if (interpolated) return interpolated

  return { shape, carat, length_mm: 0, width_mm: 0, depth_mm: 0, source: 'table' }
}

export function lookupDiamondSizeSync(shape: string, carat: number): DiamondDimensions {
  const exact = lookupFromTable(shape, carat)
  if (exact) return { ...exact, source: 'table' }

  const interpolated = interpolateFromTable(shape, carat)
  if (interpolated) return interpolated

  return { shape, carat, length_mm: 0, width_mm: 0, depth_mm: 0, source: 'table' }
}

export function getAvailableCarats(shape: string): number[] {
  return DIAMOND_SIZE_TABLE
    .filter((e) => e.shape === shape.toLowerCase())
    .map((e) => e.carat)
}
