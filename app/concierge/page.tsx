/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  User,
  Brain,
  BookOpen,
  MessageSquare,
  Upload,
  Link,
  Trash2,
  RefreshCw,
  Plus,
  Save,
  Loader2,
} from 'lucide-react'

import { apiGet, apiPost, apiPut, apiUpload, apiDelete } from '@/lib/api/client'
import { postConciergeIdleSignal } from '@/lib/api/concierge'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'

const inputClass =
  'w-full px-3 py-2 bg-surface-panel border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-brand-gold'
const buttonClass =
  'px-4 py-2 bg-brand-gold text-black font-medium text-sm rounded-md hover:bg-brand-gold/90 disabled:opacity-50'
const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
    active
      ? 'border-brand-gold text-brand-gold'
      : 'border-transparent text-white/50 hover:text-white/70'
  }`

type Tab = 'personas' | 'knowledge' | 'brain' | 'sessions'

interface PersonaRow {
  key: string
  name: string
  tone: string
  speech_style: string
  persuasion_style: string
  energy_level: string
  vocabulary_bias: string[]
  backstory: string
  humor_style: string
  emotional_range: string
  greeting_style: string
  voice: Record<string, unknown>
  presence: Record<string, unknown>
  expertise: Record<string, unknown>
  llm_system_prompt: string
  source: string
}

interface KnowledgeRow {
  id: string
  source_type: string
  source_ref: string
  category: string
  chunk_text: string
  created_at: string
}

interface AvatarRow {
  id: string
  name: string
  status: string
}

interface MessageEntry {
  role: 'user' | 'assistant'
  text: string
}

export default function ConciergePage() {
  const [tab, setTab] = useState<Tab>('personas')

  /* Personas */
  const [personas, setPersonas] = useState<PersonaRow[]>([])
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState<PersonaRow | null>(null)
  const [editFields, setEditFields] = useState<Partial<PersonaRow>>({})
  const [savingPersona, setSavingPersona] = useState(false)

  /* Knowledge */
  const [knowledgeMetahuman, setKnowledgeMetahuman] = useState('rebecca')
  const [knowledgeRows, setKnowledgeRows] = useState<KnowledgeRow[]>([])
  const [loadingKnowledge, setLoadingKnowledge] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [ingesting, setIngesting] = useState(false)

  /* Brain / query */
  const [brainMetahuman, setBrainMetahuman] = useState('rebecca')
  const [brainQuery, setBrainQuery] = useState('')
  const [brainResults, setBrainResults] = useState<KnowledgeRow[]>([])
  const [queryingBrain, setQueryingBrain] = useState(false)

  /* Sessions (existing) */
  const [avatars, setAvatars] = useState<AvatarRow[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<MessageEntry[]>([])
  const [sendingMessage, setSendingMessage] = useState(false)
  const [startingSession, setStartingSession] = useState(false)
  const [healthStatus, setHealthStatus] = useState<string | null>(null)

  /* ─── Loaders ─── */

  const loadPersonas = useCallback(async () => {
    setLoadingPersonas(true)
    try {
      const data = await apiGet<PersonaRow[]>('/v1/personas')
      setPersonas(Array.isArray(data) ? data : [])
      if (!selectedPersona && Array.isArray(data) && data.length > 0) {
        setSelectedPersona(data[0])
        setEditFields(data[0])
      }
    } catch {
      setPersonas([])
    } finally {
      setLoadingPersonas(false)
    }
  }, [selectedPersona])

  const loadKnowledge = useCallback(async () => {
    if (!knowledgeMetahuman) return
    setLoadingKnowledge(true)
    try {
      const data = await apiGet<KnowledgeRow[]>(
        `/v1/metahuman/${encodeURIComponent(knowledgeMetahuman)}/knowledge`,
      )
      setKnowledgeRows(Array.isArray(data) ? data : [])
    } catch {
      setKnowledgeRows([])
    } finally {
      setLoadingKnowledge(false)
    }
  }, [knowledgeMetahuman])

  const loadAvatars = useCallback(async () => {
    setLoadingAvatars(true)
    try {
      const data = await apiGet<AvatarRow[] | { avatars?: AvatarRow[] }>('/concierge/avatars')
      const list = Array.isArray(data) ? data : (data as { avatars?: AvatarRow[] }).avatars ?? []
      setAvatars(list)
    } catch {
      setAvatars([])
    } finally {
      setLoadingAvatars(false)
    }
  }, [])

  const loadHealth = useCallback(async () => {
    try {
      const res = await apiGet<{ status: string }>('/concierge/health')
      setHealthStatus(res.status ?? 'ok')
    } catch {
      setHealthStatus('unavailable')
    }
  }, [])

  useEffect(() => {
    void loadPersonas()
    void loadHealth()
    void loadAvatars()
  }, [])

  useEffect(() => {
    if (tab === 'knowledge') void loadKnowledge()
  }, [tab, knowledgeMetahuman])

  /* ─── Persona editing ─── */

  const handleEditField = (field: string, value: unknown) => {
    setEditFields((prev) => ({ ...prev, [field]: value }))
  }

  const handleSavePersona = async () => {
    if (!selectedPersona) return
    setSavingPersona(true)
    try {
      const updated = await apiPut<PersonaRow>(
        `/v1/personas/${encodeURIComponent(selectedPersona.key)}`,
        editFields,
      )
      setSelectedPersona(updated)
      setEditFields(updated)
      toast.success('Persona saved')
      void loadPersonas()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingPersona(false)
    }
  }

  /* ─── Knowledge ingestion ─── */

  const handleIngestText = async () => {
    if (!textInput.trim()) return
    setIngesting(true)
    try {
      await apiPost(`/v1/metahuman/${encodeURIComponent(knowledgeMetahuman)}/knowledge/text`, {
        text: textInput.trim(),
        category: categoryInput || undefined,
      })
      setTextInput('')
      toast.success('Text ingested')
      void loadKnowledge()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ingestion failed')
    } finally {
      setIngesting(false)
    }
  }

  const handleIngestFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIngesting(true)
    try {
      await apiUpload(
        `/v1/metahuman/${encodeURIComponent(knowledgeMetahuman)}/knowledge/file${categoryInput ? `?category=${encodeURIComponent(categoryInput)}` : ''}`,
        file,
        'file',
      )
      toast.success('File ingested')
      void loadKnowledge()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'File ingestion failed')
    } finally {
      setIngesting(false)
      e.target.value = ''
    }
  }

  const handleIngestUrl = async () => {
    if (!urlInput.trim()) return
    setIngesting(true)
    try {
      await apiPost(`/v1/metahuman/${encodeURIComponent(knowledgeMetahuman)}/knowledge/url`, {
        url: urlInput.trim(),
        category: categoryInput || undefined,
      })
      setUrlInput('')
      toast.success('URL scraped & ingested')
      void loadKnowledge()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'URL ingestion failed')
    } finally {
      setIngesting(false)
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await apiDelete(`/v1/metahuman/${encodeURIComponent(knowledgeMetahuman)}/knowledge/${id}`)
      setKnowledgeRows((prev) => prev.filter((r) => r.id !== id))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  /* ─── Brain query (RAG) ─── */

  const handleQueryBrain = async () => {
    if (!brainQuery.trim()) return
    setQueryingBrain(true)
    try {
      const data = await apiPost<KnowledgeRow[]>(
        `/v1/metahuman/${encodeURIComponent(brainMetahuman)}/knowledge/query`,
        { query: brainQuery.trim(), top_k: 5 },
      )
      setBrainResults(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Query failed')
    } finally {
      setQueryingBrain(false)
    }
  }

  /* ─── Session ─── */

  const handleStartSession = async () => {
    setStartingSession(true)
    try {
      const res = await apiPost<{ session_id?: string; id?: string }>('/concierge/session', {})
      setSessionId(res.session_id ?? res.id ?? null)
      setMessages([])
      toast.success('Session started')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setStartingSession(false)
    }
  }

  const handleSendMessage = async () => {
    if (!sessionId || !messageInput.trim()) return
    setSendingMessage(true)
    const text = messageInput.trim()
    setMessageInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    try {
      const res = await apiPost<{ message?: string; response?: string }>(
        '/concierge/message',
        { session_id: sessionId, message: text },
      )
      const reply = res.message ?? res.response ?? ''
      if (reply) setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Concierge Console</h1>
          <p className="mt-1 text-sm text-white/60">
            Persona management, knowledge ingestion, brain viewer, sessions
          </p>
        </div>
        <StatusBadge status={healthStatus ?? 'loading'} />
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border">
        {([
          { key: 'personas' as Tab, icon: User, label: 'Personas' },
          { key: 'knowledge' as Tab, icon: BookOpen, label: 'Knowledge' },
          { key: 'brain' as Tab, icon: Brain, label: 'Brain Viewer' },
          { key: 'sessions' as Tab, icon: MessageSquare, label: 'Sessions' },
        ]).map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={tabClass(tab === t.key)}>
            <t.icon className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── PERSONAS TAB ─── */}
      {tab === 'personas' && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card>
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">Personas</h2>
            {loadingPersonas ? (
              <p className="text-sm text-white/40">Loading...</p>
            ) : (
              <div className="space-y-1.5">
                {personas.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => { setSelectedPersona(p); setEditFields(p) }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedPersona?.key === p.key
                        ? 'bg-brand-gold/15 text-brand-gold'
                        : 'text-white/70 hover:bg-surface-elevated'
                    }`}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-white/30">{p.source}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {selectedPersona && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">{selectedPersona.name}</h2>
                <button type="button" onClick={handleSavePersona} disabled={savingPersona} className={buttonClass}>
                  {savingPersona ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1 inline-block" />}
                  Save
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['tone', 'speech_style', 'persuasion_style', 'energy_level'] as const).map((f) => (
                  <div key={f}>
                    <label className="text-xs text-white/50 block mb-1">{f.replace(/_/g, ' ')}</label>
                    <input
                      value={(editFields[f] as string) ?? ''}
                      onChange={(e) => handleEditField(f, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-xs text-white/50 block mb-1">Backstory</label>
                <textarea
                  value={(editFields.backstory as string) ?? ''}
                  onChange={(e) => handleEditField('backstory', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="mt-4">
                <label className="text-xs text-white/50 block mb-1">Greeting Style</label>
                <textarea
                  value={(editFields.greeting_style as string) ?? ''}
                  onChange={(e) => handleEditField('greeting_style', e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div className="mt-4">
                <label className="text-xs text-white/50 block mb-1">LLM System Prompt</label>
                <textarea
                  value={(editFields.llm_system_prompt as string) ?? ''}
                  onChange={(e) => handleEditField('llm_system_prompt', e.target.value)}
                  rows={8}
                  className={`${inputClass} font-mono text-xs`}
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── KNOWLEDGE TAB ─── */}
      {tab === 'knowledge' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">MetaHuman</label>
                <select
                  value={knowledgeMetahuman}
                  onChange={(e) => setKnowledgeMetahuman(e.target.value)}
                  className={inputClass + ' w-48'}
                >
                  {personas.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Category (optional)</label>
                <input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="e.g. product-knowledge"
                  className={inputClass + ' w-48'}
                />
              </div>
              <button type="button" onClick={() => loadKnowledge()} className="mt-5 p-2 text-white/50 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Text ingestion */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Text
                </h3>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                  placeholder="Paste text to ingest..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleIngestText}
                  disabled={!textInput.trim() || ingesting}
                  className={buttonClass + ' w-full'}
                >
                  {ingesting ? 'Ingesting...' : 'Ingest Text'}
                </button>
              </div>

              {/* File ingestion */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  <Upload className="h-3 w-3" /> File
                </h3>
                <p className="text-xs text-white/40">PDF, CSV, JSON, TXT</p>
                <label className="flex items-center justify-center gap-2 cursor-pointer rounded-md border border-dashed border-surface-border p-6 hover:border-brand-gold/50 transition-colors">
                  <input type="file" accept=".pdf,.csv,.json,.txt" className="hidden" onChange={handleIngestFile} disabled={ingesting} />
                  <Upload className="h-5 w-5 text-white/30" />
                  <span className="text-xs text-white/40">{ingesting ? 'Uploading...' : 'Choose File'}</span>
                </label>
              </div>

              {/* URL ingestion */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  <Link className="h-3 w-3" /> URL
                </h3>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleIngestUrl}
                  disabled={!urlInput.trim() || ingesting}
                  className={buttonClass + ' w-full'}
                >
                  {ingesting ? 'Scraping...' : 'Scrape & Ingest'}
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
              Knowledge Base ({knowledgeRows.length} chunks)
            </h2>
            {loadingKnowledge ? (
              <p className="text-sm text-white/40">Loading...</p>
            ) : knowledgeRows.length === 0 ? (
              <p className="text-sm text-white/40">No knowledge ingested yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {knowledgeRows.map((row) => (
                  <div key={row.id} className="flex gap-3 rounded-lg border border-surface-border bg-surface-panel p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 text-[10px] text-white/40 mb-1">
                        <span>{row.source_type}</span>
                        {row.category && <span className="px-1 rounded bg-brand-gold/10 text-brand-gold">{row.category}</span>}
                        <span>{row.created_at?.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-3">{row.chunk_text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteKnowledge(row.id)}
                      className="shrink-0 p-1 text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── BRAIN VIEWER TAB ─── */}
      {tab === 'brain' && (
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-medium text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand-gold" /> Brain Viewer (RAG Query)
            </h2>
            <div className="flex gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">MetaHuman</label>
                <select
                  value={brainMetahuman}
                  onChange={(e) => setBrainMetahuman(e.target.value)}
                  className={inputClass + ' w-48'}
                >
                  {personas.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Query</label>
                <div className="flex gap-2">
                  <input
                    value={brainQuery}
                    onChange={(e) => setBrainQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQueryBrain()}
                    placeholder="What does the MetaHuman know about..."
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={handleQueryBrain}
                    disabled={!brainQuery.trim() || queryingBrain}
                    className={buttonClass}
                  >
                    {queryingBrain ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Query'}
                  </button>
                </div>
              </div>
            </div>

            {brainResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/50">{brainResults.length} relevant chunks</p>
                {brainResults.map((row) => (
                  <div key={row.id} className="rounded-lg border border-surface-border bg-surface-panel p-3">
                    <div className="flex gap-2 text-[10px] text-white/40 mb-1">
                      <span>{row.source_type}</span>
                      {row.category && <span className="px-1 rounded bg-brand-gold/10 text-brand-gold">{row.category}</span>}
                    </div>
                    <p className="text-xs text-white/70">{row.chunk_text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── SESSIONS TAB ─── */}
      {tab === 'sessions' && (
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-medium text-white">Available Avatars</h2>
            {loadingAvatars ? (
              <p className="text-sm text-white/60">Loading...</p>
            ) : avatars.length === 0 ? (
              <p className="text-sm text-white/60">No avatars available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-white/60">
                      <th className="pb-2 pr-4">ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avatars.map((a) => (
                      <tr key={a.id} className="border-b border-surface-border/50">
                        <td className="py-2 pr-4 text-white">{a.id}</td>
                        <td className="py-2 pr-4 text-white">{a.name}</td>
                        <td className="py-2"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-medium text-white">Session Controls</h2>
            <div className="space-y-4">
              <button type="button" onClick={handleStartSession} disabled={startingSession} className={buttonClass}>
                {startingSession ? 'Starting...' : 'Start Session'}
              </button>
              {sessionId && (
                <p className="text-sm text-white/80">
                  Session: <code className="rounded bg-surface-elevated px-1">{sessionId}</code>
                </p>
              )}
              <div className="flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!sessionId || !messageInput.trim() || sendingMessage}
                  className={buttonClass}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
              {messages.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded border border-surface-border bg-surface-elevated p-3 space-y-1">
                  {messages.map((m, i) => (
                    <p key={i} className={`text-sm ${m.role === 'user' ? 'text-white' : 'text-white/70'}`}>
                      <span className="font-medium text-white/50">{m.role}:</span> {m.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
