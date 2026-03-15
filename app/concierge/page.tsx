/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Mic, MicOff, Send, Volume2, Loader2 } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api/client'
import { listMetahumans } from '@/lib/api/metahumans'
import type { MetaHuman } from '@/lib/api/metahumans'
import { sendCommand } from '@/lib/api/scene-control'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useMicrophone } from '@/lib/hooks/useMicrophone'
import { AvatarBrainPanel } from '@/components/studio/AvatarBrainPanel'
import { CustomPieceDesigner } from '@/components/studio/CustomPieceDesigner'
import { LiveViewport } from '@/components/studio/LiveViewport'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { EmptyState } from '@/components/shared/EmptyState'

const API_URL = process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL?.replace(/\/$/, '') ?? ''

const INPUT =
  'w-full bg-surface border border-surface-border rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'bg-gold text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gold-hover disabled:opacity-50 transition-colors'
const BTN_OUTLINE =
  'border border-surface-border text-white/70 text-sm font-medium rounded-md px-4 py-2 hover:text-white hover:border-white/30 transition-colors'

type ConciergeTab = 'session' | 'design' | 'brain' | 'feedback'

const TABS: { id: ConciergeTab; label: string }[] = [
  { id: 'session', label: 'Live Session' },
  { id: 'design', label: 'Design a Piece' },
  { id: 'brain', label: 'Avatar Brain' },
  { id: 'feedback', label: 'RLHF Feedback' },
]

interface MessageEntry {
  role: 'user' | 'assistant'
  text: string
  emotion?: string
  gesture?: string
}

interface InteractVoice {
  text: string
  audio_path: string | null
  emotion: string
  gesture: string
  ue_commands: { command: string; [k: string]: unknown }[]
}

interface InteractResponse {
  mode: string
  voice?: InteractVoice
  session_id: string
  persona_key: string
}

/* ────────────────────── Live Session Tab ────────────────────── */

