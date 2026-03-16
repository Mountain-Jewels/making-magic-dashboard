// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'
import type { SourceMatrix, SourceCategory } from '@/lib/types/scraper'

export const getSourceMatrix = () =>
  scraperFetch<SourceMatrix>('/governance/source-matrix')

export const getSourceCategory = (category: string) =>
  scraperFetch<SourceCategory>(`/governance/source-matrix/${category}`)

export const getActivePolicy = () =>
  scraperFetch<{ version: string; updated_at: string }>('/governance/policies/active')
