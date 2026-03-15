/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/useAuth'
import {
  chatWithDirector,
  answerDirector,
  approveDirectorPlan,
  getDirectorState,
  resetDirector,
  getSimilarJobs,
} from '@/lib/api/director'
import type { DirectorMessage, PendingQuestion } from '@/lib/api/director'
import { listMetahumans } from '@/lib/api/metahumans'
import type { MetaHuman } from '@/lib/api/metahumans'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { AvatarBrainPanel } from '@/components/studio/AvatarBrainPanel'
import { useGuardrailsStore } from '@/lib/stores/guardrails-store'
import type { GuardrailCategory } from '@/lib/types/guardrails'
import { GUARDRAIL_CATEGORY_LABELS, GUARDRAIL_CATEGORY_DESCRIPTIONS, DIAMOND_SHAPES } from '@/lib/types/guardrails'
import { lookupDiamondSizeSync } from '@/lib/services/diamond-reference'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'

type DirectorTab =
  | 'chat'
  | 'knowledge'
  | 'intelligence'
  | 'training'
  | 'prompts'
  | 'sync'
  | 'rules'
  | 'sales'
  | 'testing'

const TABS: { id: DirectorTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'intelligence', label: 'Avatar Intelligence' },
  { id: 'training', label: 'Training' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'sync', label: 'Product Sync' },
  { id: 'rules', label: 'Context Rules' },
  { id: 'sales', label: 'Sales Intel' },
  { id: 'testing', label: 'A/B Testing' },
]

const STATE_COLORS: Record<string, string> = {
  idle: 'bg-white/30',
  listening: 'bg-blue-400',
  planning: 'bg-yellow-400',
  executing: 'bg-green-400',
  awaiting_approval: 'bg-yellow-400',
  error: 'bg-red-500',
}

const KNOWLEDGE_CATEGORIES = [
  'Product',
  'Brand',
  'Gemology',
  'Occasions',
  'Care',
]

const INPUT =
  'w-full bg-surface border border-surface-border rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'bg-gold text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gold-hover disabled:opacity-50 transition-colors'
const BTN_OUTLINE =
  'border border-surface-border text-white/70 text-sm font-medium rounded-md px-4 py-2 hover:text-white hover:border-white/30 transition-colors'

/* ────────────────────────── Chat Tab ────────────────────────── */

