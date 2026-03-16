// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'
import type {
  SearchTemplate,
  SearchTemplateList,
  SearchTemplateCreate,
  SearchTemplateUpdate,
  DeriveTemplateRequest,
  TemplateStatus,
} from '@/lib/types/scraper'

export const listTemplates = (params?: {
  status?: TemplateStatus
  limit?: number
  offset?: number
}) => {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.offset) search.set('offset', String(params.offset))
  const qs = search.toString()
  return scraperFetch<SearchTemplateList>(`/templates${qs ? `?${qs}` : ''}`)
}

export const getTemplate = (id: string) =>
  scraperFetch<SearchTemplate>(`/templates/${id}`)

export const createTemplate = (data: SearchTemplateCreate) =>
  scraperFetch<SearchTemplate>('/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateTemplate = (id: string, data: SearchTemplateUpdate) =>
  scraperFetch<SearchTemplate>(`/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deriveTemplate = (id: string, data: DeriveTemplateRequest) =>
  scraperFetch<SearchTemplate>(`/templates/${id}/derive`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getTemplateStatus = (id: string) =>
  scraperFetch<{ status: TemplateStatus }>(`/templates/${id}/status`)
