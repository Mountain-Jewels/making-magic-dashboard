/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  User,
  Scissors,
  Palette,
  Shirt,
  Footprints,
  Gem,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Mic,
  Send,
  Brain,
  Loader2,
  UserPlus,
  X,
} from 'lucide-react'
import { listMetahumans, seedMetahumans, syncMetahumans, createMetahuman } from '@/lib/api/metahumans'
import type { MetaHuman } from '@/lib/api/metahumans'
import { getWardrobeInventory, searchWardrobeCandidates, approveWardrobeCandidate } from '@/lib/api/fashion'
import type { WardrobeItem, WardrobeCandidate } from '@/lib/api/fashion'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useAssetRegistryStore } from '@/lib/stores/asset-registry-store'
import { loadAvatar, metahumanSpeak, metahumanEmotion, metahumanGesture } from '@/lib/api/scene-control'
import { LiveViewport } from '@/components/studio/LiveViewport'
import { AvatarBrainPanel } from '@/components/studio/AvatarBrainPanel'
import { CustomPieceDesigner } from '@/components/studio/CustomPieceDesigner'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'
import { useMicrophone } from '@/lib/hooks/useMicrophone'
import { MicOff } from 'lucide-react'

interface StyleSection {
  id: string
  label: string
  icon: React.ElementType
  slot: string
}

const STYLE_SECTIONS: StyleSection[] = [
  { id: 'hair', label: 'Hair', icon: Scissors, slot: 'hair' },
  { id: 'makeup', label: 'Makeup', icon: Palette, slot: 'makeup' },
  { id: 'clothing', label: 'Clothing', icon: Shirt, slot: 'top' },
  { id: 'shoes', label: 'Shoes', icon: Footprints, slot: 'shoes' },
  { id: 'jewelry', label: 'Jewelry', icon: Gem, slot: 'jewelry' },
]

const EMOTIONS = ['neutral', 'celebratory', 'intimate', 'grateful', 'excited', 'warm'] as const
const GESTURES = ['wave', 'nod', 'present', 'bow', 'point', 'clap'] as const

