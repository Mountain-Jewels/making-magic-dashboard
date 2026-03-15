/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Per-avatar brain state management.
 *
 * Each avatar's brain is loaded on demand and cached locally.
 * When the backend doesn't have data yet, the store seeds a
 * blank brain that accumulates knowledge from dashboard interactions.
 */

import { create } from 'zustand'
import type {
  AvatarBrain,
  DomainMemory,
  SkillProficiency,
  SelfAssessment,
  ImprovementItem,
  LightingMemory,
  FashionMemory,
  ConversationMemory,
  SalesMemory,
} from '@/lib/types/avatar-brain'
import { getAvatarBrain } from '@/lib/api/avatar-brain'

const DOMAINS = ['lighting', 'fashion', 'conversation', 'sales', 'jewelry', 'camera', 'scene'] as const

function seedBrain(metahumanId: string, name: string): AvatarBrain {
  const now = new Date().toISOString()
  return {
    metahuman_id: metahumanId,
    metahuman_name: name,
    created_at: now,
    last_interaction: null,
    total_interactions: 0,
    domains: DOMAINS.map((d) => ({
      domain: d,
      entries: [],
      proficiency: 0,
      total_interactions: 0,
      last_updated: now,
    })),
    skills: [
      { skill: 'Greeting', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Product Knowledge', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Objection Handling', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Closing', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Lighting Instinct', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Fashion Sense', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
      { skill: 'Scene Composition', score: 0.5, trend: 'stable', sessions_evaluated: 0 },
    ],
    self_assessment: {
      timestamp: now,
      strengths: [],
      weaknesses: [],
      improvement_queue: [],
      confidence_overall: 0.5,
    },
    personality_evolution: [],
    lighting_memory: {
      preferred_presets: {},
      scene_preset_history: [],
      skin_tone_learnings: [],
      jewelry_lighting_notes: [],
    },
    fashion_memory: {
      approved_styles: {},
      rejected_styles: {},
      customer_compliments: [],
      wardrobe_gaps: [],
    },
    conversation_memory: {
      successful_openers: [],
      failed_approaches: [],
      common_objections: [],
      unanswered_questions: [],
    },
    sales_memory: {
      total_sessions: 0,
      sessions_with_purchase: 0,
      conversion_rate: 0,
      avg_session_duration_sec: 0,
      avg_engagement_score: 0,
      abandonment_triggers: [],
      closing_techniques: [],
    },
    recent_interactions: [],
  }
}

interface AvatarBrainStoreState {
  brains: Record<string, AvatarBrain>
  activeAvatarId: string | null
  loading: boolean

  loadBrain: (metahumanId: string, name: string) => Promise<AvatarBrain>
  setActiveAvatar: (metahumanId: string | null) => void
  getActiveBrain: () => AvatarBrain | null

  recordLightingChoice: (metahumanId: string, scene: string, preset: string, outcome: 'positive' | 'negative') => void
  recordFashionChoice: (metahumanId: string, style: string, approved: boolean) => void
  addImprovement: (metahumanId: string, item: Omit<ImprovementItem, 'id' | 'identified_at' | 'attempts'>) => void
  incrementInteraction: (metahumanId: string) => void
  updateSkill: (metahumanId: string, skill: string, delta: number) => void
  designCustomPiece: (metahumanId: string, design: { category: string; shape: string; metal: string; carat: number; customerId?: string; customerName?: string }) => void
}

export const useAvatarBrainStore = create<AvatarBrainStoreState>((set, get) => ({
  brains: {},
  activeAvatarId: null,
  loading: false,

  loadBrain: async (metahumanId: string, name: string) => {
    const existing = get().brains[metahumanId]
    if (existing) return existing

    set({ loading: true })
    const remote = await getAvatarBrain(metahumanId)
    const brain = remote || seedBrain(metahumanId, name)
    set((s) => ({
      brains: { ...s.brains, [metahumanId]: brain },
      loading: false,
    }))
    return brain
  },

  setActiveAvatar: (metahumanId) => set({ activeAvatarId: metahumanId }),

  getActiveBrain: () => {
    const { activeAvatarId, brains } = get()
    return activeAvatarId ? brains[activeAvatarId] ?? null : null
  },

  recordLightingChoice: (metahumanId, scene, preset, outcome) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      const lm = { ...brain.lighting_memory }
      lm.preferred_presets = { ...lm.preferred_presets }
      lm.preferred_presets[preset] = (lm.preferred_presets[preset] || 0) + (outcome === 'positive' ? 1 : -1)
      const historyEntry = lm.scene_preset_history.find((h) => h.scene === scene && h.preset === preset && h.outcome === outcome)
      if (historyEntry) {
        lm.scene_preset_history = lm.scene_preset_history.map((h) =>
          h.scene === scene && h.preset === preset && h.outcome === outcome
            ? { ...h, count: h.count + 1 }
            : h
        )
      } else {
        lm.scene_preset_history = [...lm.scene_preset_history, { scene, preset, outcome, count: 1 }]
      }
      return {
        brains: {
          ...s.brains,
          [metahumanId]: { ...brain, lighting_memory: lm },
        },
      }
    })
  },

  recordFashionChoice: (metahumanId, style, approved) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      const fm = { ...brain.fashion_memory }
      const target = approved ? 'approved_styles' : 'rejected_styles'
      fm[target] = { ...fm[target] }
      fm[target][style] = (fm[target][style] || 0) + 1
      return {
        brains: {
          ...s.brains,
          [metahumanId]: { ...brain, fashion_memory: fm },
        },
      }
    })
  },

  addImprovement: (metahumanId, item) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      const newItem: ImprovementItem = {
        ...item,
        id: crypto.randomUUID(),
        identified_at: new Date().toISOString(),
        attempts: 0,
      }
      return {
        brains: {
          ...s.brains,
          [metahumanId]: {
            ...brain,
            self_assessment: {
              ...brain.self_assessment,
              improvement_queue: [...brain.self_assessment.improvement_queue, newItem],
            },
          },
        },
      }
    })
  },

  incrementInteraction: (metahumanId) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      return {
        brains: {
          ...s.brains,
          [metahumanId]: {
            ...brain,
            total_interactions: brain.total_interactions + 1,
            last_interaction: new Date().toISOString(),
          },
        },
      }
    })
  },

  updateSkill: (metahumanId, skill, delta) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      return {
        brains: {
          ...s.brains,
          [metahumanId]: {
            ...brain,
            skills: brain.skills.map((sk) =>
              sk.skill === skill
                ? {
                    ...sk,
                    score: Math.max(0, Math.min(1, sk.score + delta)),
                    sessions_evaluated: sk.sessions_evaluated + 1,
                    trend: delta > 0 ? 'improving' : delta < 0 ? 'declining' : 'stable',
                  }
                : sk
            ),
          },
        },
      }
    })
  },

  designCustomPiece: (metahumanId, design) => {
    set((s) => {
      const brain = s.brains[metahumanId]
      if (!brain) return s
      const key = `custom_${design.category}_${design.shape}_${design.metal}`
      const fm = { ...brain.fashion_memory }
      fm.approved_styles = { ...fm.approved_styles }
      fm.approved_styles[key] = (fm.approved_styles[key] || 0) + 1

      const interaction: import('@/lib/types/avatar-brain').InteractionSummary = {
        session_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        customer_intent: `Custom ${design.category} design — ${design.carat}ct ${design.shape} in ${design.metal}`,
        avatar_response_quality: 1,
        conversion: false,
        duration_sec: 0,
        domains_activated: ['fashion', 'jewelry'],
        lessons: [`Designed ${design.carat}ct ${design.shape} ${design.category}${design.customerName ? ` for ${design.customerName}` : ''}`],
      }

      return {
        brains: {
          ...s.brains,
          [metahumanId]: {
            ...brain,
            fashion_memory: fm,
            total_interactions: brain.total_interactions + 1,
            last_interaction: new Date().toISOString(),
            recent_interactions: [...brain.recent_interactions.slice(-19), interaction],
          },
        },
      }
    })
  },
}))
