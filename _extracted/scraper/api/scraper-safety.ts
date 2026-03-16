// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'
import type { SafetyStatus } from '@/lib/types/scraper'

export const getSafetyStatus = () =>
  scraperFetch<SafetyStatus>('/scraper/safety')

export const killSource = (id: string, reason: string) =>
  scraperFetch<void>(`/scraper/kill/${id}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

export const killAll = (reason: string) =>
  scraperFetch<void>('/scraper/kill-all', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

export const reviveSource = (id: string) =>
  scraperFetch<void>(`/scraper/revive/${id}`, { method: 'POST' })

export const resetCircuit = (id: string) =>
  scraperFetch<void>(`/scraper/circuit/${id}/reset`, { method: 'POST' })
