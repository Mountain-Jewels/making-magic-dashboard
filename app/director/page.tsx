/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  chatWithDirector,
  answerDirector,
  approveDirectorPlan,
  getDirectorState,
  resetDirector,
} from '@/lib/api/director'
import type { PendingQuestion } from '@/lib/api/director'
import { listMetahumans } from '@/lib/api/scene-control'
import type { MetaHuman } from '@/lib/api/scene-control'
import { apiGet, apiPost } from '@/lib/api/client'
import {
  Brain,
  MessageCircle,
  BookOpen,
  UserCog,
  GraduationCap,
  FileText,
  Package,
  ShieldCheck,
  BarChart3,
  FlaskConical,
  Send,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types for API responses that may not exist yet                     */
/* ------------------------------------------------------------------ */

interface KnowledgeEntry {
  id?: string
  title: string
  category: string
  created_at?: string
}

interface TrainingLog {
  session_id: string
  avatar?: string
  date?: string
  messages?: number
  rating?: number
  flagged?: boolean
  conversation?: Array<{ role: string; content: string }>
}

interface ProductSyncStatus {
  total_products?: number
  last_sync?: string
  status?: string
}

interface SyncedProduct {
  name: string
  category: string
  price: number
  synced_at?: string
  status?: string
}

interface ContextRule {
  id?: string
  rule_id?: string
  name: string
  trigger_type: string
  response_mode: string
  active: boolean
}

interface SalesIntelSummary {
  conversion_rate?: number
  avg_session_duration?: number
  top_category?: string
}

interface UnansweredQuestion {
  question: string
  times_asked: number
  category?: string
}

interface ABTest {
  id?: string
  test_name: string
  variant_a: string
  variant_b: string
  start_date?: string
  sessions?: number
  conversion_a?: number
  conversion_b?: number
  status?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { key: 'intelligence', label: 'Intelligence', icon: UserCog },
  { key: 'training', label: 'Training', icon: GraduationCap },
  { key: 'prompts', label: 'Prompts', icon: FileText },
  { key: 'sync', label: 'Sync', icon: Package },
  { key: 'rules', label: 'Rules', icon: ShieldCheck },
  { key: 'sales', label: 'Sales', icon: BarChart3 },
  { key: 'ab', label: 'A/B Testing', icon: FlaskConical },
] as const

type TabKey = (typeof TABS)[number]['key']

const STATE_COLORS: Record<string, string> = {
  idle: 'bg-gray-500',
  listening: 'bg-blue-500',
  parsing_intent: 'bg-blue-500',
  clarifying: 'bg-yellow-500',
  planning: 'bg-yellow-500',
  awaiting_approval: 'bg-yellow-500',
  executing: 'bg-green-500',
  fixing: 'bg-yellow-500',
  reviewing: 'bg-green-500',
  complete: 'bg-green-500',
  failed: 'bg-red-500',
}

function stateLabel(state: string): string {
  const m: Record<string, string> = {
    idle: 'Idle',
    listening: 'Listening',
    parsing_intent: 'Listening',
    clarifying: 'Clarifying',
    planning: 'Planning',
    awaiting_approval: 'Awaiting Approval',
    executing: 'Executing',
    fixing: 'Fixing',
    reviewing: 'Reviewing',
    complete: 'Complete',
    failed: 'Error',
  }
  return m[state] ?? state
}

/* ------------------------------------------------------------------ */
/*  Shared style helpers                                               */
/* ------------------------------------------------------------------ */

const cx = {
  input: 'h-8 px-3 bg-[#111118] border border-[#2A2A35] rounded text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]/60',
  textarea: 'w-full px-3 py-2 bg-[#111118] border border-[#2A2A35] rounded text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]/60 resize-none',
  btn: 'px-4 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded hover:bg-[#D4AF37]/90 disabled:opacity-50 transition-colors',
  btnOutline: 'px-4 py-2 border border-[#2A2A35] text-white text-xs font-semibold rounded hover:bg-[#2A2A35]/60 disabled:opacity-50 transition-colors',
  card: 'p-4 bg-[#111118] rounded-lg border border-[#2A2A35]',
  select: 'h-8 px-3 bg-[#111118] border border-[#2A2A35] rounded text-[11px] text-white focus:outline-none focus:border-[#D4AF37]/60',
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function DirectorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat')

  /* ---------- Chat state ---------- */
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [directorState, setDirectorState] = useState('idle')
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [pendingQuestions, setPendingQuestions] = useState<(string | PendingQuestion)[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pendingPlan, setPendingPlan] = useState<Record<string, unknown> | null>(null)
  const [pendingIntent, setPendingIntent] = useState<Record<string, unknown> | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [answerValue, setAnswerValue] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingState, setLoadingState] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  /* ---------- Knowledge state ---------- */
  const [kbEntries, setKbEntries] = useState<KnowledgeEntry[]>([])
  const [kbTitle, setKbTitle] = useState('')
  const [kbContent, setKbContent] = useState('')
  const [kbCategory, setKbCategory] = useState('product')

  /* ---------- Intelligence state ---------- */
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const [knowledgeAreas, setKnowledgeAreas] = useState<string[]>([])
  const [specialization, setSpecialization] = useState('')

  /* ---------- Training state ---------- */
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([])
  const [trainFilterStart, setTrainFilterStart] = useState('')
  const [trainFilterEnd, setTrainFilterEnd] = useState('')
  const [trainFilterRating, setTrainFilterRating] = useState('')
  const [trainFilterFlagged, setTrainFilterFlagged] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  /* ---------- Prompts state ---------- */
  const [promptAvatarId, setPromptAvatarId] = useState<string | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [savedPrompt, setSavedPrompt] = useState('')
  const [personality, setPersonality] = useState({
    warmth: 50,
    competence: 50,
    agreeableness: 50,
    openness: 50,
    conscientiousness: 50,
  })
  const [savedPersonality, setSavedPersonality] = useState({ ...personality })

  /* ---------- Sync state ---------- */
  const [syncStatus, setSyncStatus] = useState<ProductSyncStatus>({})
  const [syncProducts, setSyncProducts] = useState<SyncedProduct[]>([])

  /* ---------- Rules state ---------- */
  const [contextRules, setContextRules] = useState<ContextRule[]>([])
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleTrigger, setNewRuleTrigger] = useState('anniversary')
  const [newRuleMode, setNewRuleMode] = useState('refined_confident')

  /* ---------- Sales state ---------- */
  const [salesSummary, setSalesSummary] = useState<SalesIntelSummary>({})
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([])

  /* ---------- A/B state ---------- */
  const [abTests, setAbTests] = useState<ABTest[]>([])
  const [newTestName, setNewTestName] = useState('')
  const [newVariantA, setNewVariantA] = useState('')
  const [newVariantB, setNewVariantB] = useState('')
  const [newMetric, setNewMetric] = useState('conversion')

  /* ================================================================ */
  /*  Data fetchers                                                    */
  /* ================================================================ */

  const fetchState = useCallback(async () => {
    try {
      setLoadingState(true)
      const res = await getDirectorState()
      setDirectorState(res.state)
      if (res.current_job_id != null) setCurrentJobId(res.current_job_id)
      setPendingQuestions(res.pending_questions ?? [])
      if (res.messages?.length) setMessages(res.messages)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch director state')
    } finally {
      setLoadingState(false)
    }
  }, [])

  const fetchAvatars = useCallback(async () => {
    try {
      const list = await listMetahumans()
      setAvatars(list)
    } catch {
      toast.error('Failed to load avatars')
    }
  }, [])

  const fetchKnowledge = useCallback(async () => {
    try {
      const data = await apiGet<KnowledgeEntry[]>('/director/knowledge')
      setKbEntries(Array.isArray(data) ? data : [])
    } catch {
      setKbEntries([])
    }
  }, [])

  const fetchTrainingLogs = useCallback(async () => {
    try {
      const data = await apiGet<TrainingLog[]>('/concierge/training/logs')
      setTrainingLogs(Array.isArray(data) ? data : [])
    } catch {
      setTrainingLogs([])
    }
  }, [])

  const fetchSyncStatus = useCallback(async () => {
    try {
      const data = await apiGet<ProductSyncStatus>('/director/product-sync/status')
      setSyncStatus(data ?? {})
    } catch {
      setSyncStatus({})
    }
  }, [])

  const fetchSyncProducts = useCallback(async () => {
    try {
      const data = await apiGet<SyncedProduct[]>('/director/product-sync/products')
      setSyncProducts(Array.isArray(data) ? data : [])
    } catch {
      setSyncProducts([])
    }
  }, [])

  const fetchContextRules = useCallback(async () => {
    try {
      const data = await apiGet<ContextRule[]>('/director/context-rules')
      setContextRules(Array.isArray(data) ? data : [])
    } catch {
      setContextRules([])
    }
  }, [])

  const fetchSalesIntel = useCallback(async () => {
    try {
      const data = await apiGet<SalesIntelSummary>('/director/sales-intel/summary')
      setSalesSummary(data ?? {})
    } catch {
      setSalesSummary({})
    }
  }, [])

  const fetchUnanswered = useCallback(async () => {
    try {
      const data = await apiGet<UnansweredQuestion[]>('/director/sales-intel/unanswered')
      setUnanswered(Array.isArray(data) ? data : [])
    } catch {
      setUnanswered([])
    }
  }, [])

  const fetchAbTests = useCallback(async () => {
    try {
      const data = await apiGet<ABTest[]>('/director/ab-tests')
      setAbTests(Array.isArray(data) ? data : [])
    } catch {
      setAbTests([])
    }
  }, [])

  const fetchPromptForAvatar = useCallback(async (avatarId: string) => {
    try {
      const data = await apiGet<{ system_prompt?: string; personality?: Record<string, number> }>(
        `/director/prompts/${encodeURIComponent(avatarId)}`
      )
      const sp = data?.system_prompt ?? ''
      setSystemPrompt(sp)
      setSavedPrompt(sp)
      const p = {
        warmth: data?.personality?.warmth ?? 50,
        competence: data?.personality?.competence ?? 50,
        agreeableness: data?.personality?.agreeableness ?? 50,
        openness: data?.personality?.openness ?? 50,
        conscientiousness: data?.personality?.conscientiousness ?? 50,
      }
      setPersonality(p)
      setSavedPersonality({ ...p })
    } catch {
      setSystemPrompt('')
      setSavedPrompt('')
      const defaults = { warmth: 50, competence: 50, agreeableness: 50, openness: 50, conscientiousness: 50 }
      setPersonality(defaults)
      setSavedPersonality({ ...defaults })
    }
  }, [])

  /* ================================================================ */
  /*  Mount effects                                                    */
  /* ================================================================ */

  useEffect(() => {
    void fetchState()
    void fetchAvatars()
  }, [fetchState, fetchAvatars])

  useEffect(() => {
    if (activeTab === 'knowledge') void fetchKnowledge()
    if (activeTab === 'training') void fetchTrainingLogs()
    if (activeTab === 'sync') {
      void fetchSyncStatus()
      void fetchSyncProducts()
    }
    if (activeTab === 'rules') void fetchContextRules()
    if (activeTab === 'sales') {
      void fetchSalesIntel()
      void fetchUnanswered()
    }
    if (activeTab === 'ab') void fetchAbTests()
  }, [activeTab, fetchKnowledge, fetchTrainingLogs, fetchSyncStatus, fetchSyncProducts, fetchContextRules, fetchSalesIntel, fetchUnanswered, fetchAbTests])

  useEffect(() => {
    if (promptAvatarId) void fetchPromptForAvatar(promptAvatarId)
  }, [promptAvatarId, fetchPromptForAvatar])

  /* ================================================================ */
  /*  Chat handlers                                                    */
  /* ================================================================ */

  const handleSend = useCallback(async () => {
    const msg = inputValue.trim()
    if (!msg || loadingChat) return
    setInputValue('')
    setLoadingChat(true)
    try {
      const res = await chatWithDirector(msg, sessionId ?? undefined)
      setSessionId(res.session_id || sessionId)
      if (res.messages?.length) {
        setMessages(res.messages)
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: msg },
          { role: 'director', content: res.response },
        ])
      }
      setDirectorState(res.state)
      setPendingPlan(res.plan ?? null)
      setPendingIntent(res.intent ?? null)
      setPendingQuestions(res.questions ?? [])
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Chat failed'
      toast.error(errMsg)
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: msg },
        { role: 'director', content: `Error: ${errMsg}` },
      ])
    } finally {
      setLoadingChat(false)
    }
  }, [inputValue, loadingChat, sessionId])

  const handleAnswer = useCallback(
    async (field: string, answer: string) => {
      if (!sessionId || !pendingIntent || loadingChat) return
      setLoadingChat(true)
      try {
        const res = await answerDirector(sessionId, answer, { field, intent: pendingIntent })
        if (res.messages?.length) {
          setMessages(res.messages)
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'user', content: answer },
            { role: 'director', content: res.response },
          ])
        }
        setDirectorState(res.state)
        setPendingPlan(res.plan ?? null)
        setPendingIntent(res.intent ?? pendingIntent)
        setPendingQuestions(res.questions ?? [])
        setAnswerValue('')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Answer failed')
      } finally {
        setLoadingChat(false)
      }
    },
    [sessionId, pendingIntent, loadingChat],
  )

  const handleApprove = useCallback(async () => {
    if (!pendingPlan || loadingChat) return
    setLoadingChat(true)
    try {
      const res = await approveDirectorPlan(sessionId ?? '', pendingPlan)
      setDirectorState('executing')
      setPendingPlan(null)
      if (res.job_id) setCurrentJobId(res.job_id)
      toast.success(res.status === 'complete' ? 'Production complete!' : `Status: ${res.status}`)
      void fetchState()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setLoadingChat(false)
    }
  }, [pendingPlan, sessionId, loadingChat, fetchState])

  const handleReset = useCallback(async () => {
    setShowResetConfirm(false)
    setLoadingReset(true)
    try {
      await resetDirector()
      setMessages([])
      setDirectorState('idle')
      setCurrentJobId(null)
      setPendingQuestions([])
      setPendingPlan(null)
      setPendingIntent(null)
      toast.success('Director reset')
      void fetchState()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoadingReset(false)
    }
  }, [fetchState])

  /* ================================================================ */
  /*  Training filters                                                 */
  /* ================================================================ */

  const filteredLogs = trainingLogs.filter((log) => {
    if (trainFilterStart && log.date && log.date < trainFilterStart) return false
    if (trainFilterEnd && log.date && log.date > trainFilterEnd) return false
    if (trainFilterRating && log.rating !== Number(trainFilterRating)) return false
    if (trainFilterFlagged && !log.flagged) return false
    return true
  })

  /* ================================================================ */
  /*  Knowledge area toggler                                           */
  /* ================================================================ */

  const KNOWLEDGE_AREAS = ['products', 'diamonds', 'metals', 'occasions', 'brand_story', 'custom_design'] as const

  function toggleKnowledgeArea(area: string) {
    setKnowledgeAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    )
  }

  /* ================================================================ */
  /*  Render helpers                                                   */
  /* ================================================================ */

  const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId)

  function stars(n: number) {
    return '★'.repeat(Math.max(0, Math.min(5, n))) + '☆'.repeat(5 - Math.max(0, Math.min(5, n)))
  }

  /* ================================================================ */
  /*  TAB RENDERERS                                                    */
  /* ================================================================ */

  /* ---- TAB 1: Chat ---- */
  function renderChat() {
    return (
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        {/* State panel */}
        <div className={cx.card}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${STATE_COLORS[directorState] ?? 'bg-gray-500'}`} />
              <span className="text-sm font-medium">{stateLabel(directorState)}</span>
            </div>
            {currentJobId && <span className="text-sm text-white/60">Job: {currentJobId}</span>}
            {pendingQuestions.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-white/50">Pending questions:</span>
                <ul className="text-sm text-white/80 list-disc list-inside">
                  {pendingQuestions.map((q, i) => (
                    <li key={i}>
                      {typeof q === 'string'
                        ? q
                        : (q as PendingQuestion).question ?? (q as PendingQuestion).field ?? ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-[#2A2A35] bg-[#111118] p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-white/40 text-sm py-8">
              Send a message to start a production conversation.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  m.role === 'user'
                    ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40'
                    : 'bg-[#2A2A35] border border-[#2A2A35]'
                }`}
              >
                <span className="text-xs text-white/50 capitalize">{m.role}</span>
                <p className="text-sm mt-0.5 whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {/* Pending question cards */}
          {pendingQuestions.length > 0 && pendingIntent && (
            <div className="flex flex-col gap-2 pt-2">
              {pendingQuestions.map((q, i) => {
                const pq = typeof q === 'string' ? { field: '', question: q } : (q as PendingQuestion)
                const field = pq.field ?? ''
                const question = pq.question ?? pq.field ?? ''
                return (
                  <div key={i} className="rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3">
                    <p className="text-sm text-white/90">{question}</p>
                    {i === 0 && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={answerValue}
                          onChange={(e) => setAnswerValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnswer(field, answerValue)}
                          placeholder="Your answer"
                          className={`flex-1 ${cx.input}`}
                        />
                        <button
                          onClick={() => handleAnswer(field, answerValue)}
                          disabled={loadingChat || !answerValue.trim()}
                          className={cx.btn}
                        >
                          Answer
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Approve plan */}
          {directorState === 'awaiting_approval' && pendingPlan && (
            <div className="flex justify-start pt-2">
              <button onClick={handleApprove} disabled={loadingChat} className={cx.btn}>
                <Check className="w-3 h-3 inline mr-1" />
                Approve Plan
              </button>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message…"
            className={`flex-1 ${cx.input}`}
          />
          <button onClick={handleSend} disabled={loadingChat || !inputValue.trim()} className={cx.btn}>
            <Send className="w-3 h-3 inline mr-1" />
            Send
          </button>
          <button onClick={() => setShowResetConfirm(true)} disabled={loadingReset} className={cx.btnOutline}>
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Reset
          </button>
        </div>
      </div>
    )
  }

  /* ---- TAB 2: Knowledge Base ---- */
  function renderKnowledge() {
    async function handleAddKb() {
      if (!kbTitle.trim() || !kbContent.trim()) return
      try {
        await apiPost('/director/knowledge', { title: kbTitle, content: kbContent, category: kbCategory })
        toast.success('Knowledge entry added')
        setKbTitle('')
        setKbContent('')
        void fetchKnowledge()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add knowledge')
      }
    }

    return (
      <div className="space-y-6">
        {/* Upload zone */}
        <div className={`${cx.card} border-dashed flex flex-col items-center justify-center py-10 gap-2`}>
          <BookOpen className="w-8 h-8 text-white/30" />
          <p className="text-xs text-white/40">Drag files here to upload (coming soon)</p>
        </div>

        {/* Add Knowledge form */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Add Knowledge</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={kbTitle}
              onChange={(e) => setKbTitle(e.target.value)}
              placeholder="Title"
              className={cx.input}
            />
            <select value={kbCategory} onChange={(e) => setKbCategory(e.target.value)} className={cx.select}>
              <option value="product">Product</option>
              <option value="brand">Brand</option>
              <option value="occasion">Occasion</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <textarea
            value={kbContent}
            onChange={(e) => setKbContent(e.target.value)}
            placeholder="Content"
            rows={4}
            className={`${cx.textarea} mt-3`}
          />
          <button onClick={handleAddKb} disabled={!kbTitle.trim() || !kbContent.trim()} className={`${cx.btn} mt-3`}>
            Add
          </button>
        </div>

        {/* Entries table */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Knowledge Entries</h3>
          {kbEntries.length === 0 ? (
            <p className="text-xs text-white/40">No entries yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50 border-b border-[#2A2A35]">
                  <th className="text-left py-2 font-medium">Title</th>
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-left py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {kbEntries.map((e, i) => (
                  <tr key={e.id ?? i} className="border-b border-[#2A2A35]/50 hover:bg-[#2A2A35]/20">
                    <td className="py-2 text-white/80">{e.title}</td>
                    <td className="py-2 text-white/60">{e.category}</td>
                    <td className="py-2 text-white/50">{e.created_at ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  /* ---- TAB 3: Avatar Intelligence ---- */
  function renderIntelligence() {
    async function handleSaveIntelligence() {
      if (!selectedAvatarId) return
      try {
        await apiPost('/director/avatar-intelligence', {
          metahuman_id: selectedAvatarId,
          knowledge_areas: knowledgeAreas,
          specialization,
        })
        toast.success('Avatar intelligence saved')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to save intelligence')
      }
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {avatars.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedAvatarId(a.id)
                setKnowledgeAreas([])
                setSpecialization('')
              }}
              className={`${cx.card} text-left transition-colors ${
                selectedAvatarId === a.id ? 'border-[#D4AF37]' : ''
              }`}
            >
              <UserCog className="w-5 h-5 text-[#D4AF37] mb-1" />
              <p className="text-xs font-medium text-white truncate">{a.name}</p>
              <p className="text-[10px] text-white/50">{a.gender ?? '—'} · {a.brand_archetype ?? '—'}</p>
            </button>
          ))}
          {avatars.length === 0 && <p className="text-xs text-white/40 col-span-full">No avatars loaded.</p>}
        </div>

        {selectedAvatar && (
          <div className={cx.card}>
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
              {selectedAvatar.name} — Knowledge Areas
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {KNOWLEDGE_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-1.5 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={knowledgeAreas.includes(area)}
                    onChange={() => toggleKnowledgeArea(area)}
                    className="accent-[#D4AF37]"
                  />
                  {area.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Specialization (e.g. engagement rings)"
              className={`${cx.input} w-full mb-3`}
            />
            <button onClick={handleSaveIntelligence} className={cx.btn}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Save Intelligence
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ---- TAB 4: Training ---- */
  function renderTraining() {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className={`${cx.card} flex flex-wrap items-end gap-3`}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/50">Start Date</label>
            <input type="date" value={trainFilterStart} onChange={(e) => setTrainFilterStart(e.target.value)} className={cx.input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/50">End Date</label>
            <input type="date" value={trainFilterEnd} onChange={(e) => setTrainFilterEnd(e.target.value)} className={cx.input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/50">Rating</label>
            <select value={trainFilterRating} onChange={(e) => setTrainFilterRating(e.target.value)} className={cx.select}>
              <option value="">All</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-white/80 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={trainFilterFlagged}
              onChange={(e) => setTrainFilterFlagged(e.target.checked)}
              className="accent-[#D4AF37]"
            />
            Flagged only
          </label>
        </div>

        {/* Table */}
        <div className={cx.card}>
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-white/40">No training logs found.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50 border-b border-[#2A2A35]">
                  <th className="text-left py-2 font-medium">Session ID</th>
                  <th className="text-left py-2 font-medium">Avatar</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Msgs</th>
                  <th className="text-left py-2 font-medium">Rating</th>
                  <th className="text-left py-2 font-medium">Flagged</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.session_id} className="border-b border-[#2A2A35]/50">
                    <td className="py-2">
                      <button
                        onClick={() => setExpandedSession(expandedSession === log.session_id ? null : log.session_id)}
                        className="text-[#D4AF37] hover:underline"
                      >
                        {log.session_id.slice(0, 8)}…
                      </button>
                    </td>
                    <td className="py-2 text-white/80">{log.avatar ?? '—'}</td>
                    <td className="py-2 text-white/50">{log.date ?? '—'}</td>
                    <td className="py-2 text-white/60">{log.messages ?? 0}</td>
                    <td className="py-2 text-[#D4AF37]">{stars(log.rating ?? 0)}</td>
                    <td className="py-2">
                      {log.flagged ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expanded conversation */}
        {expandedSession && (() => {
          const log = filteredLogs.find((l) => l.session_id === expandedSession)
          if (!log?.conversation?.length) return null
          return (
            <div className={cx.card}>
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                Conversation — {expandedSession.slice(0, 8)}…
              </h3>
              <div className="space-y-2">
                {log.conversation.map((m, i) => (
                  <div key={i} className={`text-xs px-3 py-2 rounded ${m.role === 'user' ? 'bg-[#D4AF37]/10' : 'bg-[#2A2A35]'}`}>
                    <span className="font-medium text-white/50 capitalize">{m.role}:</span>{' '}
                    <span className="text-white/80">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  /* ---- TAB 5: Prompts ---- */
  function renderPrompts() {
    async function handleSavePrompt() {
      if (!promptAvatarId) return
      try {
        await apiPost('/director/prompts', {
          metahuman_id: promptAvatarId,
          system_prompt: systemPrompt,
          personality,
        })
        toast.success('Prompt saved')
        setSavedPrompt(systemPrompt)
        setSavedPersonality({ ...personality })
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to save prompt')
      }
    }

    function handleRevert() {
      setSystemPrompt(savedPrompt)
      setPersonality({ ...savedPersonality })
    }

    const TRAITS = ['warmth', 'competence', 'agreeableness', 'openness', 'conscientiousness'] as const

    return (
      <div className="space-y-6">
        {/* Avatar selector */}
        <div className={cx.card}>
          <label className="text-[10px] text-white/50 block mb-1">Select Avatar</label>
          <select
            value={promptAvatarId ?? ''}
            onChange={(e) => setPromptAvatarId(e.target.value || null)}
            className={`${cx.select} w-full`}
          >
            <option value="">— Choose —</option>
            {avatars.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {promptAvatarId && (
          <>
            {/* System prompt */}
            <div className={cx.card}>
              <label className="text-[10px] text-white/50 block mb-1">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={8}
                className={cx.textarea}
              />
            </div>

            {/* Personality traits */}
            <div className={cx.card}>
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                Personality Traits
              </h3>
              <div className="space-y-3">
                {TRAITS.map((trait) => (
                  <div key={trait} className="flex items-center gap-3">
                    <span className="text-xs text-white/70 w-32 capitalize">{trait}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={personality[trait]}
                      onChange={(e) => setPersonality((p) => ({ ...p, [trait]: Number(e.target.value) }))}
                      className="flex-1 accent-[#D4AF37]"
                    />
                    <span className="text-xs text-white/50 w-8 text-right">{personality[trait]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleSavePrompt} className={cx.btn}>Save</button>
              <button onClick={handleRevert} className={cx.btnOutline}>Revert</button>
            </div>
          </>
        )}
      </div>
    )
  }

  /* ---- TAB 6: Product Sync ---- */
  function renderSync() {
    async function handleTriggerSync() {
      try {
        await apiPost('/director/product-sync/trigger')
        toast.success('Sync triggered')
        void fetchSyncStatus()
        void fetchSyncProducts()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to trigger sync')
      }
    }

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Products', value: syncStatus.total_products ?? '—' },
            { label: 'Last Sync', value: syncStatus.last_sync ?? '—' },
            { label: 'Sync Status', value: syncStatus.status ?? '—' },
          ].map((s) => (
            <div key={s.label} className={cx.card}>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-semibold text-white mt-1">{String(s.value)}</p>
            </div>
          ))}
        </div>

        <button onClick={handleTriggerSync} className={cx.btn}>
          <Package className="w-3 h-3 inline mr-1" />
          Sync Now
        </button>

        {/* Products table */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Products</h3>
          {syncProducts.length === 0 ? (
            <p className="text-xs text-white/40">No products synced.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/50 border-b border-[#2A2A35]">
                    <th className="text-left py-2 font-medium">Name</th>
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-left py-2 font-medium">Price</th>
                    <th className="text-left py-2 font-medium">Synced At</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {syncProducts.map((p, i) => (
                    <tr key={i} className="border-b border-[#2A2A35]/50 hover:bg-[#2A2A35]/20">
                      <td className="py-2 text-white/80">{p.name}</td>
                      <td className="py-2 text-white/60">{p.category}</td>
                      <td className="py-2 text-white/60">${p.price?.toLocaleString() ?? '—'}</td>
                      <td className="py-2 text-white/50">{p.synced_at ?? '—'}</td>
                      <td className="py-2 text-white/60">{p.status ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ---- TAB 7: Context Rules ---- */
  function renderRules() {
    async function handleToggleRule(rule: ContextRule) {
      const ruleId = rule.rule_id ?? rule.id ?? ''
      try {
        await apiPost('/director/context-rules/toggle', { rule_id: ruleId, active: !rule.active })
        toast.success(`Rule ${rule.active ? 'deactivated' : 'activated'}`)
        void fetchContextRules()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to toggle rule')
      }
    }

    async function handleAddRule() {
      if (!newRuleName.trim()) return
      try {
        await apiPost('/director/context-rules', {
          name: newRuleName,
          trigger_type: newRuleTrigger,
          response_mode: newRuleMode,
          active: true,
        })
        toast.success('Rule added')
        setNewRuleName('')
        void fetchContextRules()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add rule')
      }
    }

    return (
      <div className="space-y-6">
        {/* Rules table */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Context Rules</h3>
          {contextRules.length === 0 ? (
            <p className="text-xs text-white/40">No rules configured.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50 border-b border-[#2A2A35]">
                  <th className="text-left py-2 font-medium">Rule Name</th>
                  <th className="text-left py-2 font-medium">Trigger</th>
                  <th className="text-left py-2 font-medium">Response Mode</th>
                  <th className="text-left py-2 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {contextRules.map((r, i) => (
                  <tr key={r.id ?? r.rule_id ?? i} className="border-b border-[#2A2A35]/50 hover:bg-[#2A2A35]/20">
                    <td className="py-2 text-white/80">{r.name}</td>
                    <td className="py-2 text-white/60">{r.trigger_type}</td>
                    <td className="py-2 text-white/60">{r.response_mode}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleToggleRule(r)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          r.active ? 'bg-[#D4AF37]' : 'bg-[#2A2A35]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            r.active ? 'translate-x-4' : ''
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add rule form */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Add Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              placeholder="Rule name"
              className={cx.input}
            />
            <select value={newRuleTrigger} onChange={(e) => setNewRuleTrigger(e.target.value)} className={cx.select}>
              {['anniversary', 'birthday', 'graduation', 'engagement', 'valentines', 'mothers_day', 'holiday'].map(
                (t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ),
              )}
            </select>
            <select value={newRuleMode} onChange={(e) => setNewRuleMode(e.target.value)} className={cx.select}>
              {['refined_confident', 'warm_guided', 'standard'].map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAddRule} disabled={!newRuleName.trim()} className={`${cx.btn} mt-3`}>
            Save Rule
          </button>
        </div>
      </div>
    )
  }

  /* ---- TAB 8: Sales Intel ---- */
  function renderSales() {
    async function handleAddToKb(q: UnansweredQuestion) {
      try {
        await apiPost('/director/knowledge', {
          title: q.question,
          content: q.question,
          category: 'faq',
        })
        toast.success('Added to Knowledge Base')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add to KB')
      }
    }

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Conversion Rate', value: salesSummary.conversion_rate != null ? `${salesSummary.conversion_rate}%` : '—' },
            { label: 'Avg Session Duration', value: salesSummary.avg_session_duration != null ? `${salesSummary.avg_session_duration}s` : '—' },
            { label: 'Top Category', value: salesSummary.top_category ?? '—' },
          ].map((s) => (
            <div key={s.label} className={cx.card}>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-semibold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Unanswered questions */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
            Top Unanswered Questions
          </h3>
          {unanswered.length === 0 ? (
            <p className="text-xs text-white/40">No unanswered questions recorded.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50 border-b border-[#2A2A35]">
                  <th className="text-left py-2 font-medium">Question</th>
                  <th className="text-left py-2 font-medium">Times Asked</th>
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-right py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {unanswered.map((q, i) => (
                  <tr key={i} className="border-b border-[#2A2A35]/50 hover:bg-[#2A2A35]/20">
                    <td className="py-2 text-white/80">{q.question}</td>
                    <td className="py-2 text-white/60">{q.times_asked}</td>
                    <td className="py-2 text-white/50">{q.category ?? '—'}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleAddToKb(q)} className="text-[10px] text-[#D4AF37] hover:underline">
                        Add to KB
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  /* ---- TAB 9: A/B Testing ---- */
  function renderABTesting() {
    async function handleCreateTest() {
      if (!newTestName.trim()) return
      try {
        await apiPost('/director/ab-tests', {
          test_name: newTestName,
          variant_a_persona: newVariantA,
          variant_b_persona: newVariantB,
          metric: newMetric,
        })
        toast.success('A/B test created')
        setNewTestName('')
        setNewVariantA('')
        setNewVariantB('')
        void fetchAbTests()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to create A/B test')
      }
    }

    return (
      <div className="space-y-6">
        {/* Active tests */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Active Tests</h3>
          {abTests.length === 0 ? (
            <p className="text-xs text-white/40">No A/B tests running.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/50 border-b border-[#2A2A35]">
                    <th className="text-left py-2 font-medium">Test Name</th>
                    <th className="text-left py-2 font-medium">Variant A</th>
                    <th className="text-left py-2 font-medium">Variant B</th>
                    <th className="text-left py-2 font-medium">Start</th>
                    <th className="text-left py-2 font-medium">Sessions</th>
                    <th className="text-left py-2 font-medium">Conv A%</th>
                    <th className="text-left py-2 font-medium">Conv B%</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {abTests.map((t, i) => (
                    <tr key={t.id ?? i} className="border-b border-[#2A2A35]/50 hover:bg-[#2A2A35]/20">
                      <td className="py-2 text-white/80">{t.test_name}</td>
                      <td className="py-2 text-white/60">{t.variant_a}</td>
                      <td className="py-2 text-white/60">{t.variant_b}</td>
                      <td className="py-2 text-white/50">{t.start_date ?? '—'}</td>
                      <td className="py-2 text-white/60">{t.sessions ?? 0}</td>
                      <td className="py-2 text-white/60">{t.conversion_a != null ? `${t.conversion_a}%` : '—'}</td>
                      <td className="py-2 text-white/60">{t.conversion_b != null ? `${t.conversion_b}%` : '—'}</td>
                      <td className="py-2 text-white/50">{t.status ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create test form */}
        <div className={cx.card}>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Create Test</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="Test name"
              className={cx.input}
            />
            <select value={newMetric} onChange={(e) => setNewMetric(e.target.value)} className={cx.select}>
              <option value="conversion">Conversion</option>
              <option value="engagement">Engagement</option>
              <option value="session_duration">Session Duration</option>
            </select>
            <input
              type="text"
              value={newVariantA}
              onChange={(e) => setNewVariantA(e.target.value)}
              placeholder="Variant A persona"
              className={cx.input}
            />
            <input
              type="text"
              value={newVariantB}
              onChange={(e) => setNewVariantB(e.target.value)}
              placeholder="Variant B persona"
              className={cx.input}
            />
          </div>
          <button onClick={handleCreateTest} disabled={!newTestName.trim()} className={`${cx.btn} mt-3`}>
            <FlaskConical className="w-3 h-3 inline mr-1" />
            Start Test
          </button>
        </div>
      </div>
    )
  }

  /* ================================================================ */
  /*  Tab content router                                               */
  /* ================================================================ */

  function renderTabContent() {
    switch (activeTab) {
      case 'chat': return renderChat()
      case 'knowledge': return renderKnowledge()
      case 'intelligence': return renderIntelligence()
      case 'training': return renderTraining()
      case 'prompts': return renderPrompts()
      case 'sync': return renderSync()
      case 'rules': return renderRules()
      case 'sales': return renderSales()
      case 'ab': return renderABTesting()
    }
  }

  /* ================================================================ */
  /*  Main render                                                      */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 flex flex-col">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-[#D4AF37]" />
          <div>
            <h1 className="text-2xl font-semibold text-white">The Brain — AI Director</h1>
            <p className="text-sm text-white/50 mt-0.5">
              Central intelligence hub for production, avatars, and learning
            </p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#D4AF37] text-black'
                  : 'text-white/60 hover:text-white hover:bg-[#2A2A35]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-h-0">{renderTabContent()}</div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 max-w-sm">
            <p className="text-white mb-4">Reset the Director to idle state? This will clear the conversation.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className={cx.btnOutline}>
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loadingReset}
                className="px-4 py-2 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
