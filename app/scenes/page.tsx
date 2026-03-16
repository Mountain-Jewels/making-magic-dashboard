/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  loadScene,
  loadAvatar,
  addWardrobe,
  addJewelry,
  metahumanSpeak,
  metahumanEmotion,
  metahumanGesture,
  sendCommand,
  sendConsoleCommand,
  setFog,
  listMetahumans,
  getMetahumanPersona,
  seedMetahumans,
} from '@/lib/api/scene-control'
import type { MetaHuman, PersonaProfile } from '@/lib/api/scene-control'

const SCENE_OPTIONS = ['Landing Mountain', "Merlin's Cave"]
const EMOTION_OPTIONS = ['Celebratory', 'Intimate', 'Grateful']

export default function ScenesPage() {
  const [sceneName, setSceneName] = useState(SCENE_OPTIONS[0])
  const [avatarId, setAvatarId] = useState('')
  const [command, setCommand] = useState('')
  const [commandArgs, setCommandArgs] = useState('{}')

  const [speakText, setSpeakText] = useState('')
  const [speakEmotion, setSpeakEmotion] = useState('')
  const [emotionValue, setEmotionValue] = useState('')
  const [gestureValue, setGestureValue] = useState('')

  const [wardrobeAvatarId, setWardrobeAvatarId] = useState('')
  const [wardrobeItemType, setWardrobeItemType] = useState('')
  const [wardrobeItemId, setWardrobeItemId] = useState('')

  const [jewelryAvatarId, setJewelryAvatarId] = useState('')
  const [jewelryType, setJewelryType] = useState('')
  const [jewelryId, setJewelryId] = useState('')
  const [jewelrySlot, setJewelrySlot] = useState('')

  const [metahumans, setMetahumans] = useState<MetaHuman[]>([])
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)
  const [personaProfile, setPersonaProfile] = useState<PersonaProfile | null>(
    null
  )
  const [consoleCmd, setConsoleCmd] = useState('')
  const [consoleLogs, setConsoleLogs] = useState<{ cmd: string; ts: string; ok: boolean }[]>([])

  const [fogEnabled, setFogEnabled] = useState(false)
  const [fogDensity, setFogDensity] = useState(0.02)
  const [fogColor, setFogColor] = useState('#8899aa')
  const [fogStartDistance, setFogStartDistance] = useState(0)
  const [fogHeightFalloff, setFogHeightFalloff] = useState(0.2)

  const [loadingMetahumans, setLoadingMetahumans] = useState(false)
  const [loadingPersona, setLoadingPersona] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const refreshMetahumans = useCallback(async () => {
    setLoadingMetahumans(true)
    try {
      const data = await listMetahumans()
      setMetahumans(data)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load MetaHumans'
      toast.error(msg)
    } finally {
      setLoadingMetahumans(false)
    }
  }, [])

  useEffect(() => {
    void refreshMetahumans()
  }, [refreshMetahumans])

  useEffect(() => {
    if (!selectedPersonaId) {
      setPersonaProfile(null)
      return
    }
    setLoadingPersona(true)
    getMetahumanPersona(selectedPersonaId)
      .then(setPersonaProfile)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to load persona')
      })
      .finally(() => setLoadingPersona(false))
  }, [selectedPersonaId])

  const runAction = useCallback(
    async (
      key: string,
      fn: () => Promise<{ status: string } | { status: string; result?: unknown }>
    ) => {
      setBusy(key)
      try {
        const res = await fn()
        toast.success(res.status || 'Done')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Request failed')
      } finally {
        setBusy(null)
      }
    },
    []
  )

  const handleLoadScene = () =>
    runAction('scene', () => loadScene(sceneName))

  const handleLoadAvatar = () =>
    runAction('avatar', () => loadAvatar(avatarId))

  const handleSendCommand = () => {
    let args: Record<string, unknown> | undefined
    try {
      args = commandArgs.trim() ? JSON.parse(commandArgs) : undefined
    } catch {
      toast.error('Invalid JSON in args')
      return
    }
    runAction('command', () => sendCommand(command, args))
  }

  const handleConsoleCommand = () => {
    if (!consoleCmd.trim()) return
    const cmd = consoleCmd.trim()
    runAction('console', async () => {
      const res = await sendConsoleCommand(cmd)
      setConsoleLogs((prev) => [
        { cmd, ts: new Date().toLocaleTimeString(), ok: true },
        ...prev.slice(0, 49),
      ])
      setConsoleCmd('')
      return res
    })
  }

  const handleConsoleCmdKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleConsoleCommand()
    }
  }

  const handleSetFog = () =>
    runAction('fog', () =>
      setFog({
        enabled: fogEnabled,
        density: fogDensity,
        color: fogColor,
        start_distance: fogStartDistance,
        height_falloff: fogHeightFalloff,
      })
    )

  const handleSpeak = () =>
    runAction('speak', () =>
      metahumanSpeak('', speakText, undefined, speakEmotion || undefined)
    )

  const handleSetEmotion = () =>
    runAction('emotion', () => metahumanEmotion(emotionValue))

  const handleTriggerGesture = () =>
    runAction('gesture', () => metahumanGesture(gestureValue))

  const handleAddWardrobe = () =>
    runAction('wardrobe', () => addWardrobe(wardrobeItemId))

  const handleAddJewelry = () =>
    runAction('jewelry', () => addJewelry(jewelryId))

  const handleSeedDefaults = () =>
    runAction('seed', async () => {
      const res = await seedMetahumans()
      return { status: `Inserted ${res.inserted}, skipped ${res.skipped}` }
    }).then(() => refreshMetahumans())

  const getStatus = (mh: MetaHuman) => {
    const extra = mh.extra_data as Record<string, unknown> | undefined
    if (!extra) return '—'
    const role = extra.role as string | undefined
    const active = extra.active
    if (role) return role
    if (typeof active === 'boolean') return active ? 'active' : 'inactive'
    return '—'
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* HEADER */}
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Scene & Avatar Control
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Load environments, control avatars, manage MetaHumans
          </p>
        </header>

        {/* SCENE CONTROL */}
        <section>
          <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
            Scene Control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Load Scene
              </h3>
              <div className="flex gap-2">
                <select
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className="flex-1 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {SCENE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLoadScene}
                  disabled={busy === 'scene'}
                  className="rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'scene' ? 'Loading…' : 'Load'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Load Avatar
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className="flex-1 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  onClick={handleLoadAvatar}
                  disabled={busy === 'avatar'}
                  className="rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'avatar' ? 'Loading…' : 'Load'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Generic Command
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Command"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <textarea
                  value={commandArgs}
                  onChange={(e) => setCommandArgs(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={2}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none resize-none"
                />
                <button
                  onClick={handleSendCommand}
                  disabled={busy === 'command'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'command' ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* UE CONSOLE COMMAND BOX */}
        <section>
          <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
            UE Console
          </h2>
          <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={consoleCmd}
                onChange={(e) => setConsoleCmd(e.target.value)}
                onKeyDown={handleConsoleCmdKey}
                placeholder="stat fps · r.ScreenPercentage 200 · DisableAllScreenMessages …"
                className="flex-1 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm font-mono text-white placeholder-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
              <button
                onClick={handleConsoleCommand}
                disabled={busy === 'console' || !consoleCmd.trim()}
                className="rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
              >
                {busy === 'console' ? 'Sending…' : 'Run'}
              </button>
            </div>
            {consoleLogs.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded border border-[#2A2A35] bg-[#0A0A0F] p-2">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 text-xs font-mono py-0.5">
                    <span className="text-white/40 shrink-0">{log.ts}</span>
                    <span className={log.ok ? 'text-green-400' : 'text-red-400'}>→</span>
                    <span className="text-white/80 break-all">{log.cmd}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FOG CONTROL */}
        <section>
          <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
            Fog Control
          </h2>
          <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs text-white/60 mb-1">Enabled</label>
                <button
                  onClick={() => setFogEnabled(!fogEnabled)}
                  className={`w-full rounded px-3 py-2 text-sm font-medium ${
                    fogEnabled
                      ? 'bg-[#D4AF37] text-[#0A0A0F]'
                      : 'bg-[#0A0A0F] text-white/60 border border-[#2A2A35]'
                  }`}
                >
                  {fogEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Density</label>
                <input
                  type="number"
                  step="0.005"
                  min="0"
                  max="1"
                  value={fogDensity}
                  onChange={(e) => setFogDensity(Number(e.target.value))}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Color</label>
                <input
                  type="color"
                  value={fogColor}
                  onChange={(e) => setFogColor(e.target.value)}
                  className="w-full h-[38px] rounded border border-[#2A2A35] bg-[#0A0A0F] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Start Dist</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={fogStartDistance}
                  onChange={(e) => setFogStartDistance(Number(e.target.value))}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Height Falloff</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  value={fogHeightFalloff}
                  onChange={(e) => setFogHeightFalloff(Number(e.target.value))}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleSetFog}
              disabled={busy === 'fog'}
              className="mt-4 rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
            >
              {busy === 'fog' ? 'Applying…' : 'Apply Fog'}
            </button>
          </div>
        </section>

        {/* AVATAR ACTIONS */}
        <section>
          <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
            Avatar Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Speak</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={speakText}
                  onChange={(e) => setSpeakText(e.target.value)}
                  placeholder="Text to speak"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <select
                  value={speakEmotion}
                  onChange={(e) => setSpeakEmotion(e.target.value)}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">No emotion</option>
                  {EMOTION_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSpeak}
                  disabled={busy === 'speak'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'speak' ? 'Speaking…' : 'Speak'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Emotion</h3>
              <div className="space-y-2">
                <select
                  value={emotionValue}
                  onChange={(e) => setEmotionValue(e.target.value)}
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">Select emotion</option>
                  {EMOTION_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSetEmotion}
                  disabled={busy === 'emotion'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'emotion' ? 'Setting…' : 'Set'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Gesture</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={gestureValue}
                  onChange={(e) => setGestureValue(e.target.value)}
                  placeholder="Gesture name"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  onClick={handleTriggerGesture}
                  disabled={busy === 'gesture'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'gesture' ? 'Triggering…' : 'Trigger'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Wardrobe</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={wardrobeAvatarId}
                  onChange={(e) => setWardrobeAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  value={wardrobeItemType}
                  onChange={(e) => setWardrobeItemType(e.target.value)}
                  placeholder="Item type"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  value={wardrobeItemId}
                  onChange={(e) => setWardrobeItemId(e.target.value)}
                  placeholder="Item ID"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  onClick={handleAddWardrobe}
                  disabled={busy === 'wardrobe'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'wardrobe' ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Jewelry</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={jewelryAvatarId}
                  onChange={(e) => setJewelryAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  value={jewelryType}
                  onChange={(e) => setJewelryType(e.target.value)}
                  placeholder="Jewelry type"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  value={jewelryId}
                  onChange={(e) => setJewelryId(e.target.value)}
                  placeholder="Jewelry ID"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  value={jewelrySlot}
                  onChange={(e) => setJewelrySlot(e.target.value)}
                  placeholder="Slot (optional)"
                  className="w-full rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  onClick={handleAddJewelry}
                  disabled={busy === 'jewelry'}
                  className="w-full rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
                >
                  {busy === 'jewelry' ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* METAHUMAN REGISTRY */}
        <section>
          <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
            MetaHuman Registry
          </h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleSeedDefaults}
              disabled={busy === 'seed'}
              className="rounded px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] font-medium text-sm hover:bg-[#E5C04A] disabled:opacity-50"
            >
              {busy === 'seed' ? 'Seeding…' : 'Seed Defaults'}
            </button>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="rounded-lg border border-[#2A2A35] bg-[#111118] overflow-hidden">
                {loadingMetahumans ? (
                  <div className="p-6 text-center text-white/60">
                    Loading MetaHumans…
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2A35]">
                        <th className="text-left py-3 px-4 text-white/80 font-medium">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-white/80 font-medium">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-white/80 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metahumans.map((mh) => (
                        <tr
                          key={mh.id}
                          onClick={() =>
                            setSelectedPersonaId(
                              selectedPersonaId === mh.id ? null : mh.id
                            )
                          }
                          className={`border-b border-[#2A2A35] cursor-pointer transition-colors ${
                            selectedPersonaId === mh.id
                              ? 'bg-[#D4AF37]/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="py-3 px-4 text-white/90 font-mono text-xs">
                            {mh.id}
                          </td>
                          <td className="py-3 px-4 text-white/90">
                            {mh.name}
                          </td>
                          <td className="py-3 px-4 text-white/70">
                            {getStatus(mh)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {selectedPersonaId && (
              <div className="w-80 shrink-0 rounded-lg border border-[#2A2A35] bg-[#111118] p-4 overflow-auto max-h-80">
                <h3 className="text-sm font-medium text-[#D4AF37] mb-2">
                  Persona Profile
                </h3>
                {loadingPersona ? (
                  <div className="text-white/60 text-sm">Loading…</div>
                ) : personaProfile ? (
                  <pre className="text-xs text-white/80 whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(personaProfile, null, 2)}
                  </pre>
                ) : (
                  <div className="text-white/60 text-sm">No persona data</div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
