/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from '@/lib/api/client'
import { getApiBaseUrl } from '@/lib/api/client'

// ─── Types ───

export interface CreateRenderBody {
  recipe_id: string
  target_environment: string
  resolution_x?: number
  resolution_y?: number
}

export interface CreateRenderResponse {
  render_id: string
  status: string
}

export interface RenderStatusResponse {
  render_id: string
  status: string
  progress?: number
  output_url?: string
}

export interface JobListItem {
  job_id?: string
  _state?: string
  _file?: string
  [key: string]: unknown
}

export interface JobsListResponse {
  count?: number
  jobs?: JobListItem[]
}

// ─── Renders ───

export async function createRender(body: CreateRenderBody): Promise<CreateRenderResponse> {
  return apiPost<CreateRenderResponse>('/v1/renders', {
    recipe_id: body.recipe_id,
    target_environment: body.target_environment,
    type: 'preview',
    ...(body.resolution_x != null && { resolution_x: body.resolution_x }),
    ...(body.resolution_y != null && { resolution_y: body.resolution_y }),
  })
}

export async function getRenderStatus(renderId: string): Promise<RenderStatusResponse> {
  const res = await apiGet<{
    render_id: string
    status: string
    progress?: number
    output_json?: { output_url?: string }
  }>(`/v1/renders/${renderId}`)
  return {
    render_id: res.render_id,
    status: res.status,
    progress: res.progress,
    output_url: res.output_json?.output_url,
  }
}

// ─── Jobs ───

export async function listJobs(): Promise<JobListItem[]> {
  const res = await apiGet<JobsListResponse>('/jobs/')
  return res?.jobs ?? []
}

export async function getJob(jobId: string): Promise<JobListItem> {
  return apiGet<JobListItem>(`/jobs/${jobId}`)
}

export function downloadJobOutput(jobId: string): void {
  const base = getApiBaseUrl()
  const url = `${base}/jobs/${jobId}/output`
  window.open(url, '_blank', 'noopener,noreferrer')
}
