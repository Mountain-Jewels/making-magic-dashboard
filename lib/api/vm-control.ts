/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost, apiPut } from './client'
import type {
  VmNode,
  VmNodeStatus,
  VmOperationResult,
  VmOperationsLogEntry,
  VmPowerAction,
} from '@/lib/types/vm-control'

export async function getNodes(): Promise<VmNode[]> {
  return apiGet<VmNode[]>('/v1/vm-control/nodes')
}

export async function getNodeStatus(nodeId: string): Promise<VmNodeStatus> {
  return apiGet<VmNodeStatus>(`/v1/vm-control/nodes/${nodeId}/status`)
}

export async function vmPowerAction(
  nodeId: string,
  action: VmPowerAction
): Promise<VmOperationResult> {
  return apiPost<VmOperationResult>(`/v1/vm-control/nodes/${nodeId}/${action}`)
}

export async function updateNodeSchedule(
  nodeId: string,
  scheduleMode: string,
  scheduleJson: Record<string, number[]>
): Promise<VmNode> {
  return apiPut<VmNode>(`/v1/vm-control/nodes/${nodeId}/schedule`, {
    schedule_mode: scheduleMode,
    schedule_json: scheduleJson,
  })
}

export async function seedNodes(): Promise<{ created: string[]; skipped: string[] }> {
  return apiPost<{ created: string[]; skipped: string[] }>('/v1/vm-control/nodes/seed')
}

export async function getOperationsLog(
  nodeId: string,
  limit = 50
): Promise<VmOperationsLogEntry[]> {
  return apiGet<VmOperationsLogEntry[]>(
    `/v1/vm-control/nodes/${nodeId}/operations?limit=${limit}`
  )
}
