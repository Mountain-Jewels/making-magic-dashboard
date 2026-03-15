/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Shirt,
  MessageCircle,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import type { AvatarBrain, SkillProficiency, ImprovementItem } from '@/lib/types/avatar-brain'

interface AvatarBrainPanelProps {
  metahumanId: string
  metahumanName: string
}

export function AvatarBrainPanel({ metahumanId, metahumanName }: AvatarBrainPanelProps) {
  const { loadBrain, brains } = useAvatarBrainStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'memory' | 'improvements'>('overview')

  useEffect(() => {
    loadBrain(metahumanId, metahumanName)
  }, [metahumanId, metahumanName, loadBrain])

  const brain = brains[metahumanId]
  if (!brain) {
    return (
      <div className="p-3 text-[11px] text-white/20 text-center">
        Loading brain...
      </div>
    )
  }

  const tabCls = (active: boolean) =>
    `px-2 py-1 rounded text-[10px] font-medium transition-colors ${
      active ? 'bg-gold/10 text-gold' : 'text-white/35 hover:text-white/60'
    }`

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3">
        <Brain className="h-4 w-4 text-gold" />
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">
            {metahumanName}&apos;s Brain
          </h3>
          <p className="text-[9px] text-white/25">
            {brain.total_interactions} interactions · confidence {Math.round(brain.self_assessment.confidence_overall * 100)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3">
        <button onClick={() => setActiveTab('overview')} className={tabCls(activeTab === 'overview')}>Overview</button>
        <button onClick={() => setActiveTab('skills')} className={tabCls(activeTab === 'skills')}>Skills</button>
        <button onClick={() => setActiveTab('memory')} className={tabCls(activeTab === 'memory')}>Memory</button>
        <button onClick={() => setActiveTab('improvements')} className={tabCls(activeTab === 'improvements')}>
          Improve
          {brain.self_assessment.improvement_queue.length > 0 && (
            <span className="ml-1 px-1 py-0.5 bg-gold/20 text-gold text-[8px] rounded">
              {brain.self_assessment.improvement_queue.filter((i) => i.status !== 'mastered').length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {activeTab === 'overview' && <OverviewTab brain={brain} />}
        {activeTab === 'skills' && <SkillsTab brain={brain} />}
        {activeTab === 'memory' && <MemoryTab brain={brain} />}
        {activeTab === 'improvements' && <ImprovementsTab brain={brain} />}
      </div>
    </div>
  )
}

function OverviewTab({ brain }: { brain: AvatarBrain }) {
  const activeDomains = brain.domains.filter((d) => d.total_interactions > 0)
  return (
    <div className="space-y-3">
      {/* Sales stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Sessions" value={String(brain.sales_memory.total_sessions)} />
        <StatCard label="Conversion" value={`${Math.round(brain.sales_memory.conversion_rate * 100)}%`} />
        <StatCard label="Avg Duration" value={`${Math.round(brain.sales_memory.avg_session_duration_sec)}s`} />
      </div>

      {/* Domain proficiency */}
      {activeDomains.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[9px] text-white/30 uppercase tracking-wide">Domain Expertise</p>
          {activeDomains.map((d) => (
            <div key={d.domain} className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 w-20 capitalize">{d.domain}</span>
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold/60 rounded-full transition-all"
                  style={{ width: `${Math.min(100, d.proficiency * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-white/30 w-8 text-right">{Math.round(d.proficiency * 100)}%</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-white/20 text-center py-2">
          No interactions yet — brain is learning...
        </p>
      )}

      {/* Self assessment */}
      {brain.self_assessment.strengths.length > 0 && (
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-wide mb-1">Self-Identified Strengths</p>
          <div className="flex flex-wrap gap-1">
            {brain.self_assessment.strengths.map((s, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-success/10 text-success text-[9px] rounded">{s}</span>
            ))}
          </div>
        </div>
      )}
      {brain.self_assessment.weaknesses.length > 0 && (
        <div>
          <p className="text-[9px] text-white/30 uppercase tracking-wide mb-1">Areas for Growth</p>
          <div className="flex flex-wrap gap-1">
            {brain.self_assessment.weaknesses.map((w, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-gold/10 text-gold text-[9px] rounded">{w}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SkillsTab({ brain }: { brain: AvatarBrain }) {
  return (
    <div className="space-y-1.5">
      {brain.skills.map((sk) => (
        <SkillRow key={sk.skill} skill={sk} />
      ))}
    </div>
  )
}

function SkillRow({ skill }: { skill: SkillProficiency }) {
  const TrendIcon = skill.trend === 'improving' ? TrendingUp : skill.trend === 'declining' ? TrendingDown : Minus
  const trendColor = skill.trend === 'improving' ? 'text-success' : skill.trend === 'declining' ? 'text-error' : 'text-white/20'

  return (
    <div className="flex items-center gap-2 p-1.5 rounded bg-surface hover:bg-surface-panel transition-colors">
      <span className="text-[10px] text-white/50 w-28 truncate">{skill.skill}</span>
      <div className="flex-1 h-1.5 bg-surface-panel rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${skill.score * 100}%`,
            backgroundColor: skill.score > 0.7 ? '#22c55e' : skill.score > 0.4 ? '#d4a017' : '#ef4444',
          }}
        />
      </div>
      <span className="text-[9px] text-white/30 w-8 text-right">{Math.round(skill.score * 100)}%</span>
      <TrendIcon className={`h-3 w-3 shrink-0 ${trendColor}`} />
      <span className="text-[8px] text-white/20 w-6 text-right">{skill.sessions_evaluated}</span>
    </div>
  )
}

function MemoryTab({ brain }: { brain: AvatarBrain }) {
  const [openSection, setOpenSection] = useState<string | null>('lighting')

  const sections = [
    { id: 'lighting', label: 'Lighting', icon: Sun, data: brain.lighting_memory },
    { id: 'fashion', label: 'Fashion', icon: Shirt, data: brain.fashion_memory },
    { id: 'conversation', label: 'Conversation', icon: MessageCircle, data: brain.conversation_memory },
    { id: 'sales', label: 'Sales', icon: DollarSign, data: brain.sales_memory },
  ]

  return (
    <div className="space-y-1">
      {sections.map((sec) => {
        const open = openSection === sec.id
        const Icon = sec.icon
        return (
          <div key={sec.id} className="border border-surface-border rounded overflow-hidden">
            <button
              onClick={() => setOpenSection(open ? null : sec.id)}
              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-white/3 transition-colors"
            >
              <Icon className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-medium text-white/50 flex-1 text-left">{sec.label}</span>
              {open ? <ChevronDown className="h-3 w-3 text-white/20" /> : <ChevronRight className="h-3 w-3 text-white/20" />}
            </button>
            {open && (
              <div className="px-2 pb-2 border-t border-surface-border pt-1.5">
                <MemoryContent sectionId={sec.id} brain={brain} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MemoryContent({ sectionId, brain }: { sectionId: string; brain: AvatarBrain }) {
  if (sectionId === 'lighting') {
    const lm = brain.lighting_memory
    const topPresets = Object.entries(lm.preferred_presets).sort(([, a], [, b]) => b - a).slice(0, 5)
    return (
      <div className="space-y-1.5">
        {topPresets.length > 0 ? (
          <>
            <p className="text-[9px] text-white/30">Preferred Presets</p>
            {topPresets.map(([preset, score]) => (
              <div key={preset} className="flex items-center justify-between text-[10px]">
                <span className="text-white/50 capitalize">{preset.replace(/_/g, ' ')}</span>
                <span className={`font-mono ${score > 0 ? 'text-success' : 'text-error'}`}>{score > 0 ? '+' : ''}{score}</span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-[10px] text-white/20">No lighting preferences learned yet</p>
        )}
        {lm.skin_tone_learnings.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Skin Tone Notes</p>
            {lm.skin_tone_learnings.map((n, i) => (
              <p key={i} className="text-[10px] text-white/40">{n}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (sectionId === 'fashion') {
    const fm = brain.fashion_memory
    const topApproved = Object.entries(fm.approved_styles).sort(([, a], [, b]) => b - a).slice(0, 5)
    return (
      <div className="space-y-1.5">
        {topApproved.length > 0 ? (
          <>
            <p className="text-[9px] text-white/30">Approved Styles</p>
            {topApproved.map(([style, count]) => (
              <div key={style} className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">{style}</span>
                <span className="text-success font-mono">{count}x</span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-[10px] text-white/20">No fashion preferences learned yet</p>
        )}
        {fm.wardrobe_gaps.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Wardrobe Gaps</p>
            {fm.wardrobe_gaps.map((g, i) => (
              <p key={i} className="text-[10px] text-gold/50">{g}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (sectionId === 'conversation') {
    const cm = brain.conversation_memory
    return (
      <div className="space-y-1.5">
        {cm.unanswered_questions.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Questions I Couldn&apos;t Answer</p>
            {cm.unanswered_questions.slice(0, 5).map((q, i) => (
              <p key={i} className="text-[10px] text-gold/50 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                {q}
              </p>
            ))}
          </div>
        )}
        {cm.common_objections.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Objections Handled</p>
            {cm.common_objections.slice(0, 3).map((o, i) => (
              <div key={i} className="text-[10px]">
                <span className="text-white/40">{o.objection}</span>
                <span className="text-white/20"> → </span>
                <span className="text-white/50">{o.best_response}</span>
                <span className="text-[8px] text-success ml-1">{Math.round(o.success_rate * 100)}%</span>
              </div>
            ))}
          </div>
        )}
        {cm.unanswered_questions.length === 0 && cm.common_objections.length === 0 && (
          <p className="text-[10px] text-white/20">No conversation memories yet</p>
        )}
      </div>
    )
  }

  if (sectionId === 'sales') {
    const sm = brain.sales_memory
    return (
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-[10px]">
            <span className="text-white/30">Conversion</span>
            <p className="text-white/60 font-mono">{Math.round(sm.conversion_rate * 100)}%</p>
          </div>
          <div className="text-[10px]">
            <span className="text-white/30">Sessions</span>
            <p className="text-white/60 font-mono">{sm.total_sessions}</p>
          </div>
        </div>
        {sm.abandonment_triggers.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Why Customers Left</p>
            {sm.abandonment_triggers.slice(0, 3).map((t, i) => (
              <p key={i} className="text-[10px] text-error/60">{t}</p>
            ))}
          </div>
        )}
        {sm.closing_techniques.length > 0 && (
          <div>
            <p className="text-[9px] text-white/30">Best Closing Techniques</p>
            {sm.closing_techniques.sort((a, b) => b.success_rate - a.success_rate).slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">{t.technique}</span>
                <span className="text-success font-mono">{Math.round(t.success_rate * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

function ImprovementsTab({ brain }: { brain: AvatarBrain }) {
  const queue = brain.self_assessment.improvement_queue.filter((i) => i.status !== 'mastered')
  const mastered = brain.self_assessment.improvement_queue.filter((i) => i.status === 'mastered')

  return (
    <div className="space-y-2">
      {queue.length === 0 && mastered.length === 0 ? (
        <p className="text-[10px] text-white/20 text-center py-2">
          No improvement items yet — brain identifies areas for growth after interactions
        </p>
      ) : (
        <>
          {queue.map((item) => (
            <ImprovementRow key={item.id} item={item} />
          ))}
          {mastered.length > 0 && (
            <div>
              <p className="text-[9px] text-success/50 uppercase tracking-wide mb-1">Mastered</p>
              {mastered.map((item) => (
                <ImprovementRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ImprovementRow({ item }: { item: ImprovementItem }) {
  const statusColors: Record<string, string> = {
    identified: 'bg-gold/10 text-gold',
    learning: 'bg-blue-500/10 text-blue-400',
    improved: 'bg-success/10 text-success',
    mastered: 'bg-success/20 text-success',
  }

  return (
    <div className="p-2 rounded border border-surface-border bg-surface">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/50 capitalize">{item.domain}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded ${statusColors[item.status] || 'text-white/30'}`}>
          {item.status}
        </span>
      </div>
      <p className="text-[10px] text-white/60">{item.description}</p>
      {item.attempts > 0 && (
        <p className="text-[8px] text-white/20 mt-0.5">{item.attempts} attempt{item.attempts !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded bg-surface border border-surface-border text-center">
      <p className="text-[9px] text-white/30">{label}</p>
      <p className="text-[12px] font-mono text-white/70">{value}</p>
    </div>
  )
}
