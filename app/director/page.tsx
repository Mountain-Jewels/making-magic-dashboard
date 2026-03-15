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
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { Card } from '@/components/shared/Card'
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

const AVATARS = [
  'Rebecca',
  'Amelia',
  'Bryan',
  'Jesse',
  'Lexi',
  'Omar',
  'Pia',
  'Vivian',
  'Yuri',
]

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
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((p) => [...p, { role: 'user', content: text }])
    scrollToBottom()
    setSending(true)
    try {
      const res = await chatWithDirector(text, sessionId)
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
    if (!window.confirm('Reset the Director? This clears the session.')) return
    try {
      await resetDirector()
      setMessages([])
      setSessionId(undefined)
      setDirectorState('idle')
      setPendingQuestions([])
      setLatestIntent(undefined)
      setLatestPlan(undefined)
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
          <div className="ml-auto flex gap-2">
            <button onClick={refreshState} className={BTN_OUTLINE}>
              Refresh State
            </button>
            <button
              onClick={handleReset}
              className="border border-red-500/40 text-red-400 text-sm font-medium rounded-md px-4 py-2 hover:bg-red-500/10 transition-colors"
            >
              Reset Director
            </button>
          </div>
        </div>
      </Card>

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
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [knowledgeSets, setKnowledgeSets] = useState<Record<string, boolean>>({
    Product: true,
    Brand: true,
    Gemology: false,
    Occasions: true,
    Care: false,
  })
  const [specialization, setSpecialization] = useState('')

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4">
      {/* Avatar list */}
      <Card title="Avatars">
        <div className="flex flex-col gap-1">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAvatar(a)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedAvatar === a
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/60 hover:text-white hover:bg-surface/50'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      {/* Config panel */}
      <Card title={`${selectedAvatar} — Knowledge Config`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2">
              Knowledge Sets
            </label>
            <div className="flex flex-col gap-2">
              {KNOWLEDGE_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm text-white/70 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={knowledgeSets[cat] ?? false}
                    onChange={() =>
                      setKnowledgeSets((p) => ({ ...p, [cat]: !p[cat] }))
                    }
                    className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Specialization Area
            </label>
            <input
              className={INPUT}
              placeholder="e.g. Engagement rings, luxury gifting…"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>
          <button onClick={soon} className={BTN_GOLD}>
            Save
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Training Tab ────────────────────── */

function TrainingTab() {
  const [filterAvatar, setFilterAvatar] = useState('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)

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
              {AVATARS.map((a) => (
                <option key={a} value={a}>
                  {a}
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
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a luxury jewelry concierge for Mountain Jewels. Be warm, knowledgeable, and guide customers toward their perfect piece.'
  )
  const [personality, setPersonality] = useState(
    'Friendly and professional. Uses gemological terminology naturally. Always suggests complementary pieces.'
  )

  const soon = () => toast.info('Coming soon — backend endpoint needed')

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4">
      <Card title="Avatar">
        <div className="flex flex-col gap-1">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAvatar(a)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedAvatar === a
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/60 hover:text-white hover:bg-surface/50'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card title={`${selectedAvatar} — System Prompt`}>
          <textarea
            className={`${INPUT} font-mono min-h-[160px] resize-y`}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </Card>
        <Card title="Personality Instructions">
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

/* ────────────────────── Context Rules Tab ────────────────────── */

function RulesTab() {
  const [rules] = useState([
    {
      name: 'Holiday Season',
      type: 'Season',
      active: true,
      envs: ['Landing', 'Avatar'],
      date: '2026-01-05',
    },
    {
      name: "Valentine's Day",
      type: 'Event',
      active: false,
      envs: ['Landing', 'Cave', 'Avatar'],
      date: '2026-02-01',
    },
    {
      name: 'Default Welcome',
      type: 'Default',
      active: true,
      envs: ['Landing'],
      date: '2025-12-15',
    },
  ])

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Default')
  const [newDesc, setNewDesc] = useState('')
  const [newEnvs, setNewEnvs] = useState<string[]>([])
  const [newActive, setNewActive] = useState(true)

  const envOptions = ['Landing', 'Cave', 'Avatar']
  const soon = () => toast.info('Coming soon — backend endpoint needed')

  const toggleEnv = (env: string) =>
    setNewEnvs((p) =>
      p.includes(env) ? p.filter((e) => e !== env) : [...p, env]
    )

  return (
    <div className="flex flex-col gap-4">
      <Card title="Context Rules">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-surface-border">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Active</th>
                <th className="pb-2 font-medium">Environments</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-surface-border/50 text-white/70"
                >
                  <td className="py-2.5">{r.name}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-surface px-2 py-0.5 text-xs">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={soon}
                      className={`h-5 w-9 rounded-full transition-colors ${r.active ? 'bg-gold' : 'bg-surface-border'}`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </button>
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      {r.envs.map((e) => (
                        <span
                          key={e}
                          className="rounded bg-surface px-1.5 py-0.5 text-xs text-white/50"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 text-white/40">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Add Rule">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Name</label>
            <input
              className={INPUT}
              placeholder="Rule name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Type</label>
            <select
              className={INPUT}
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="Season">Season</option>
              <option value="Event">Event</option>
              <option value="Default">Default</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/50 mb-1">
              Description
            </label>
            <textarea
              className={`${INPUT} min-h-[80px] resize-y`}
              placeholder="Rule description…"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">
              Environments
            </label>
            <div className="flex gap-3">
              {envOptions.map((env) => (
                <label
                  key={env}
                  className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={newEnvs.includes(env)}
                    onChange={() => toggleEnv(env)}
                    className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
                  />
                  {env}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={newActive}
                onChange={() => setNewActive(!newActive)}
                className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
              />
              Active
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={soon} className={BTN_GOLD}>
            Save Rule
          </button>
        </div>
      </Card>
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
  const [newAvatar, setNewAvatar] = useState(AVATARS[0])
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
              {AVATARS.map((a) => (
                <option key={a} value={a}>
                  {a}
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
          The Brain — Production intelligence hub
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
