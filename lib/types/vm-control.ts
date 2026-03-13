export interface VmNode {
  id: string
  name: string
  status: string
  azure_power_state: string | null
  vm_role: string | null
  gpu_type: string | null
  ip_address: string | null
  queue_name: string | null
  schedule_mode: string
  schedule_json: Record<string, number[]> | null
  last_heartbeat: string | null
}

export interface VmNodeStatus {
  node_id: string
  node_name: string
  db_status: string
  azure_status: {
    power_state: string
    vm_name?: string
    resource_group?: string
    error?: string
    statuses?: { code: string; display_status: string }[]
  }
}

export interface VmOperationResult {
  node_id: string
  node_name: string
  operation: string
  result: Record<string, unknown>
}

export interface VmOperationsLogEntry {
  id: string
  operation: string
  triggered_by: string
  result: string | null
  details_json: Record<string, unknown> | null
  created_at: string
}

export type VmPowerAction = 'start' | 'stop' | 'deallocate' | 'restart'

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const

export type DayOfWeek = typeof DAYS_OF_WEEK[number]

export const STATUS_COLORS: Record<string, string> = {
  ready: '#22c55e',
  online: '#22c55e',
  busy: '#3b82f6',
  recovering: '#eab308',
  offline: '#6b7280',
  unknown: '#6b7280',
  error: '#ef4444',
}

export const POWER_STATE_COLORS: Record<string, string> = {
  running: '#22c55e',
  starting: '#eab308',
  stopping: '#f97316',
  deallocating: '#f97316',
  restarting: '#eab308',
  deallocated: '#6b7280',
  stopped: '#ef4444',
  unknown: '#6b7280',
}

export const GPU_LABELS: Record<string, string> = {
  T4: 'Tesla T4 (16GB)',
  A10: 'NVIDIA A10 (24GB)',
}