export default function AvatarsPage() {
  const sceneStore = useSceneStateStore()
  const { getAvatarThumbnail, getWardrobeThumbnail } = useAssetRegistryStore()
  const { loadBrain, recordFashionChoice, setActiveAvatar } = useAvatarBrainStore()

  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selected, setSelected] = useState<MetaHuman | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>('hair')

  const [inventory, setInventory] = useState<WardrobeItem[]>([])
  const [candidates, setCandidates] = useState<WardrobeCandidate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const [speakText, setSpeakText] = useState('')
  const [emotion, setEmotion] = useState('neutral')
  const [gesture, setGesture] = useState('wave')
  const [busy, setBusy] = useState(false)
  const mic = useMicrophone()

  const [rightTab, setRightTab] = useState<'voice' | 'brain' | 'jewelry'>('voice')
  const [showRegister, setShowRegister] = useState(false)
  const [regName, setRegName] = useState('')
  const [regGender, setRegGender] = useState('female')
  const [regArchetype, setRegArchetype] = useState('')
  const [registering, setRegistering] = useState(false)

  const loadAvatars = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listMetahumans()
      setAvatars(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch { toast.error('Failed to load avatars') }
    finally { setLoading(false) }
  }, [selected])

  useEffect(() => { loadAvatars(); sceneStore.setEnvironment('avatar') }, [loadAvatars])

  useEffect(() => {
    if (!selected) return
    getWardrobeInventory(selected.id).then(setInventory).catch(() => setInventory([]))
  }, [selected])

  function selectAvatar(a: MetaHuman) {
    setSelected(a)
    sceneStore.setAvatar(a.name)
    loadAvatar(a.name).catch(() => {})
    setActiveAvatar(a.id)
    loadBrain(a.id, a.name)
  }

  async function handleSearch(slot: string) {
    if (!selected || !searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchWardrobeCandidates(selected.id, slot, searchQuery)
      setCandidates(results)
    } catch { toast.error('Search failed') }
    finally { setSearching(false) }
  }

  async function handleApprove(candidateId: string) {
    if (!selected) return
    try {
      await approveWardrobeCandidate(selected.id, candidateId)
      sceneStore.addWardrobe(candidateId)
      recordFashionChoice(selected.id, candidateId, true)
      toast.success('Item approved and added')
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      const inv = await getWardrobeInventory(selected.id)
      setInventory(inv)
    } catch { toast.error('Approve failed') }
  }

  async function handleSpeak() {
    let text = speakText.trim()
    if (!text && mic.transcript.trim()) {
      text = mic.transcript.trim()
      mic.clearTranscript()
    }
    if (!text) return
    if (mic.isListening) mic.stopListening()
    setBusy(true)
    try {
      await metahumanSpeak('', text, undefined, emotion || undefined)
      toast.success('Avatar speaking')
      setSpeakText('')
    } catch { toast.error('Speak failed') }
    finally { setBusy(false) }
  }

  async function handleSetEmotion(e: string) {
    setEmotion(e)
    setBusy(true)
    try {
      await metahumanEmotion(e)
      toast.success(`Emotion: ${e}`)
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  async function handleGesture(g: string) {
    setGesture(g)
    setBusy(true)
    try {
      await metahumanGesture(g)
      toast.success(`Gesture: ${g}`)
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="flex h-full min-h-0">
      {/* LEFT — Avatar picker + wardrobe */}
      <div className="w-[280px] shrink-0 border-r border-surface-border overflow-y-auto flex flex-col">
        {/* Actions bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-border shrink-0">
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="px-2 py-1 text-[10px] bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 flex items-center gap-1"
          >
            <UserPlus className="h-3 w-3" /> Add
          </button>
          <button
            onClick={() => seedMetahumans().then(() => { toast.success('Seeded'); loadAvatars() }).catch(() => toast.error('Failed'))}
            className="px-2 py-1 text-[10px] bg-gold/10 text-gold rounded hover:bg-gold/20"
          >
            Seed
          </button>
          <button
            onClick={() => syncMetahumans().then(() => { toast.success('Synced'); loadAvatars() }).catch(() => toast.error('Failed'))}
            className="px-2 py-1 text-[10px] border border-surface-border text-white/40 rounded hover:bg-white/5"
          >
            Sync UE
          </button>
        </div>

        {showRegister && (
          <div className="px-3 py-2 border-b border-purple-500/20 bg-purple-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Register MetaHuman</span>
              <button onClick={() => setShowRegister(false)} className="text-white/30 hover:text-white/60"><X className="h-3 w-3" /></button>
            </div>
            <input type="text" placeholder="Name (e.g. Henri)" value={regName} onChange={(e) => setRegName(e.target.value)}
              className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            <div className="flex gap-2">
              <select value={regGender} onChange={(e) => setRegGender(e.target.value)}
                className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <input type="text" placeholder="Archetype" value={regArchetype} onChange={(e) => setRegArchetype(e.target.value)}
                className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <button
              disabled={registering || !regName.trim()}
              onClick={async () => {
                setRegistering(true)
                try {
                  await createMetahuman({
                    name: regName.trim(),
                    skeleton_type: 'metahuman',
                    gender: regGender,
                    brand_archetype: regArchetype || 'supporting',
                  })
                  toast.success(`${regName} registered`)
                  setRegName(''); setRegArchetype(''); setShowRegister(false)
                  loadAvatars()
                } catch { toast.error('Registration failed') }
                finally { setRegistering(false) }
              }}
              className="w-full py-1.5 bg-purple-600 text-white text-[10px] font-semibold rounded hover:bg-purple-500 disabled:opacity-40 transition-colors"
            >
              {registering ? 'Registering...' : 'Register MetaHuman'}
            </button>
          </div>
        )}

        {/* Avatar grid */}
        <div className="p-2">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-1 mb-2">MetaHumans</p>
          {loading ? (
            <div className="flex items-center justify-center h-20 text-xs text-white/20">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : avatars.length === 0 ? (
            <div className="text-xs text-white/20 text-center py-4">No avatars. Seed defaults to start.</div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {avatars.map((a) => (
                <button
                  key={a.id}
                  onClick={() => selectAvatar(a)}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                    selected?.id === a.id ? 'border-purple-500 bg-purple-500/5' : 'border-surface-border hover:border-white/20 bg-surface'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-surface-panel flex items-center justify-center mb-1 overflow-hidden">
                    {getAvatarThumbnail(a) ? (
                      <img src={getAvatarThumbnail(a)!} alt={a.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/60 truncate w-full text-center">{a.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wardrobe sections */}
        {selected && (
          <div className="px-2 pb-2 space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-1 mt-2 mb-1">Wardrobe</p>
            {STYLE_SECTIONS.map((sec) => {
              const open = expandedSection === sec.id
              const Icon = sec.icon
              const items = inventory.filter((i) => i.type === sec.slot)
              return (
                <div key={sec.id} className="border border-surface-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(open ? null : sec.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/[0.02] transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-[11px] font-medium text-white/70 flex-1 text-left">{sec.label}</span>
                    <span className="text-[9px] text-white/25">{items.length}</span>
                    {open ? <ChevronDown className="h-3 w-3 text-white/25" /> : <ChevronRight className="h-3 w-3 text-white/25" />}
                  </button>
                  {open && (
                    <div className="px-3 pb-3 border-t border-surface-border pt-2">
                      {items.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1 mb-2">
                          {items.map((it, idx) => (
                            <div key={idx} className="p-1.5 bg-surface rounded border border-surface-border">
                              <div className="h-10 bg-surface-panel rounded flex items-center justify-center overflow-hidden">
                                {getWardrobeThumbnail(it) ? (
                                  <img src={getWardrobeThumbnail(it)!} alt={it.name || ''} className="h-full w-full object-cover rounded" />
                                ) : (
                                  <Icon className="h-4 w-4 text-white/10" />
                                )}
                              </div>
                              <p className="text-[8px] text-white/30 truncate mt-1">{it.name || `Item ${idx + 1}`}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-white/20 mb-2">No items</p>
                      )}
                      <div className="flex items-center gap-1">
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`Find ${sec.label.toLowerCase()}...`}
                          className="flex-1 h-6 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(sec.slot)}
                        />
                        <button
                          onClick={() => handleSearch(sec.slot)}
                          disabled={searching}
                          className="h-6 px-2 bg-purple-500/10 text-purple-400 text-[9px] rounded hover:bg-purple-500/20 disabled:opacity-40"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>
                      </div>
                      {candidates.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {candidates.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 p-1.5 bg-surface rounded border border-surface-border">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-white/60 truncate">{c.name}</p>
                                <p className="text-[8px] text-white/25">{c.source} · {((c.score || 0) * 100).toFixed(0)}%</p>
                              </div>
                              <button onClick={() => handleApprove(c.id)} className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded hover:bg-green-500/30">
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CENTER — Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <LiveViewport />
      </div>

      {/* RIGHT — Voice, Brain, Jewelry controls */}
      <div className="w-[320px] shrink-0 border-l border-surface-border overflow-y-auto flex flex-col">
        {/* Tab switcher */}
        <div className="flex items-center border-b border-surface-border shrink-0">
          {([
            { id: 'voice' as const, label: 'Voice', icon: Mic },
            { id: 'brain' as const, label: 'Brain', icon: Brain },
            { id: 'jewelry' as const, label: 'Jewelry', icon: Gem },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setRightTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
                rightTab === t.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {!selected ? (
            <div className="text-xs text-white/20 text-center py-8">Select an avatar</div>
          ) : rightTab === 'voice' ? (
            <>
              {/* Emotion */}
              <section>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Emotion</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {EMOTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleSetEmotion(e)}
                      className={`px-2 py-1.5 rounded border text-[10px] capitalize transition-colors ${
                        emotion === e ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-surface-border text-white/40 hover:border-white/20'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </section>

              {/* Gesture */}
              <section>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Gesture</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {GESTURES.map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGesture(g)}
                      className={`px-2 py-1.5 rounded border text-[10px] capitalize transition-colors ${
                        gesture === g ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-surface-border text-white/40 hover:border-white/20'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              {/* Speak */}
              <section>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Speak</p>
                <div className="flex items-center gap-2">
                  {mic.isSupported && (
                    <button
                      onClick={() => {
                        if (mic.isListening) {
                          mic.stopListening()
                          if (mic.transcript.trim()) setSpeakText(mic.transcript.trim())
                        } else {
                          mic.clearTranscript()
                          mic.startListening()
                        }
                      }}
                      className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                        mic.isListening
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-surface border border-surface-border text-white/40 hover:text-white hover:border-white/20'
                      }`}
                      title={mic.isListening ? 'Stop recording' : 'Voice input'}
                    >
                      {mic.isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <input
                    value={mic.isListening ? mic.transcript : speakText}
                    onChange={(e) => setSpeakText(e.target.value)}
                    placeholder={mic.isListening ? 'Listening...' : 'Type dialogue...'}
                    className="flex-1 h-8 px-3 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
                    readOnly={mic.isListening}
                  />
                  <button
                    onClick={handleSpeak}
                    disabled={busy || (!speakText.trim() && !mic.transcript.trim())}
                    className="h-8 w-8 flex items-center justify-center bg-purple-600 text-white rounded hover:bg-purple-500 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </section>

              {/* Avatar info */}
              <section className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{selected.name}</span>
                </div>
                <div className="space-y-1 text-[10px] text-white/30">
                  <p>Gender: {selected.gender || '—'}</p>
                  <p>Archetype: {selected.brand_archetype || '—'}</p>
                  <p>Skeleton: {selected.skeleton_type}</p>
                  {selected.lighting_profile?.skin_tone && <p>Skin tone: {selected.lighting_profile.skin_tone}</p>}
                </div>
              </section>
            </>
          ) : rightTab === 'brain' ? (
            <AvatarBrainPanel metahumanId={selected.id} metahumanName={selected.name} />
          ) : (
            <CustomPieceDesigner avatarId={selected.id} avatarName={selected.name} />
          )}
        </div>
      </div>
    </div>
  )
}
