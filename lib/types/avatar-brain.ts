/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Avatar Brain — per-avatar autonomous intelligence model.
 *
 * Every MetaHuman accumulates its own knowledge, learns from its own
 * interactions, develops domain expertise, and self-identifies areas
 * for improvement.  This is not shared state — Rebecca's brain is
 * different from any other avatar's brain.
 */

export interface DomainMemory {
  domain: 'lighting' | 'fashion' | 'conversation' | 'sales' | 'jewelry' | 'camera' | 'scene'
  entries: MemoryEntry[]
  proficiency: number
  total_interactions: number
  last_updated: string
}

export interface MemoryEntry {
  id: string
  timestamp: string
  context: string
  action_taken: string
  outcome: 'positive' | 'negative' | 'neutral'
  lesson_learned: string
  confidence_delta: number
}

export interface SkillProficiency {
  skill: string
  score: number
  trend: 'improving' | 'stable' | 'declining'
  sessions_evaluated: number
  last_failure?: string
  best_performance?: string
}

export interface SelfAssessment {
  timestamp: string
  strengths: string[]
  weaknesses: string[]
  improvement_queue: ImprovementItem[]
  confidence_overall: number
}

export interface ImprovementItem {
  id: string
  domain: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'identified' | 'learning' | 'improved' | 'mastered'
  identified_at: string
  resolved_at?: string
  attempts: number
}

export interface InteractionSummary {
  session_id: string
  timestamp: string
  customer_intent: string
  avatar_response_quality: number
  conversion: boolean
  duration_sec: number
  domains_activated: string[]
  lessons: string[]
}

export interface PersonalityEvolution {
  trait: string
  initial_value: number
  current_value: number
  adjustments: { timestamp: string; delta: number; reason: string }[]
}

export interface LightingMemory {
  preferred_presets: Record<string, number>
  scene_preset_history: { scene: string; preset: string; outcome: 'positive' | 'negative'; count: number }[]
  skin_tone_learnings: string[]
  jewelry_lighting_notes: string[]
}

export interface FashionMemory {
  approved_styles: Record<string, number>
  rejected_styles: Record<string, number>
  customer_compliments: string[]
  wardrobe_gaps: string[]
}

export interface ConversationMemory {
  successful_openers: string[]
  failed_approaches: string[]
  common_objections: { objection: string; best_response: string; success_rate: number }[]
  unanswered_questions: string[]
}

export interface SalesMemory {
  total_sessions: number
  sessions_with_purchase: number
  conversion_rate: number
  avg_session_duration_sec: number
  avg_engagement_score: number
  abandonment_triggers: string[]
  closing_techniques: { technique: string; success_rate: number; uses: number }[]
}

export interface AvatarBrain {
  metahuman_id: string
  metahuman_name: string
  created_at: string
  last_interaction: string | null
  total_interactions: number

  domains: DomainMemory[]
  skills: SkillProficiency[]
  self_assessment: SelfAssessment
  personality_evolution: PersonalityEvolution[]

  lighting_memory: LightingMemory
  fashion_memory: FashionMemory
  conversation_memory: ConversationMemory
  sales_memory: SalesMemory

  recent_interactions: InteractionSummary[]
}