function SessionTab({ avatar }: { avatar: MetaHuman }) {
  const [health, setHealth] = useState<string>('unknown')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageEntry[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { incrementInteraction } = useAvatarBrainStore()
  const { customers, activeCustomerId, setActiveCustomer } = useCustomerStore()
  const mic = useMicrophone()

  const setEnvironment = useSceneStateStore((s) => s.setEnvironment)
  useEffect(() => { setEnvironment('avatar') }, [setEnvironment])

  const checkHealth = useCallback(async () => {
    try {
      const res = await apiGet<{ status: string }>('/concierge/health')
      setHealth(res.status)
    } catch {
      setHealth('offline')
    }
  }, [])

  useEffect(() => { checkHealth() }, [checkHealth])

  const logEngagement = useCallback(async (msgCount: number) => {
    if (msgCount === 0) return
    try {
      await apiPost('/v1/lighting/engagement', {
        vm_role: 'avatar',
        avg_session_duration_sec: msgCount * 15,
        conversion_rate: null,
        bounce_rate: msgCount < 2 ? 1.0 : 0.0,
      })
    } catch { /* best-effort */ }
  }, [])

  useEffect(() => {
    return () => { logEngagement(messages.length) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  async function playAudioFromPath(audioPath: string) {
    if (!audioPath || !API_URL) return
    const filename = audioPath.split('/').pop()
    if (!filename) return
    const url = `${API_URL}/director/audio/${encodeURIComponent(filename)}`
    try {
      setPlayingAudio(true)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPlayingAudio(false)
      audio.onerror = () => setPlayingAudio(false)
      await audio.play()
    } catch {
      setPlayingAudio(false)
    }
  }

  const startSession = async () => {
    if (sessionId && messages.length > 0) logEngagement(messages.length)
    const newId = crypto.randomUUID()
    setSessionId(newId)
    setMessages([])
    toast.success(`Session started for ${avatar.name}`)
  }

  const sendMessage = async () => {
    let text = input.trim()
    if (!text && mic.transcript.trim()) {
      text = mic.transcript.trim()
      mic.clearTranscript()
    }
    if (!text || sending) return
    if (!sessionId) {
      const newId = crypto.randomUUID()
      setSessionId(newId)
    }
    setInput('')
    if (mic.isListening) mic.stopListening()

    setMessages((p) => [...p, { role: 'user', text }])
    setSending(true)
    scrollToBottom()

    try {
      const res = await apiPost<InteractResponse>('/director/interact', {
        session_id: sessionId,
        metahuman_name: avatar.name,
        user_input: text,
      })

      const voice = res.voice
      const assistantText = voice?.text ?? '(no response)'
      setMessages((p) => [...p, {
        role: 'assistant',
        text: assistantText,
        emotion: voice?.emotion,
        gesture: voice?.gesture,
      }])
      incrementInteraction(avatar.id)
      scrollToBottom()

      if (voice?.audio_path) {
        playAudioFromPath(voice.audio_path)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Interaction failed')
    } finally {
      setSending(false)
    }
  }

  function toggleMic() {
    if (mic.isListening) {
      mic.stopListening()
      if (mic.transcript.trim()) setInput(mic.transcript.trim())
    } else {
      mic.clearTranscript()
      setInput('')
      mic.startListening()
    }
  }

  useEffect(() => {
    if (mic.isListening && mic.transcript) {
      setInput(mic.transcript)
    }
  }, [mic.isListening, mic.transcript])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Status bar */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${health === 'ok' ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-sm text-white/70">
              Engine: <span className="capitalize">{health}</span>
            </span>
          </div>
          <span className="text-sm text-white/40">
            Avatar: <span className="text-gold">{avatar.name}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">Customer:</span>
            <select
              className="bg-surface border border-surface-border rounded px-2 py-1 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-gold"
              value={activeCustomerId ?? ''}
              onChange={(e) => setActiveCustomer(e.target.value || null)}
            >
              <option value="">No customer selected</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {sessionId && (
            <span className="text-xs text-white/30">
              Session: {sessionId.slice(0, 8)}...
            </span>
          )}
          {playingAudio && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              <Volume2 className="h-3 w-3 animate-pulse" /> Speaking...
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={checkHealth} className={BTN_OUTLINE}>Refresh</button>
            <button onClick={startSession} className={BTN_GOLD}>
              {sessionId ? 'New Session' : 'Start Session'}
            </button>
          </div>
        </div>
      </Card>

      {/* Viewport + Chat split */}
      <div className="grid grid-cols-[1fr_1fr] gap-4 flex-1 min-h-0">
        {/* Viewport */}
        <div className="rounded-lg border border-surface-border overflow-hidden bg-surface min-h-[350px]">
          <LiveViewport />
        </div>

        {/* Chat */}
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col flex-1" title={`${avatar.name} — Test Console`}>
            <div
              ref={scrollRef}
              className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1"
            >
              {messages.length === 0 && (
                <EmptyState
                  title={sessionId ? 'Session active' : 'No session'}
                  description={sessionId
                    ? `Speak or type to test ${avatar.name}'s responses.`
                    : `Start a session or just send a message to begin.`
                  }
                />
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-gold/10 text-white'
                        : 'bg-surface-border/40 text-white/90'
                    }`}
                  >
                    {m.text}
                    {m.role === 'assistant' && (m.emotion || m.gesture) && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/30">
                        {m.emotion && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">{m.emotion}</span>}
                        {m.gesture && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{m.gesture}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2.5 bg-surface-border/40">
                    <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Input bar */}
          <div className="flex gap-2">
            {mic.isSupported && (
              <button
                onClick={toggleMic}
                className={`h-10 w-10 flex items-center justify-center rounded-md transition-colors ${
                  mic.isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-surface border border-surface-border text-white/40 hover:text-white hover:border-white/20'
                }`}
                title={mic.isListening ? 'Stop recording' : 'Start recording'}
              >
                {mic.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <input
              className={INPUT}
              placeholder={mic.isListening ? 'Listening...' : `Talk to ${avatar.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className={BTN_GOLD}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────── RLHF Feedback Tab ────────────────────── */

function FeedbackTab({ avatar }: { avatar: MetaHuman }) {
  const [sessionId, setSessionId] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [notes, setNotes] = useState('')

  const { updateSkill } = useAvatarBrainStore()

  const submitFeedback = async () => {
    if (!sessionId.trim()) {
      toast.error('Session ID is required')
      return
    }
    try {
      await apiPost('/concierge/feedback', {
        session_id: sessionId,
        avatar_id: avatar.id,
        rating,
        notes: notes.trim() || undefined,
      })
      const delta = rating >= 7 ? 0.02 : rating <= 3 ? -0.02 : 0
      if (delta !== 0) {
        updateSkill(avatar.id, 'Greeting', delta)
        updateSkill(avatar.id, 'Product Knowledge', delta)
        updateSkill(avatar.id, 'Closing', delta)
      }
      toast.success(`Feedback submitted for ${avatar.name}`)
      setSessionId('')
      setNotes('')
      setRating(5)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Feedback failed')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title={`RLHF Feedback — ${avatar.name}`}>
        <p className="text-xs text-white/40 mb-4">
          Rate {avatar.name}&apos;s performance. Feedback directly updates their individual brain — skills improve or decline based on your rating.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Session ID</label>
            <input
              className={INPUT}
              placeholder="Paste session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Rating (1-10)</label>
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>Poor</span>
              <span className="text-gold font-medium">{rating}/10</span>
              <span>Excellent</span>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/50 mb-1">Notes</label>
            <textarea
              className={`${INPUT} min-h-[80px] resize-y`}
              placeholder="What did the avatar do well or poorly?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={submitFeedback} className={BTN_GOLD}>
            Submit Feedback
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Main Page ────────────────────── */

export default function ConciergePage() {
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<MetaHuman | null>(null)
  const [tab, setTab] = useState<ConciergeTab>('session')

  useEffect(() => {
    listMetahumans().then((list) => {
      setAvatars(list)
      if (list.length > 0) setSelectedAvatar(list[0])
    }).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      <div>
        <h1 className="text-2xl font-semibold text-white">Concierge — Test Console</h1>
        <p className="text-sm text-white/50 mt-1">
          Talk to avatars in real-time. Full AI pipeline: voice recognition, concierge brain, TTS, emotions, gestures — all in the viewport.
        </p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6 flex-1 min-h-0">
        {/* Avatar selector */}
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

        {/* Main content */}
        <div className="flex flex-col gap-4 min-h-0">
          {selectedAvatar ? (
            <>
              <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />
              {tab === 'session' && <SessionTab avatar={selectedAvatar} />}
              {tab === 'design' && (
                <Card title={`${selectedAvatar.name} — Design a Piece`}>
                  <CustomPieceDesigner
                    avatarId={selectedAvatar.id}
                    avatarName={selectedAvatar.name}
                  />
                </Card>
              )}
              {tab === 'brain' && (
                <Card title={`${selectedAvatar.name} — Brain`}>
                  <AvatarBrainPanel
                    metahumanId={selectedAvatar.id}
                    metahumanName={selectedAvatar.name}
                  />
                </Card>
              )}
              {tab === 'feedback' && <FeedbackTab avatar={selectedAvatar} />}
            </>
          ) : (
            <EmptyState
              title="Select an avatar"
              description="Choose a MetaHuman to start a concierge session, view their brain, or submit feedback."
            />
          )}
        </div>
      </div>
    </div>
  )
}
