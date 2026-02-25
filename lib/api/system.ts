/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet } from './client'

export interface SystemOverview {
  total_jobs: number
  total_executions: number
  failure_rate: number
  avg_latency_ms: number
  drifted_agents: number
  active_suggestions: number
}

export interface SystemTelemetryRow {
  agent_type: string
  executions: number
  failures: number
  success_rate: number
  avg_latency_ms: number
}

export interface SystemPolicyRow {
  agent_type: string
  current_weight: number
  deviation: number
  adjustment_count: number
  drift: boolean
}

export interface SystemSuggestionRow {
  suggestion_id: string
  agent_type: string
  current_weight: number
  suggested_weight: number
  delta: number
  reason: string | null
  metric_value: number
  created_at: string | null
}

export interface SystemHistoryRow {
  application_id: string
  suggestion_id: string | null
  agent_type: string
  previous_weight: number
  applied_weight: number
  applied_at: string | null
}

export const fetchSystemOverview = () =>
  apiGet<SystemOverview>('/system/overview')

export const fetchSystemTelemetry = () =>
  apiGet<SystemTelemetryRow[]>('/system/telemetry')

export const fetchSystemPolicy = () =>
  apiGet<SystemPolicyRow[]>('/system/policy')

export const fetchSystemSuggestions = () =>
  apiGet<SystemSuggestionRow[]>('/system/suggestions')

export const fetchSystemHistory = () =>
  apiGet<SystemHistoryRow[]>('/system/history')
