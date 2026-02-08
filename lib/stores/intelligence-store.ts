import { create } from 'zustand'
import type {
  SourceMatrix,
  ScraperHealth,
  ScraperRun,
  SentinelStatus,
  SafetyRail,
  RunIntent,
  RunEstimate,
} from '@/lib/types/intelligence'

interface IntelligenceStore {
  // Source Matrix (from governance)
  sourceMatrix: SourceMatrix
  // Engine health
  health: ScraperHealth
  // Sentinels
  sentinels: SentinelStatus[]
  // Runs
  runs: ScraperRun[]
  // Safety rails
  safetyRails: SafetyRail[]
  // Run builder draft
  runDraft: Partial<RunIntent>
  runEstimate: RunEstimate | null
  // Actions
  setRunDraft: (draft: Partial<RunIntent>) => void
  resetRunDraft: () => void
  setRunEstimate: (estimate: RunEstimate | null) => void
  addRun: (run: ScraperRun) => void
  updateRun: (id: string, updates: Partial<ScraperRun>) => void
  toggleSafetyRail: (id: string) => void
}

const MOCK_HEALTH: ScraperHealth = {
  engine_status: 'healthy',
  active_runs: 2,
  queued_runs: 1,
  last_heartbeat: new Date().toISOString(),
  uptime_hours: 168,
  total_runs_24h: 14,
  total_signals_24h: 4280,
  total_cost_24h_usd: 0.00,
}

const MOCK_SENTINELS: SentinelStatus[] = [
  { id: 'cost-daily', name: 'Daily Cost Limit', type: 'cost', status: 'ok', message: '$0.00 / $50.00', threshold: '$50.00', current: '$0.00' },
  { id: 'cost-monthly', name: 'Monthly Cost Limit', type: 'cost', status: 'ok', message: '$0.00 / $500.00', threshold: '$500.00', current: '$0.00' },
  { id: 'legal-coppa', name: 'COPPA Compliance', type: 'legal', status: 'ok', message: 'Age filter active: hard block < 13' },
  { id: 'legal-charter', name: 'Charter Compliance', type: 'legal', status: 'ok', message: 'No identity resolution, no contact discovery' },
  { id: 'capacity-queue', name: 'Queue Capacity', type: 'capacity', status: 'warning', message: '3 of 5 slots used', threshold: '5', current: '3' },
  { id: 'rate-global', name: 'Global Rate Limit', type: 'rate_limit', status: 'ok', message: '142 req/min of 500 max', threshold: '500/min', current: '142/min' },
]

const MOCK_RUNS: ScraperRun[] = [
  {
    id: 'run-001',
    category_id: 'PUBLIC_RECORDS',
    jurisdiction: { state: 'CA', county_fips: '06037' },
    filters: { property_type: ['sfr', 'estate'], housing_value_min: 1000000 },
    lookback_days: 30,
    intent_statement: 'Weekly luxury property scan for LA County',
    operator_id: 'colin',
    status: 'completed',
    portals_found: 23,
    pages_scraped: 1180,
    signals_detected: 342,
    errors: 2,
    cost_usd: 0.00,
    started_at: '2026-02-07T08:00:00Z',
    completed_at: '2026-02-07T08:42:00Z',
    duration_seconds: 2520,
  },
  {
    id: 'run-002',
    category_id: 'COURTS',
    jurisdiction: { state: 'CA', county_fips: '06037' },
    filters: { record_type: 'marriage_license' },
    lookback_days: 14,
    intent_statement: 'Bi-weekly marriage license scan for LA County',
    operator_id: 'colin',
    status: 'running',
    portals_found: 5,
    pages_scraped: 89,
    signals_detected: 67,
    errors: 0,
    cost_usd: 0.00,
    started_at: '2026-02-08T04:00:00Z',
    duration_seconds: 0,
  },
  {
    id: 'run-003',
    category_id: 'NEWS_MEDIA',
    jurisdiction: { state: 'CA' },
    filters: { publication_type: 'newspaper', section: 'announcements' },
    lookback_days: 7,
    intent_statement: 'Weekly announcement scan across California newspapers',
    operator_id: 'colin',
    status: 'running',
    portals_found: 47,
    pages_scraped: 312,
    signals_detected: 156,
    errors: 1,
    cost_usd: 0.00,
    started_at: '2026-02-08T04:15:00Z',
    duration_seconds: 0,
  },
  {
    id: 'run-004',
    category_id: 'REAL_ESTATE_LISTINGS',
    jurisdiction: { state: 'NY', county_fips: '36061' },
    filters: { listing_status: 'sold', price_min: 2000000 },
    lookback_days: 30,
    intent_statement: 'Monthly luxury home closings in Manhattan',
    operator_id: 'colin',
    status: 'queued',
    portals_found: 0,
    pages_scraped: 0,
    signals_detected: 0,
    errors: 0,
    cost_usd: 0.00,
    started_at: '2026-02-08T05:00:00Z',
  },
  {
    id: 'run-005',
    category_id: 'EDUCATIONAL_INSTITUTIONS',
    jurisdiction: { state: 'MA' },
    filters: { institution_type: 'university', event_type: 'graduation' },
    lookback_days: 30,
    intent_statement: 'Monthly graduation announcement scan — Massachusetts universities',
    operator_id: 'colin',
    status: 'failed',
    portals_found: 12,
    pages_scraped: 45,
    signals_detected: 0,
    errors: 12,
    cost_usd: 0.00,
    started_at: '2026-02-06T10:00:00Z',
    completed_at: '2026-02-06T10:08:00Z',
    duration_seconds: 480,
  },
]

