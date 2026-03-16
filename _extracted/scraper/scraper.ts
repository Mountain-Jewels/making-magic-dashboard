// © 2026 Mountain Jewels LLC. All rights reserved.

// ---------------------------------------------------------------------------
// Execution Plan types
// ---------------------------------------------------------------------------

export type PlanStatus = 'EMITTED' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'ABORTED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface CreatedBy {
  email: string
  role: string
}

export interface PlanScope {
  category: string
  jurisdiction: Record<string, unknown>
  population_band?: string
  domains: string[]
}

export interface PlanConstraints {
  max_pages: number
  max_signals: number
  max_runtime_minutes: number
  max_cost_usd: number
  concurrency_limit: number
}

export interface PlanSchedule {
  earliest_start: string
  latest_start: string
  time_window: string
  timezone: string
}

export interface PlanSafety {
  risk_level: RiskLevel
  requires_human_review: boolean
  kill_switch_group: string
}

export interface OptimizationSummary {
  estimated_cost_usd: number
  estimated_pages: number
  estimated_signals: number
  alternative_plans_considered: number
  confidence_score: number
}

export interface ExecutionPlan {
  plan_id: string
  intent_id: string
  template_id: string
  version: string
  created_by: CreatedBy
  created_at: string
  governance_approval_id: string
  policy_snapshot_hash: string
  scope: PlanScope
  constraints: PlanConstraints
  schedule: PlanSchedule
  safety: PlanSafety
  optimization_summary?: OptimizationSummary
  status: PlanStatus
}

export interface ExecutionPlanList {
  plans: ExecutionPlan[]
  total: number
}

export interface EmitExecutionPlanRequest {
  template_id: string
  governance_approval_id: string
  policy_snapshot_hash: string
  schedule: PlanSchedule
  safety: PlanSafety
  optimization_summary?: OptimizationSummary
}

export interface AISuggestion {
  id: string
  type: 'warning' | 'optimization' | 'info'
  title: string
  message: string
  auto_applicable: boolean
}

// ---------------------------------------------------------------------------
// Intent types
// ---------------------------------------------------------------------------

export interface Jurisdiction {
  state?: string
  county_fips?: string
  city?: string
  zip?: string
}

export interface ScrapeFilters {
  housing_value_min?: number
  housing_value_max?: number
  wealth_band?: string[]
  property_type?: string[]
  transaction_recency?: string
}

export interface ScrapeIntent {
  category: string
  jurisdiction: Jurisdiction[]
  filters: ScrapeFilters
  date_range: {
    lookback_days: number
  }
  mode: 'incremental' | 'full'
  operator_id: string
  intent_statement: string
  preview_hash?: string
  acknowledged: boolean
  timestamp: string
}

// ---------------------------------------------------------------------------
// Run types
// ---------------------------------------------------------------------------

export type RunStatus =
  | 'submitted'
  | 'approved'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rejected'

export interface RunSummary {
  run_id: string
  intent_id: string
  category: string
  jurisdiction_label: string
  status: RunStatus
  portals_resolved: number
  pages_scraped: number
  signals_found: number
  started_at: string
  completed_at?: string
  duration_seconds?: number
  errors: number
}

export interface RunDetail extends RunSummary {
  intent: {
    category: string
    jurisdiction: Record<string, string>[]
    filters: Record<string, unknown>
    intent_statement: string
    operator_id: string
  }
  events: RunEvent[]
}

export interface RunEvent {
  timestamp: string
  type: 'info' | 'warning' | 'error'
  message: string
  portal_id?: string
}

export interface Estimate {
  estimated_portals: number
  estimated_pages: number
  estimated_signals: number
  estimated_duration_seconds: number
  estimated_cost_usd: number
  legal_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  governance_version: string
  warnings: string[]
}

export interface RunReport {
  runId: string
  sourceType: string
  sourceName: string
  jurisdictionLabel: string
  stateCode: string | null
  countyName: string | null
  cityName: string | null
  ageRange: { min: number; max: number } | null
  eventType: string | null

  runDate: string
  dayOfWeek: string
  durationMinutes: number

  totalRecordsScraped: number
  directContacts: number
  directContactRate: number
  sentToEnrichment: number
  enrichedWithContact: number
  enrichmentSuccessRate: number
  totalUsable: number
  overallSuccessRate: number

  recordsWithEmail: number
  recordsWithPhone: number
  recordsWithAddress: number
  recordsWithName: number

