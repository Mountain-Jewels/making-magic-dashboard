// ─── Source Matrix (mirrors governance core API shape) ───

export type ParameterStatus = 'allowed' | 'disabled' | 'forbidden'

export interface SourceCategory {
  id: string
  name: string
  description: string
  status: ParameterStatus
  jurisdiction_scope: string[]
  parameters: Record<string, ParameterStatus>
  max_lookback_days: number
  rate_limit_per_minute: number
  notes?: string
}

export interface SourceMatrix {
  version: string
  updated_at: string
  categories: SourceCategory[]
}

// ─── Scraper Engine ───

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'killed'

export interface ScraperRun {
  id: string
  category_id: string
  jurisdiction: {
    state: string
    county_fips?: string
    city?: string
    zip?: string
  }
  filters: Record<string, string | number | boolean | string[]>
  lookback_days: number
  intent_statement: string
  operator_id: string
  status: RunStatus
  portals_found: number
  pages_scraped: number
  signals_detected: number
  errors: number
  cost_usd: number
  started_at: string
  completed_at?: string
  duration_seconds?: number
}

export interface ScraperHealth {
  engine_status: 'healthy' | 'degraded' | 'down'
  active_runs: number
  queued_runs: number
  last_heartbeat: string
  uptime_hours: number
  total_runs_24h: number
  total_signals_24h: number
  total_cost_24h_usd: number
}

export interface SentinelStatus {
  id: string
  name: string
  type: 'cost' | 'legal' | 'capacity' | 'rate_limit'
  status: 'ok' | 'warning' | 'critical'
  message: string
  threshold?: string
  current?: string
}

// ─── Run Builder ───

export interface RunEstimate {
  estimated_portals: number
  estimated_pages: number
  estimated_signals: number
  estimated_duration_seconds: number
  estimated_cost_usd: number
  legal_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  governance_version: string
  warnings: string[]
}

export interface RunIntent {
  category_id: string
  jurisdiction: {
    state: string
    county_fips?: string
    city?: string
    zip?: string
  }
  filters: Record<string, string | number | boolean | string[]>
  lookback_days: number
  mode: 'full' | 'incremental'
  operator_id: string
  intent_statement: string
}

// ─── Safety ───

export type SafetyRailStatus = 'active' | 'tripped' | 'disabled'

export interface SafetyRail {
  id: string
  name: string
  type: 'kill_switch' | 'circuit_breaker'
  scope: 'global' | 'category'
  category_id?: string
  status: SafetyRailStatus
  tripped_at?: string
  tripped_by?: string
  reason?: string
}