function ChatTab() {
  const [messages, setMessages] = useState<DirectorMessage[]>([])
  const [input, setInput] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [sending, setSending] = useState(false)
  const [directorState, setDirectorState] = useState('idle')
  const [currentJobId, setCurrentJobId] = useState<string | undefined>()
  const [pendingQuestions, setPendingQuestions] = useState<
    (string | PendingQuestion)[]
  >([])
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [latestIntent, setLatestIntent] = useState<
    Record<string, unknown> | undefined
  >()
  const [latestPlan, setLatestPlan] = useState<
    Record<string, unknown> | undefined
  >()
  const [similarJobs, setSimilarJobs] = useState<Array<{ job_id: string; distance?: number }>>([])
  const [confirmReset, setConfirmReset] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { userName } = useAuth()
  const { getActiveBrain, incrementInteraction } = useAvatarBrainStore()
  const { avatar, scene } = useSceneStateStore()

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  const refreshState = useCallback(async () => {
    try {
      const s = await getDirectorState()
      setDirectorState(s.state)
      setCurrentJobId(s.current_job_id)
      setPendingQuestions(s.pending_questions ?? [])
      if (s.messages?.length) {
        setMessages(s.messages)
        scrollToBottom()
      }
    } catch {
      /* silent */
    }
  }, [scrollToBottom])

  useEffect(() => {
    refreshState()
    const id = setInterval(refreshState, 10_000)
    return () => clearInterval(id)
  }, [refreshState])

  useEffect(() => {
    if (!currentJobId) { setSimilarJobs([]); return }
    getSimilarJobs(currentJobId)
      .then(setSimilarJobs)
      .catch(() => setSimilarJobs([]))
  }, [currentJobId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((p) => [...p, { role: 'user', content: text }])
    scrollToBottom()
    setSending(true)

    const brain = getActiveBrain()
    const contextPrefix = [
      avatar ? `[avatar:${avatar}]` : '',
      scene ? `[scene:${scene}]` : '',
      brain ? `[interactions:${brain.total_interactions}]` : '',
    ].filter(Boolean).join(' ')
    const fullMessage = contextPrefix ? `${contextPrefix} ${text}` : text

    try {
      const res = await chatWithDirector(fullMessage, sessionId)
      setSessionId(res.session_id || sessionId)
      setDirectorState(res.state)
      if (res.messages) setMessages(res.messages)
      else
        setMessages((p) => [
          ...p,
          { role: 'director', content: res.response },
        ])
      setPendingQuestions(res.questions ?? [])
      setLatestIntent(res.intent)
      setLatestPlan(res.plan)
      if (brain) incrementInteraction(brain.metahuman_id)
      scrollToBottom()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Chat failed')
    } finally {
      setSending(false)
    }
  }

  const handleAnswer = async () => {
    const text = answerInput.trim()
    if (!text || !sessionId) return
    setAnswerInput('')
    setSending(true)
    const firstQ = pendingQuestions[0]
    const field =
      typeof firstQ === 'string' ? firstQ : firstQ?.field ?? 'unknown'
    try {
      const res = await answerDirector(sessionId, text, {
        field,
        intent: latestIntent ?? {},
      })
      setDirectorState(res.state)
      if (res.messages) setMessages(res.messages)
      setPendingQuestions(res.questions ?? [])
      setLatestIntent(res.intent)
      setLatestPlan(res.plan)
      scrollToBottom()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Answer failed')
    } finally {
      setSending(false)
    }
  }

  const handleApprove = async () => {
    if (!sessionId || !latestPlan) return
    setSending(true)
    try {
      const res = await approveDirectorPlan(sessionId, latestPlan)
      toast.success(`Plan approved — Job ${res.job_id ?? 'submitted'}`)
      setDirectorState('executing')
      setLatestPlan(undefined)
      refreshState()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Approval failed')
    } finally {
      setSending(false)
    }
  }

  const handleReset = async () => {
    try {
      await resetDirector()
      setMessages([])
      setSessionId(undefined)
      setDirectorState('idle')
      setPendingQuestions([])
      setLatestIntent(undefined)
      setLatestPlan(undefined)
      setSimilarJobs([])
      toast.success('Director reset')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Reset failed')
    }
  }

  const stateColor = STATE_COLORS[directorState] ?? STATE_COLORS.idle

  return (
    <div className="flex flex-col gap-4">
      {/* State panel */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${stateColor}`} />
            <span className="text-sm text-white/70 capitalize">
              {directorState.replace(/_/g, ' ')}
            </span>
          </div>
          {currentJobId && (
            <span className="text-xs text-white/40">
              Job: <span className="text-white/70">{currentJobId}</span>
            </span>
          )}
          {pendingQuestions.length > 0 && (
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
              {pendingQuestions.length} pending question
              {pendingQuestions.length > 1 ? 's' : ''}
            </span>
          )}
          {userName && (
            <span className="text-xs text-white/30">
              Operator: <span className="text-white/60">{userName}</span>
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={refreshState} className={BTN_OUTLINE}>
              Refresh State
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="border border-red-500/40 text-red-400 text-sm font-medium rounded-md px-4 py-2 hover:bg-red-500/10 transition-colors"
            >
              Reset Director
            </button>
          </div>
        </div>
        {similarJobs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-surface-border">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Similar Past Jobs</p>
            <div className="flex flex-wrap gap-2">
              {similarJobs.map((j) => (
                <span key={j.job_id} className="rounded bg-surface px-2 py-1 text-xs text-white/60 border border-surface-border">
                  {j.job_id.slice(0, 8)}…
                  {j.distance != null && <span className="ml-1 text-white/30">({(1 - j.distance).toFixed(0)}% match)</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmReset}
        title="Reset Director"
        message="This will clear the entire session — messages, intent, and plan. Are you sure?"
        confirmLabel="Reset"
        destructive
        onConfirm={() => { setConfirmReset(false); handleReset() }}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Messages */}
      <Card className="flex flex-col" title="Conversation">
        <div
          ref={scrollRef}
          className="flex flex-col gap-3 overflow-y-auto max-h-[420px] pr-1"
        >
          {messages.length === 0 && (
            <EmptyState
              title="No messages yet"
              description="Send a message to start a conversation with the Director."
            />
          )}
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={i}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gold/10 text-white'
                      : 'bg-surface-border/40 text-white/90'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Pending questions answer input */}
      {pendingQuestions.length > 0 && (
        <Card>
          <div className="mb-2 text-xs text-yellow-300">
            Director is asking:{' '}
            {pendingQuestions
              .map((q) =>
                typeof q === 'string' ? q : q.question ?? q.field ?? ''
              )
              .join(' · ')}
          </div>
          <div className="flex gap-2">
            <input
              className={INPUT}
              placeholder="Your answer…"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
            />
            <button
              onClick={handleAnswer}
              disabled={sending || !answerInput.trim()}
              className={BTN_GOLD}
            >
              Answer
            </button>
          </div>
        </Card>
      )}

      {/* Approve plan */}
      {directorState === 'awaiting_approval' && latestPlan && (
        <Card>
          <div className="mb-2 text-sm text-white/70">
            The Director has a plan ready for approval.
          </div>
          <pre className="mb-3 max-h-40 overflow-auto rounded bg-surface p-3 text-xs text-white/60">
            {JSON.stringify(latestPlan, null, 2)}
          </pre>
          <button
            onClick={handleApprove}
            disabled={sending}
            className={BTN_GOLD}
          >
            Approve Plan
          </button>
        </Card>
      )}

      {/* Chat input */}
      <div className="flex gap-2">
        <input
          className={INPUT}
          placeholder="Tell the Director what to create…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className={BTN_GOLD}
        >
          Send
        </button>
      </div>
    </div>
  )
}

/* ────────────────────── Knowledge Base Tab ────────────────────── */

function KnowledgeTab() {
  const [entries] = useState([
    {
      title: 'Mountain Jewels Brand Guide',
      category: 'Brand',
      status: 'Active',
      date: '2026-02-15',
    },
    {
      title: 'Diamond Grading Standards',
      category: 'Gemology',
      status: 'Active',
      date: '2026-01-20',
    },
    {
      title: 'Engagement Ring Guide',
      category: 'Occasions',
      status: 'Draft',
      date: '2026-03-01',
    },
    {
      title: 'Jewelry Care Instructions',
      category: 'Care',
      status: 'Active',
      date: '2026-02-28',
    },
  ])
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(KNOWLEDGE_CATEGORIES[0])

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      <Card title="Upload Knowledge Document">
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-surface-border py-10 text-center cursor-pointer hover:border-gold/40 transition-colors"
          onClick={soon}
        >
          <svg
            className="h-8 w-8 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
            />
          </svg>
          <p className="text-sm text-white/40">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="text-xs text-white/25">PDF, DOCX, TXT up to 25 MB</p>
        </div>
      </Card>

      {/* Add entry form */}
      <Card title="Add Knowledge Entry">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-white/50 mb-1">Title</label>
            <input
              className={INPUT}
              placeholder="Knowledge entry title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-white/50 mb-1">
              Category
            </label>
            <select
              className={INPUT}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {KNOWLEDGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button onClick={soon} className={BTN_GOLD}>
            Add Knowledge
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card title="Knowledge Entries">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70"
                >
                  <td className="py-2.5">{e.title}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-surface px-2 py-0.5 text-xs">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-xs ${e.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-white/40">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Avatar Intelligence Tab ────────────────────── */

function IntelligenceTab() {
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<MetaHuman | null>(null)

  useEffect(() => {
    listMetahumans().then((list) => {
      setAvatars(list)
      if (list.length > 0) setSelectedAvatar(list[0])
    }).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4">
      <Card title="Avatars">
        <div className="flex flex-col gap-1">
          {avatars.length === 0 && (
            <p className="text-xs text-white/30 px-3 py-2">Loading avatars...</p>
          )}
          {avatars.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAvatar(a)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedAvatar?.id === a.id
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/60 hover:text-white hover:bg-surface/50'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </Card>

      <div>
        {selectedAvatar ? (
          <Card title={`${selectedAvatar.name} — Per-Avatar Brain`}>
            <AvatarBrainPanel
              metahumanId={selectedAvatar.id}
              metahumanName={selectedAvatar.name}
            />
          </Card>
        ) : (
          <EmptyState
            title="Select an avatar"
            description="Choose a MetaHuman from the list to view their individual brain — skills, memory, and self-improvement."
          />
        )}
      </div>
    </div>
  )
}

/* ────────────────────── Training Tab ────────────────────── */

function TrainingTab() {
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [filterAvatar, setFilterAvatar] = useState('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  useEffect(() => {
    listMetahumans().then(setAvatars).catch(() => {})
  }, [])

  const logs = [
    {
      date: '2026-03-12',
      query: 'What diamond clarity should I choose?',
      response:
        'For the best value, VS1 or VS2 clarity diamonds are eye-clean and more affordable than IF or VVS grades.',
      avatar: 'Rebecca',
      rating: null as boolean | null,
      flagged: false,
    },
    {
      date: '2026-03-11',
      query: 'Do you have rose gold wedding bands?',
      response:
        'Yes! We carry a beautiful selection of 14K and 18K rose gold bands in both classic and modern styles.',
      avatar: 'Amelia',
      rating: true,
      flagged: false,
    },
    {
      date: '2026-03-10',
      query: 'Can I return custom orders?',
      response:
        'Custom orders are final sale. However, we do offer a satisfaction guarantee on craftsmanship.',
      avatar: 'Rebecca',
      rating: false,
      flagged: true,
    },
    {
      date: '2026-03-09',
      query: 'What is a lab-grown diamond?',
      response:
        'Lab-grown diamonds are chemically identical to mined diamonds, created in controlled environments.',
      avatar: 'Bryan',
      rating: true,
      flagged: false,
    },
  ]

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  const filtered = logs.filter((l) => {
    if (filterAvatar !== 'all' && l.avatar !== filterAvatar) return false
    if (flaggedOnly && !l.flagged) return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <Card title="Filters">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-48">
            <label className="block text-xs text-white/50 mb-1">Avatar</label>
            <select
              className={INPUT}
              value={filterAvatar}
              onChange={(e) => setFilterAvatar(e.target.value)}
            >
              <option value="all">All Avatars</option>
              {avatars.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs text-white/50 mb-1">
              Date Range
            </label>
            <input type="date" className={INPUT} onClick={soon} readOnly />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={() => setFlaggedOnly(!flaggedOnly)}
              className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
            />
            Flagged Only
          </label>
        </div>
      </Card>

      <Card title="Conversation Log">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Customer Query</th>
                <th className="pb-2 font-medium">Avatar Response</th>
                <th className="pb-2 font-medium">Rating</th>
                <th className="pb-2 font-medium">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70 align-top"
                >
                  <td className="py-2.5 whitespace-nowrap text-white/40">
                    {l.date}
                  </td>
                  <td className="py-2.5 max-w-[200px]">{l.query}</td>
                  <td className="py-2.5 max-w-[280px] text-white/50">
                    {l.response}
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={soon}
                        className={`text-lg leading-none ${l.rating === true ? 'text-green-400' : 'text-white/20 hover:text-green-400'}`}
                      >
                        ▲
                      </button>
                      <button
                        onClick={soon}
                        className={`text-lg leading-none ${l.rating === false ? 'text-red-400' : 'text-white/20 hover:text-red-400'}`}
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <input
                      type="checkbox"
                      checked={l.flagged}
                      onChange={soon}
                      className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Prompts Tab ────────────────────── */

function PromptsTab() {
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<MetaHuman | null>(null)
  const { brains, loadBrain } = useAvatarBrainStore()
  const [systemPrompt, setSystemPrompt] = useState('')
  const [personality, setPersonality] = useState('')

  useEffect(() => {
    listMetahumans().then((list) => {
      setAvatars(list)
      if (list.length > 0) setSelectedAvatar(list[0])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedAvatar) return
    loadBrain(selectedAvatar.id, selectedAvatar.name).then((brain) => {
      const strengths = brain.self_assessment.strengths.join(', ') || 'general luxury assistance'
      const topSkill = [...brain.skills].sort((a, b) => b.score - a.score)[0]
      setSystemPrompt(
        `You are ${selectedAvatar.name}, a luxury jewelry concierge for Mountain Jewels. ` +
        `Your strengths: ${strengths}. ` +
        `You have ${brain.total_interactions} interactions of experience. ` +
        `Confidence: ${Math.round(brain.self_assessment.confidence_overall * 100)}%.`
      )
      setPersonality(
        topSkill
          ? `Best skill: ${topSkill.skill} (${Math.round(topSkill.score * 100)}%, ${topSkill.trend}). ` +
            `Guide customers warmly while leveraging your learned expertise.`
          : 'Warm, knowledgeable, and attentive. Uses gemological terminology naturally.'
      )
    })
  }, [selectedAvatar, loadBrain])

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4">
      <Card title="Avatar">
        <div className="flex flex-col gap-1">
          {avatars.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAvatar(a)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedAvatar?.id === a.id
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/60 hover:text-white hover:bg-surface/50'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card title={`${selectedAvatar?.name ?? 'Avatar'} — System Prompt (from Brain)`}>
          <textarea
            className={`${INPUT} font-mono min-h-[160px] resize-y`}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          <p className="mt-2 text-[10px] text-white/25">
            Auto-generated from {selectedAvatar?.name ?? 'avatar'}&apos;s brain data. Edits will be saved per-avatar.
          </p>
        </Card>
        <Card title="Personality Instructions (from Brain)">
          <textarea
            className={`${INPUT} min-h-[100px] resize-y`}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          />
        </Card>
        <div className="flex gap-2">
          <button onClick={soon} className={BTN_GOLD}>
            Save Prompt
          </button>
          <button onClick={soon} className={BTN_OUTLINE}>
            Revert
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────── Product Sync Tab ────────────────────── */

function SyncTab() {
  const soon = () => toast.info('Coming soon — backend endpoint needed')

  const events = [
    {
      date: '2026-03-13 14:22',
      updated: 47,
      status: 'Success',
    },
    {
      date: '2026-03-12 14:20',
      updated: 12,
      status: 'Success',
    },
    {
      date: '2026-03-11 14:18',
      updated: 3,
      status: 'Partial',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-white/40">Last Sync</p>
          <p className="mt-1 text-lg text-white font-medium">
            2026-03-13 14:22
          </p>
        </Card>
        <Card>
          <p className="text-xs text-white/40">Products Synced</p>
          <p className="mt-1 text-lg text-gold font-medium">1,247</p>
        </Card>
        <Card>
          <p className="text-xs text-white/40">Pending Changes</p>
          <p className="mt-1 text-lg text-yellow-400 font-medium">8</p>
        </Card>
      </div>

      <Card>
        <button onClick={soon} className={BTN_GOLD}>
          Sync Now
        </button>
      </Card>

      <Card title="Recent Sync Events">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Products Updated</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70"
                >
                  <td className="py-2.5 text-white/40">{e.date}</td>
                  <td className="py-2.5">{e.updated}</td>
                  <td className="py-2.5">
                    <span
                      className={`text-xs ${e.status === 'Success' ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Rules, Boundaries & Guidelines Tab ────────────────────── */

function RulesTab() {
  const { guardrails, addGuardrail, toggleGuardrail, removeGuardrail } = useGuardrailsStore()
  const [activeCategory, setActiveCategory] = useState<GuardrailCategory | 'diamond'>('boundary')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<GuardrailCategory>('boundary')
  const [newDesc, setNewDesc] = useState('')
  const [newEnvs, setNewEnvs] = useState<string[]>(['Avatar'])
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const pendingGuardrail = pendingRemoveId ? guardrails.find((g) => g.id === pendingRemoveId) : null

  const [diamondShape, setDiamondShape] = useState('round')
  const [diamondCarat, setDiamondCarat] = useState('1.0')

  const envOptions = ['Landing', 'Cave', 'Avatar']

  const categories: (GuardrailCategory | 'diamond')[] = ['boundary', 'guideline', 'policy', 'context_rule', 'diamond']
  const filtered = activeCategory === 'diamond' ? [] : guardrails.filter((g) => g.category === activeCategory)

  const handleAdd = () => {
    if (!newName.trim() || !newDesc.trim()) {
      toast.error('Name and description are required')
      return
    }
    addGuardrail({ category: newCategory, name: newName.trim(), description: newDesc.trim(), active: true, environments: newEnvs })
    setNewName('')
    setNewDesc('')
    setShowAdd(false)
    toast.success('Guardrail added — all avatars will see it')
  }

  const dims = lookupDiamondSizeSync(diamondShape, Number(diamondCarat) || 1)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-xs text-white/40 mb-3">
          Shared rules enforced across all avatars. Boundaries are hard limits, guidelines are best practices.
        </p>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === cat ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {cat === 'diamond' ? 'Diamond Reference' : GUARDRAIL_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </Card>

      {activeCategory === 'diamond' ? (
        <Card title="Diamond Size Calculator">
          <p className="text-xs text-white/40 mb-4">
            Shared reference — all avatars use this for carat-to-mm conversions when helping customers.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Shape</label>
              <select className={INPUT} value={diamondShape} onChange={(e) => setDiamondShape(e.target.value)}>
                {DIAMOND_SHAPES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Carat Weight</label>
              <input className={INPUT} type="number" step="0.05" min="0.1" max="10" value={diamondCarat} onChange={(e) => setDiamondCarat(e.target.value)} />
            </div>
            <div className="flex items-end">
              <div className="p-3 rounded-lg bg-surface border border-surface-border w-full text-center">
                <p className="text-[10px] text-white/30 uppercase">Dimensions</p>
                <p className="text-sm text-gold font-mono mt-1">
                  {dims.length_mm > 0 ? `${dims.length_mm} x ${dims.width_mm} x ${dims.depth_mm} mm` : 'No data'}
                </p>
                <p className="text-[9px] text-white/20 mt-0.5">Source: {dims.source}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 border-b border-surface-border">
                  <th className="pb-2 font-medium">Carat</th>
                  <th className="pb-2 font-medium">Length (mm)</th>
                  <th className="pb-2 font-medium">Width (mm)</th>
                  <th className="pb-2 font-medium">Depth (mm)</th>
                </tr>
              </thead>
              <tbody>
                {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0].map((ct) => {
                  const d = lookupDiamondSizeSync(diamondShape, ct)
                  return (
                    <tr key={ct} className="border-b border-surface-border/50 text-white/70">
                      <td className="py-2 font-mono text-gold">{ct} ct</td>
                      <td className="py-2 font-mono">{d.length_mm}</td>
                      <td className="py-2 font-mono">{d.width_mm}</td>
                      <td className="py-2 font-mono">{d.depth_mm}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <>
          <Card title={GUARDRAIL_CATEGORY_LABELS[activeCategory]}>
            <p className="text-xs text-white/40 mb-3">
              {GUARDRAIL_CATEGORY_DESCRIPTIONS[activeCategory]}
            </p>
            {filtered.length === 0 ? (
              <p className="text-xs text-white/25 text-center py-4">No {GUARDRAIL_CATEGORY_LABELS[activeCategory].toLowerCase()} defined</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((g) => (
                  <div key={g.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-surface-border">
                    <button
                      onClick={() => toggleGuardrail(g.id)}
                      className={`mt-0.5 h-5 w-9 rounded-full transition-colors shrink-0 ${g.active ? 'bg-gold' : 'bg-surface-border'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${g.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/80">{g.name}</span>
                        <div className="flex gap-1">
                          {g.environments.map((e) => (
                            <span key={e} className="rounded bg-surface-panel px-1.5 py-0.5 text-[9px] text-white/30">{e}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{g.description}</p>
                    </div>
                    <button onClick={() => setPendingRemoveId(g.id)} className="text-[10px] text-red-400/50 hover:text-red-400 shrink-0">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {showAdd ? (
            <Card title="Add Guardrail">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Name</label>
                  <input className={INPUT} placeholder="Guardrail name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Category</label>
                  <select className={INPUT} value={newCategory} onChange={(e) => setNewCategory(e.target.value as GuardrailCategory)}>
                    <option value="boundary">Boundary</option>
                    <option value="guideline">Guideline</option>
                    <option value="policy">Policy</option>
                    <option value="context_rule">Context Rule</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Description</label>
                  <textarea className={`${INPUT} min-h-[80px] resize-y`} placeholder="What this guardrail enforces…" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Environments</label>
                  <div className="flex gap-3">
                    {envOptions.map((env) => (
                      <label key={env} className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEnvs.includes(env)}
                          onChange={() => setNewEnvs((p) => p.includes(env) ? p.filter((e) => e !== env) : [...p, env])}
                          className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
                        />
                        {env}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleAdd} className={BTN_GOLD}>Save Guardrail</button>
                <button onClick={() => setShowAdd(false)} className={BTN_OUTLINE}>Cancel</button>
              </div>
            </Card>
          ) : (
            <button onClick={() => setShowAdd(true)} className={BTN_OUTLINE}>
              + Add {GUARDRAIL_CATEGORY_LABELS[activeCategory].slice(0, -1)}
            </button>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingRemoveId}
        title="Remove Guardrail"
        message={`Remove "${pendingGuardrail?.name ?? ''}"? This rule will no longer apply to any avatar.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingRemoveId) {
            removeGuardrail(pendingRemoveId)
            toast.success('Guardrail removed')
          }
          setPendingRemoveId(null)
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  )
}

/* ────────────────────── Sales Intel Tab ────────────────────── */

function SalesTab() {
  const soon = () => toast.info('Coming soon — backend endpoint needed')

  const questions = [
    {
      question: 'Do you offer financing?',
      frequency: 34,
      suggestion: 'Add financing FAQ to Knowledge Base',
    },
    {
      question: 'What is your warranty policy?',
      frequency: 28,
      suggestion: 'Add warranty knowledge document',
    },
    {
      question: 'Can I see rings in person?',
      frequency: 22,
      suggestion: 'Add showroom / appointment info',
    },
    {
      question: 'Do you ship internationally?',
      frequency: 19,
      suggestion: 'Add shipping policy document',
    },
    {
      question: 'How long for custom orders?',
      frequency: 15,
      suggestion: 'Add custom order timeline FAQ',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: '2,841', color: 'text-white' },
          {
            label: 'Unanswered Questions',
            value: '118',
            color: 'text-yellow-400',
          },
          { label: 'Knowledge Gaps', value: '7', color: 'text-red-400' },
          { label: 'Avg Response Time', value: '1.2s', color: 'text-gold' },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-white/40">{s.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${s.color}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Top Unanswered Questions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Question</th>
                <th className="pb-2 font-medium">Frequency</th>
                <th className="pb-2 font-medium">Suggested Action</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70"
                >
                  <td className="py-2.5">{q.question}</td>
                  <td className="py-2.5 text-center">{q.frequency}</td>
                  <td className="py-2.5 text-white/50">{q.suggestion}</td>
                  <td className="py-2.5">
                    <button
                      onClick={soon}
                      className="text-xs text-gold hover:underline"
                    >
                      Add to KB
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Analytics">
        <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-surface-border text-white/20 text-sm">
          Chart area — connect analytics endpoint to render
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── A/B Testing Tab ────────────────────── */

function TestingTab() {
  const [avatars, setAvatars] = useState<MetaHuman[]>([])

  useEffect(() => {
    listMetahumans().then(setAvatars).catch(() => {})
  }, [])

  const [tests] = useState([
    {
      name: 'Greeting Style Test',
      avatar: 'Rebecca',
      variantA: 'Formal luxury greeting with brand name mention',
      variantB: 'Casual warm greeting with first-name usage',
      status: 'Running',
      winner: null as string | null,
    },
    {
      name: 'Upsell Timing',
      avatar: 'Amelia',
      variantA: 'Suggest complementary items after selection',
      variantB: 'Suggest complementary items during browse',
      status: 'Complete',
      winner: 'Variant A',
    },
  ])

  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('')
  const [newVarA, setNewVarA] = useState('')
  const [newVarB, setNewVarB] = useState('')

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  return (
    <div className="flex flex-col gap-4">
      <Card title="Active Tests">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Test Name</th>
                <th className="pb-2 font-medium">Avatar</th>
                <th className="pb-2 font-medium">Variant A</th>
                <th className="pb-2 font-medium">Variant B</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70 align-top"
                >
                  <td className="py-2.5 font-medium text-white/80">
                    {t.name}
                  </td>
                  <td className="py-2.5">{t.avatar}</td>
                  <td className="py-2.5 max-w-[180px] text-white/50">
                    {t.variantA}
                  </td>
                  <td className="py-2.5 max-w-[180px] text-white/50">
                    {t.variantB}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-xs ${t.status === 'Running' ? 'text-blue-400' : 'text-green-400'}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-gold">
                    {t.winner ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Create Test">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Test Name
            </label>
            <input
              className={INPUT}
              placeholder="e.g. Closing Technique Test"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Avatar</label>
            <select
              className={INPUT}
              value={newAvatar}
              onChange={(e) => setNewAvatar(e.target.value)}
            >
              <option value="">Select avatar</option>
              {avatars.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Variant A
            </label>
            <textarea
              className={`${INPUT} min-h-[80px] resize-y`}
              placeholder="Describe variant A behavior…"
              value={newVarA}
              onChange={(e) => setNewVarA(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Variant B
            </label>
            <textarea
              className={`${INPUT} min-h-[80px] resize-y`}
              placeholder="Describe variant B behavior…"
              value={newVarB}
              onChange={(e) => setNewVarB(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={soon} className={BTN_GOLD}>
            Start Test
          </button>
          <button onClick={soon} className={BTN_OUTLINE}>
            End Test
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Main Page ────────────────────── */

export default function DirectorPage() {
  const [tab, setTab] = useState<DirectorTab>('chat')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">AI Director</h1>
        <p className="text-sm text-white/50 mt-1">
          Per-avatar production intelligence — each avatar learns independently
        </p>
      </div>

      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      <div className="min-h-0">
        {tab === 'chat' && <ChatTab />}
        {tab === 'knowledge' && <KnowledgeTab />}
        {tab === 'intelligence' && <IntelligenceTab />}
        {tab === 'training' && <TrainingTab />}
        {tab === 'prompts' && <PromptsTab />}
        {tab === 'sync' && <SyncTab />}
        {tab === 'rules' && <RulesTab />}
        {tab === 'sales' && <SalesTab />}
        {tab === 'testing' && <TestingTab />}
      </div>
    </div>
  )
}