  actualCostUsd: number

  qualityScore: number
}

export interface RunHistoryEntry extends RunSummary {
  report: RunReport
}

// ---------------------------------------------------------------------------
// Run-builder types
// ---------------------------------------------------------------------------

export type RunMode = 'BUILD' | 'BROWSE'

export interface AgeRange {
  min: number
  max: number
}

export type EventType =
  | 'BIRTHDAY'
  | 'WEDDING'
  | 'ANNIVERSARY'
  | 'HOME_PURCHASE'
  | 'BUSINESS_FILING'
  | 'LICENSE_RENEWAL'
  | 'GRADUATION'
  | 'RETIREMENT'

export interface EventOption {
  id: EventType
  label: string
  description: string
  lookaheadDays: number
  maxLookaheadDays: number
}

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface ScheduleSlot {
  day: DayOfWeek
  time: string
}

export interface EnrichmentEstimate {
  totalRecords: number
  matchRate: number
  ageDistribution: { bracket: string; count: number; pct: number }[]
  incomeDistribution: { bracket: string; count: number; pct: number }[]
  homeOwnershipRate: number
  eventForecast: { event: string; count: number; withinDays: number }[]
}

export interface CostEstimate {
  perRecordCost: number
  estimatedRecords: number
  apiCalls: number
  apiCostPerCall: number
  enrichmentCost: number
  storageCost: number
  totalEstimatedCost: number
  currency: 'USD'
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'PREMIUM'
  aiNotes: string[]
}

// ---------------------------------------------------------------------------
// Safety types
// ---------------------------------------------------------------------------

export type SwitchState = 'active' | 'killed'
export type CircuitState = 'closed' | 'open' | 'half_open'

export interface KillSwitchStatus {
  source_id: string
  category: string
  state: SwitchState
  killed_at?: string
  killed_by?: string
  reason?: string
}

export interface CircuitBreakerStatus {
  circuit_id: string
  category: string
  state: CircuitState
  failure_count: number
  last_failure_at?: string
  reset_at?: string
}

export interface SafetyStatus {
  global_kill: boolean
  switches: KillSwitchStatus[]
  circuits: CircuitBreakerStatus[]
}

// ---------------------------------------------------------------------------
// Source-matrix types
// ---------------------------------------------------------------------------

export type ParameterStatus = 'allowed' | 'disabled' | 'forbidden'

export interface ParameterConstraint {
  status: ParameterStatus
  reason?: string
  constraints?: Record<string, unknown>
  options?: string[]
  levels?: string[]
}

export interface SourceCategory {
  category: string
  version: string
  parameters: Record<string, ParameterConstraint>
}

export type SourceMatrix = SourceCategory[]

// ---------------------------------------------------------------------------
// Source-taxonomy types
// ---------------------------------------------------------------------------

export type JurisdictionLevel = 'FEDERAL' | 'STATE' | 'COUNTY' | 'CITY' | 'INSTITUTIONAL' | 'PRIVATE'
export type TaxonomyRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'RESTRICTED'
export type DataQuality = 'HIGH' | 'MODERATE' | 'LOW'
export type AutomationDifficulty = 'LOW' | 'MODERATE' | 'HIGH'

export interface DataSource {
  id: string
  name: string
  jurisdictionLevel: JurisdictionLevel
  accessMethod: string
  structuredApiAvailable: boolean
  bulkDownload: boolean
  authRequired: boolean
  dataQuality: DataQuality
  updateFrequency: string
  automationDifficulty: AutomationDifficulty
  riskLevel: TaxonomyRiskLevel
  requiresApproval: boolean
  retentionPolicy: string
  marketingAllowed: boolean
  dataTypes: string[]
  preferredAccess: string
  notes: string
}

export type SearchRunType =
  | 'FEDERAL_API_STRUCTURED'
  | 'FEDERAL_JUDICIAL_PORTAL'
  | 'STATE_BUSINESS_REGISTRY'
  | 'STATE_JUDICIAL_PORTAL'
  | 'COUNTY_PROPERTY_PORTAL'
  | 'PROFESSIONAL_LICENSE_VERIFICATION'
  | 'OPEN_DATA_AGGREGATE_PULL'
  | 'EDUCATION_PUBLIC_DIRECTORY'
  | 'MEDIA_RSS_MONITORING'

// ---------------------------------------------------------------------------
// Template types
// ---------------------------------------------------------------------------

