/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  PartyPopper,
  Heart,
  Gift,
  Star,
  GraduationCap,
  Snowflake,
  Rocket,
  Calendar,
  Film,
  Loader2,
  Play,
  Clock,
  Plus,
} from 'lucide-react'
import { listTemplates, listEvents, createEvent, generateEvent } from '@/lib/api/events'
import type { EventTemplate, StudioEvent } from '@/lib/api/events'
import { StatusBadge } from '@/components/shared/StatusBadge'

const EVENT_TYPES = [
  { id: 'birthday', label: 'Birthday', icon: PartyPopper, color: 'text-pink-400 bg-pink-500/10' },
  { id: 'anniversary', label: 'Anniversary', icon: Heart, color: 'text-red-400 bg-red-500/10' },
  { id: 'engagement', label: 'Engagement', icon: Star, color: 'text-gold bg-gold/10' },
  { id: 'bar_mitzvah', label: 'Bar Mitzvah', icon: Star, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'sweet_16', label: 'Sweet 16', icon: Gift, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'text-green-400 bg-green-500/10' },
  { id: 'holiday', label: 'Holiday', icon: Snowflake, color: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'product_launch', label: 'Product Launch', icon: Rocket, color: 'text-orange-400 bg-orange-500/10' },
]

export default function EventsPage() {
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [events, setEvents] = useState<StudioEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [t, e] = await Promise.all([
        listTemplates().catch(() => []),
        listEvents().catch(() => []),
      ])
      setTemplates(t)
      setEvents(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const selectedTemplate = selectedType
    ? templates.find((t) => t.event_type === selectedType) ?? null
    : null

  async function handleCreate() {
    if (!selectedType) { toast.error('Select an event type'); return }
    setCreating(true)
    try {
      const ev = await createEvent({
        event_type: selectedType,
        template_id: selectedTemplate?.id,
        customer_name: customerName || undefined,
      })
      toast.success(`Event created: ${ev.id.slice(0, 8)}`)
      setCustomerName('')
      refresh()
    } catch { toast.error('Failed to create event') }
    finally { setCreating(false) }
  }

  async function handleGenerate(eventId: string) {
    setGenerating(eventId)
    try {
      await generateEvent(eventId)
      toast.success('Event generation started')
      refresh()
    } catch { toast.error('Generation failed') }
    finally { setGenerating(null) }
  }

  return (
    <div className="flex h-full min-h-0">
      {/* LEFT — Event types */}
      <div className="w-[260px] shrink-0 border-r border-surface-border overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-pink-400" />
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Event Types</h2>
        </div>
        <div className="space-y-1.5">
          {EVENT_TYPES.map((et) => {
            const Icon = et.icon
            const hasTemplate = templates.some((t) => t.event_type === et.id)
            return (
              <button
                key={et.id}
                onClick={() => setSelectedType(et.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedType === et.id
                    ? 'border-pink-500 bg-pink-500/5'
                    : 'border-surface-border hover:border-white/20 bg-surface-panel'
                }`}
              >
                <div className={`rounded-lg p-1.5 ${et.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-white/70">{et.label}</p>
                  {hasTemplate && <p className="text-[8px] text-green-400/60">Template ready</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* CENTER — Event builder + history */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
        {!selectedType ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <PartyPopper className="h-12 w-12 mb-3" />
            <p className="text-sm">Select an event type to get started</p>
          </div>
        ) : (
          <>
            {/* Event builder */}
            <div className="rounded-lg border border-surface-border bg-surface-panel p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${EVENT_TYPES.find((e) => e.id === selectedType)?.color || 'bg-white/5'}`}>
                  {(() => { const Icon = EVENT_TYPES.find((e) => e.id === selectedType)?.icon || Star; return <Icon className="h-5 w-5" /> })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {EVENT_TYPES.find((e) => e.id === selectedType)?.label} Video
                  </h2>
                  <p className="text-xs text-white/40">Create a personalized milestone marketing video</p>
                </div>
              </div>

              {selectedTemplate && (
                <div className="p-3 rounded-lg border border-surface-border bg-surface text-[11px] space-y-1">
                  <p className="text-white/50 font-medium">{selectedTemplate.name}</p>
                  <p className="text-white/30">{selectedTemplate.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-white/25">
                    <span>Scene: {selectedTemplate.scene}</span>
                    <span>Avatar: {selectedTemplate.avatar_name || 'auto'}</span>
                    <span>Mood: {selectedTemplate.music_mood}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Customer Name (optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className="w-full h-9 px-3 bg-surface border border-surface-border rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white text-sm font-semibold rounded hover:bg-pink-500 disabled:opacity-40 transition-colors"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Event
                </button>
                <button
                  onClick={() => { handleCreate().then(() => { const latest = events[0]; if (latest) handleGenerate(latest.id) }) }}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gold text-black text-sm font-semibold rounded hover:bg-gold-hover disabled:opacity-40 transition-colors"
                >
                  <Film className="h-4 w-4" />
                  Generate Event Video
                </button>
              </div>
            </div>

            {/* Pipeline visualization */}
            <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Generation Pipeline</p>
              <div className="flex items-center gap-2 overflow-x-auto">
                {['Select Avatar', 'Generate Script', 'Generate Voice', 'Build Cinematic', 'Render Video'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-[10px] text-white/50 whitespace-nowrap">
                      <span className="text-gold/60 mr-1">{i + 1}</span>
                      {step}
                    </div>
                    {i < 4 && <span className="text-white/15">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Event history */}
            <div className="rounded-lg border border-surface-border bg-surface-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-white/30" />
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Event History</h3>
              </div>
              {loading ? (
                <div className="py-6 text-center text-white/20"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
              ) : events.length === 0 ? (
                <p className="text-xs text-white/25 text-center py-4">No events yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-white/30 border-b border-surface-border">
                        <th className="text-left py-2 pr-3 font-medium">ID</th>
                        <th className="text-left py-2 pr-3 font-medium">Type</th>
                        <th className="text-left py-2 pr-3 font-medium">Customer</th>
                        <th className="text-left py-2 pr-3 font-medium">Status</th>
                        <th className="text-left py-2 pr-3 font-medium">Created</th>
                        <th className="text-left py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr key={ev.id} className="border-b border-surface-border/50">
                          <td className="py-2 pr-3 text-white/50 font-mono text-xs">{ev.id.slice(0, 8)}</td>
                          <td className="py-2 pr-3 text-white/70 capitalize">{ev.event_type.replace(/_/g, ' ')}</td>
                          <td className="py-2 pr-3 text-white/50">{ev.customer_name || '—'}</td>
                          <td className="py-2 pr-3"><StatusBadge status={ev.status} /></td>
                          <td className="py-2 pr-3 text-white/30 text-xs">{new Date(ev.created_at).toLocaleDateString()}</td>
                          <td className="py-2">
                            {ev.status === 'draft' && (
                              <button
                                onClick={() => handleGenerate(ev.id)}
                                disabled={generating === ev.id}
                                className="flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-[10px] rounded hover:bg-gold/20 disabled:opacity-40"
                              >
                                {generating === ev.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                Generate
                              </button>
                            )}
                            {ev.output_video_url && (
                              <a href={ev.output_video_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gold hover:underline">
                                View Video
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
