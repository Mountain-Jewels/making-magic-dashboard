// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'
import type { ScrapeIntent, RunSummary, RunDetail, Estimate } from '@/lib/types/scraper'

export const getEstimate = (intent: Partial<ScrapeIntent>) =>
  scraperFetch<Estimate>('/scraper/estimate', {
    method: 'POST',
    body: JSON.stringify(intent),
  })

export const submitIntent = (intent: ScrapeIntent) =>
  scraperFetch<{ intent_id: string }>('/scraper/intents', {
    method: 'POST',
    body: JSON.stringify(intent),
  })

export const getRuns = (params?: { limit?: number; offset?: number }) =>
  scraperFetch<RunSummary[]>(`/scraper/runs?limit=${params?.limit || 20}&offset=${params?.offset || 0}`)

export const getRunDetail = (id: string) =>
  scraperFetch<RunDetail>(`/scraper/runs/${id}`)

export const cancelRun = (id: string) =>
  scraperFetch<void>(`/scraper/runs/${id}/cancel`, { method: 'POST' })

export const getHealth = () =>
  scraperFetch<{ status: string; uptime_seconds: number; active_runs: number }>('/scraper/health')