export type SourceCategoryEnum =
  | 'PUBLIC_RECORDS'
  | 'COURTS'
  | 'GOVERNMENT_FILINGS'
  | 'EDUCATIONAL_INSTITUTIONS'
  | 'RELIGIOUS_INSTITUTIONS'
  | 'NEWS_MEDIA'
  | 'SOCIAL_MEDIA'
  | 'BUSINESS_REGISTRIES'
  | 'REAL_ESTATE_LISTINGS'
  | 'NON_PROFIT_DISCLOSURES'

export type PopulationBand = 'STATEWIDE' | 'COUNTY' | 'CITY'

export type TemplateStatus = 'NOT_DEPLOYED' | 'DEPLOYED' | 'PREVIOUSLY_DEPLOYED'

export interface TemplateJurisdiction {
  country: string
  state?: string
  county?: string
  city?: string
}

export interface TemplateScope {
  category: SourceCategoryEnum
  jurisdiction: TemplateJurisdiction
  population_band?: PopulationBand
  domains: string[]
}

export interface TemplateConstraints {
  max_pages: number
  max_signals: number
  max_runtime_minutes: number
  max_cost_usd: number
  concurrency_limit: number
}

export interface TemplateSchedule {
  time_window: string
  timezone: string
}

export interface SearchTemplate {
  template_id: string
  name: string
  description?: string
  scope: TemplateScope
  constraints: TemplateConstraints
  schedule: TemplateSchedule
  intent_statement: string
  status: TemplateStatus
  derived_from_template_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SearchTemplateList {
  templates: SearchTemplate[]
  total: number
}

export interface SearchTemplateCreate {
  name: string
  description?: string
  scope: TemplateScope
  constraints: TemplateConstraints
  schedule?: TemplateSchedule
  intent_statement: string
}

export interface SearchTemplateUpdate {
  name?: string
  description?: string
  scope?: TemplateScope
  constraints?: TemplateConstraints
  schedule?: TemplateSchedule
  intent_statement?: string
}

export interface DeriveTemplateRequest {
  new_name: string
  jurisdiction_override?: TemplateJurisdiction
  constraints_override?: TemplateConstraints
  schedule_override?: TemplateSchedule
}

// ---------------------------------------------------------------------------
// Search-types types
// ---------------------------------------------------------------------------

export type SearchGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

export type IntendedUse = 'ACQUISITION' | 'STORAGE' | 'ENRICHMENT' | 'MARKETING' | 'EXPORT'

export type SensitivityLevel = 'PII' | 'SENSITIVE' | 'PUBLIC' | 'AGGREGATE'

export type SearchTypeRiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type LuxuryTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE'

export interface SearchType {
  id: string
  group: SearchGroup
  label: string
  sensitivityLevel: SensitivityLevel
  allowedUses: IntendedUse[]
  minorRisk: boolean
}

export interface LifeEvent {
  id: string
  categoryId: number
  label: string
  riskLevel: SearchTypeRiskLevel
  minorFlag: boolean
  luxuryTier: LuxuryTier
  allowedUses: IntendedUse[]
}

export interface EventCategory {
  id: number
  label: string
  events: LifeEvent[]
}

export interface GovernanceCheck {
  status: 'PASS' | 'BLOCKED' | 'REVIEW'
  blockedItems: string[]
  warnings: string[]
  minorRiskDetected: boolean
  criticalRiskDetected: boolean
}

export const SEARCH_GROUP_LABELS: Record<SearchGroup, string> = {
  A: 'Identity & Entity Searches',
  B: 'Property & Financial Searches',
  C: 'Legal & Court Searches',
  D: 'Event-Based Searches',
  E: 'Economic & Demographic Searches',
  F: 'Institutional Searches',
  G: 'Commercial & Procurement Searches',
  H: 'Media & Sentiment Searches',
}

export const EVENT_CATEGORY_LABELS: Record<number, string> = {
  1: 'Religious & Cultural Ceremonies',
  2: 'Wedding & Relationship Events',
  3: 'Birth & Family Events',
  4: 'Education & Academic Milestones',
  5: 'Age-Based Milestones',
  6: 'Property & Financial Milestones',
  7: 'Business & Professional Events',
  8: 'Community & Social Events',
  9: 'Legal & Court Events',
  10: 'Health & Life Status Events',
  11: 'Government & Civic Events',
  12: 'Commercial & Consumer Signals',
  13: 'Digital & Social Signals',
}