const MOCK_SOURCE_MATRIX: SourceMatrix = {
  version: '1.0.0',
  updated_at: '2026-02-07T00:00:00Z',
  categories: [
    { id: 'PUBLIC_RECORDS', name: 'Public Records', description: 'Property transfers, deeds, liens, assessments', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { property_type: 'allowed', housing_value_min: 'allowed', housing_value_max: 'allowed', wealth_band: 'allowed', recency_days: 'allowed', identity_resolution: 'forbidden', contact_discovery: 'forbidden' }, max_lookback_days: 365, rate_limit_per_minute: 60 },
    { id: 'COURTS', name: 'Court Records', description: 'Marriage licenses, divorce filings, probate, name changes', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { record_type: 'allowed', recency_days: 'allowed', identity_resolution: 'forbidden', contact_discovery: 'forbidden' }, max_lookback_days: 180, rate_limit_per_minute: 30 },
    { id: 'GOVERNMENT_FILINGS', name: 'Government Filings', description: 'Business registrations, UCC filings, professional licenses', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { filing_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 365, rate_limit_per_minute: 30 },
    { id: 'EDUCATIONAL_INSTITUTIONS', name: 'Educational Institutions', description: 'Graduation announcements, dean\'s lists, alumni records', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { institution_type: 'allowed', event_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 90, rate_limit_per_minute: 20 },
    { id: 'RELIGIOUS_INSTITUTIONS', name: 'Religious Institutions', description: 'Wedding announcements, community event postings', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { event_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 90, rate_limit_per_minute: 10 },
    { id: 'NEWS_MEDIA', name: 'News Media', description: 'Local newspapers, magazines, community publications', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { publication_type: 'allowed', section: 'allowed', recency_days: 'allowed' }, max_lookback_days: 30, rate_limit_per_minute: 60 },
    { id: 'SOCIAL_MEDIA', name: 'Social Media', description: 'Platform-specific public posts', status: 'disabled', jurisdiction_scope: ['USA'], parameters: { platform: 'disabled', event_type: 'disabled' }, max_lookback_days: 7, rate_limit_per_minute: 10, notes: 'Disabled pending platform TOS review and legal approval' },
    { id: 'BUSINESS_REGISTRIES', name: 'Business Registries', description: 'Secretary of state filings, new business registrations', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { entity_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 365, rate_limit_per_minute: 30 },
    { id: 'REAL_ESTATE_LISTINGS', name: 'Real Estate Listings', description: 'Property sales, new purchases, home closings', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { listing_status: 'allowed', price_min: 'allowed', price_max: 'allowed', property_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 90, rate_limit_per_minute: 30 },
    { id: 'NON_PROFIT_DISCLOSURES', name: 'Non-Profit Disclosures', description: 'IRS 990 filings, charitable organization records', status: 'allowed', jurisdiction_scope: ['USA'], parameters: { org_type: 'allowed', recency_days: 'allowed' }, max_lookback_days: 365, rate_limit_per_minute: 20 },
  ],
}

const MOCK_SAFETY_RAILS: SafetyRail[] = [
  { id: 'kill-global', name: 'Global Kill Switch', type: 'kill_switch', scope: 'global', status: 'active' },
  { id: 'kill-social', name: 'Social Media Kill', type: 'kill_switch', scope: 'category', category_id: 'SOCIAL_MEDIA', status: 'tripped', tripped_at: '2026-02-01T00:00:00Z', tripped_by: 'colin', reason: 'Pending TOS review' },
  { id: 'cb-public-records', name: 'Public Records Circuit Breaker', type: 'circuit_breaker', scope: 'category', category_id: 'PUBLIC_RECORDS', status: 'active' },
  { id: 'cb-courts', name: 'Courts Circuit Breaker', type: 'circuit_breaker', scope: 'category', category_id: 'COURTS', status: 'active' },
  { id: 'cb-news', name: 'News Media Circuit Breaker', type: 'circuit_breaker', scope: 'category', category_id: 'NEWS_MEDIA', status: 'active' },
  { id: 'cb-real-estate', name: 'Real Estate Circuit Breaker', type: 'circuit_breaker', scope: 'category', category_id: 'REAL_ESTATE_LISTINGS', status: 'active' },
]

export const useIntelligenceStore = create<IntelligenceStore>((set) => ({
  sourceMatrix: MOCK_SOURCE_MATRIX,
  health: MOCK_HEALTH,
  sentinels: MOCK_SENTINELS,
  runs: MOCK_RUNS,
  safetyRails: MOCK_SAFETY_RAILS,
  runDraft: {},
  runEstimate: null,
  setRunDraft: (draft) => set((state) => ({ runDraft: { ...state.runDraft, ...draft } })),
  resetRunDraft: () => set({ runDraft: {}, runEstimate: null }),
  setRunEstimate: (estimate) => set({ runEstimate: estimate }),
  addRun: (run) => set((state) => ({ runs: [run, ...state.runs] })),
  updateRun: (id, updates) =>
    set((state) => ({
      runs: state.runs.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  toggleSafetyRail: (id) =>
    set((state) => ({
      safetyRails: state.safetyRails.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === 'active' ? 'tripped' : 'active',
              tripped_at: r.status === 'active' ? new Date().toISOString() : undefined,
              tripped_by: r.status === 'active' ? 'colin' : undefined,
            }
          : r
      ),
    })),
}))
