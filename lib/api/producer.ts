/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiPost } from '@/lib/api/client'

export const applyPolicy = (id: string) =>
  apiPost(`/producer/apply-policy/${id}`)

export const rollbackPolicy = (id: string) =>
  apiPost(`/producer/rollback-policy/${id}`)
