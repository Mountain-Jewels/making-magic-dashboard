/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost, apiUpload } from './client'

export interface MeshyTaskCreateResponse {
  task_id: string
}

export interface MeshyTask {
  task_id: string
  status: string
  result: Record<string, unknown> | null
}

export interface MeshyTaskList {
  tasks: Record<string, unknown>[]
  page: number
  page_size: number
}

export async function meshyImageTo3D(body: {
  image_url: string
  name?: string
  topology?: string
  target_polycount?: number
}): Promise<MeshyTaskCreateResponse> {
  return apiPost<MeshyTaskCreateResponse>('/v1/meshy/image-to-3d', body)
}

export async function meshyTextTo3D(body: {
  prompt: string
  art_style?: string
  topology?: string
  target_polycount?: number
}): Promise<MeshyTaskCreateResponse> {
  return apiPost<MeshyTaskCreateResponse>('/v1/meshy/text-to-3d', body)
}

export async function meshyGetTask(taskId: string): Promise<MeshyTask> {
  return apiGet<MeshyTask>(`/v1/meshy/tasks/${taskId}`)
}

export async function meshyListTasks(
  page = 1,
  pageSize = 20
): Promise<MeshyTaskList> {
  return apiGet<MeshyTaskList>(`/v1/meshy/tasks?page=${page}&page_size=${pageSize}`)
}

export async function uploadImageForMeshy(
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ url: string }> {
  return apiUpload<{ url: string }>('/v1/reference-images', file, 'file', {
    onProgress,
  })
}

/**
 * Convenience: upload an image file and immediately start a Meshy image-to-3D task.
 * Returns the task_id for polling.
 */
export async function uploadAndGenerateMesh(
  file: File,
  options?: {
    name?: string
    topology?: string
    target_polycount?: number
    onUploadProgress?: (loaded: number, total: number) => void
  },
): Promise<{ task_id: string; image_url: string } | null> {
  try {
    const upload = await uploadImageForMeshy(file, options?.onUploadProgress)
    if (!upload?.url) return null

    const task = await meshyImageTo3D({
      image_url: upload.url,
      name: options?.name,
      topology: options?.topology ?? 'quad',
      target_polycount: options?.target_polycount ?? 30000,
    })

    return { task_id: task.task_id, image_url: upload.url }
  } catch (err) {
    console.error('[meshy] uploadAndGenerateMesh failed:', err)
    return null
  }
}
