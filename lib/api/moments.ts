import { apiClient } from './client'
import { MomentIntent } from '@/lib/types/moment'

export async function getMoments(): Promise<MomentIntent[]> {
  return apiClient('/api/moments')
}

export async function getMoment(id: string): Promise<MomentIntent> {
  return apiClient(`/api/moments/${id}`)
}

export async function approveMoment(id: string): Promise<void> {
  return apiClient(`/api/moments/${id}/approve`, { method: 'POST' })
}

export async function rejectMoment(id: string, reason: string): Promise<void> {
  return apiClient(`/api/moments/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
}
