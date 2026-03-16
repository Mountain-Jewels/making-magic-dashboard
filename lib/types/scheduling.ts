/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export interface SchedulingRecommendation {
  id: string
  vm_role: string
  day_of_week: string
  recommended_hours: number[]
  confidence_source: 'industry_prior' | 'blended' | 'store_data'
  expected_weekly_cost: number | null
  status: 'pending' | 'approved' | 'rejected' | 'applied'
  approved_by: string | null
  created_at: string
}

export interface PerformanceSummary {
  data_weeks: number
  prior_weight: number
  data_weight: number
  confidence_level: 'industry_prior' | 'blended' | 'store_data'
  total_events_collected: number
  total_purchases: number
  pending_recommendations: number
}

export interface GeneratedRecommendation {
  vm_role: string
  day: string
  hours: number[]
  confidence: string
  weekly_cost: number
}

export const CONFIDENCE_COLORS: Record<string, string> = {
  industry_prior: '#3b82f6',
  blended: '#eab308',
  store_data: '#22c55e',
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  industry_prior: 'Industry Data',
  blended: 'Blended',
  store_data: 'Your Data',
}

export const STATUS_BADGE_COLORS: Record<string, string> = {
  pending: '#eab308',
  approved: '#22c55e',
  rejected: '#ef4444',
  applied: '#3b82f6',
}
