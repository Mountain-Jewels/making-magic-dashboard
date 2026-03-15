/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import {
  loadScene,
  loadAvatar,
  sendCommand,
  metahumanSpeak,
  metahumanEmotion,
  metahumanGesture,
  addWardrobe,
  addJewelry,
} from '@/lib/api/scene-control'
import { toast } from 'sonner'
import { Card } from '@/components/shared/Card'
import { useState, useCallback } from 'react'

const SCENE_OPTIONS = ['Landing Mountain', "Merlin's Cave"]
const EMOTION_OPTIONS = ['Celebratory', 'Intimate', 'Grateful']

export default function ScenesPage() {
  const [sceneName, setSceneName] = useState(SCENE_OPTIONS[0])
  const [avatarId, setAvatarId] = useState('')
  const [command, setCommand] = useState('')
  const [commandArgs, setCommandArgs] = useState('{}')

  const [speakAvatarId, setSpeakAvatarId] = useState('')
  const [speakText, setSpeakText] = useState('')
  const [speakEmotion, setSpeakEmotion] = useState('')

  const [emotionAvatarId, setEmotionAvatarId] = useState('')
  const [emotionValue, setEmotionValue] = useState('')

  const [gestureAvatarId, setGestureAvatarId] = useState('')
  const [gestureValue, setGestureValue] = useState('')

  const [wardrobeAvatarId, setWardrobeAvatarId] = useState('')
  const [wardrobeItemType, setWardrobeItemType] = useState('')
  const [wardrobeItemId, setWardrobeItemId] = useState('')

  const [jewelryAvatarId, setJewelryAvatarId] = useState('')
  const [jewelryType, setJewelryType] = useState('')
  const [jewelryId, setJewelryId] = useState('')
  const [jewelrySlot, setJewelrySlot] = useState('')

  const [busy, setBusy] = useState<string | null>(null)

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

  const handleLoadScene = () => runAction('scene', () => loadScene(sceneName))

  const handleLoadAvatar = () => runAction('avatar', () => loadAvatar(avatarId))

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

  const handleSpeak = () =>
    runAction('speak', () =>
      metahumanSpeak(speakAvatarId, speakText, speakEmotion || undefined)
    )

  const handleSetEmotion = () =>
    runAction('emotion', () =>
      metahumanEmotion(emotionAvatarId, emotionValue)
    )

  const handleTriggerGesture = () =>
    runAction('gesture', () =>
      metahumanGesture(gestureAvatarId, gestureValue)
    )

  const handleAddWardrobe = () =>
    runAction('wardrobe', () =>
      addWardrobe(wardrobeAvatarId, wardrobeItemType, wardrobeItemId)
    )

  const handleAddJewelry = () =>
    runAction('jewelry', () =>
      addJewelry(
        jewelryAvatarId,
        jewelryType,
        jewelryId,
        jewelrySlot || undefined
      )
    )

  const inputClass =
    'w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
  const buttonClass =
    'px-4 py-2 bg-gold text-black font-medium text-sm rounded-md hover:bg-gold-hover disabled:opacity-50'

  return (
    <div className="min-h-screen bg-surface text-white p-6">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Scenes & Environments
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Load scenes, control avatars, manage recipes
          </p>
        </header>

        <section>
          <h2 className="text-lg font-medium text-gold mb-4">Scene Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Load Scene">
              <div className="flex gap-2">
                <select
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className={`flex-1 ${inputClass}`}
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
                  className={buttonClass}
                >
                  {busy === 'scene' ? 'Loading…' : 'Load'}
                </button>
              </div>
            </Card>

            <Card title="Load Avatar">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  onClick={handleLoadAvatar}
                  disabled={busy === 'avatar'}
                  className={buttonClass}
                >
                  {busy === 'avatar' ? 'Loading…' : 'Load'}
                </button>
              </div>
            </Card>

            <Card title="Generic Command">
              <div className="space-y-2">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Command"
                  className={inputClass}
                />
                <textarea
                  value={commandArgs}
                  onChange={(e) => setCommandArgs(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
                <button
                  onClick={handleSendCommand}
                  disabled={busy === 'command'}
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'command' ? 'Sending…' : 'Send'}
                </button>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-gold mb-4">Avatar Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card title="Speak">
              <div className="space-y-2">
                <input
                  type="text"
                  value={speakAvatarId}
                  onChange={(e) => setSpeakAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={speakText}
                  onChange={(e) => setSpeakText(e.target.value)}
                  placeholder="Text to speak"
                  className={inputClass}
                />
                <select
                  value={speakEmotion}
                  onChange={(e) => setSpeakEmotion(e.target.value)}
                  className={inputClass}
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
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'speak' ? 'Speaking…' : 'Speak'}
                </button>
              </div>
            </Card>

            <Card title="Emotion">
              <div className="space-y-2">
                <input
                  type="text"
                  value={emotionAvatarId}
                  onChange={(e) => setEmotionAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={inputClass}
                />
                <select
                  value={emotionValue}
                  onChange={(e) => setEmotionValue(e.target.value)}
                  className={inputClass}
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
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'emotion' ? 'Setting…' : 'Set'}
                </button>
              </div>
            </Card>

            <Card title="Gesture">
              <div className="space-y-2">
                <input
                  type="text"
                  value={gestureAvatarId}
                  onChange={(e) => setGestureAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={gestureValue}
                  onChange={(e) => setGestureValue(e.target.value)}
                  placeholder="Gesture name"
                  className={inputClass}
                />
                <button
                  onClick={handleTriggerGesture}
                  disabled={busy === 'gesture'}
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'gesture' ? 'Triggering…' : 'Trigger'}
                </button>
              </div>
            </Card>

            <Card title="Wardrobe">
              <div className="space-y-2">
                <input
                  type="text"
                  value={wardrobeAvatarId}
                  onChange={(e) => setWardrobeAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={wardrobeItemType}
                  onChange={(e) => setWardrobeItemType(e.target.value)}
                  placeholder="Item type"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={wardrobeItemId}
                  onChange={(e) => setWardrobeItemId(e.target.value)}
                  placeholder="Item ID"
                  className={inputClass}
                />
                <button
                  onClick={handleAddWardrobe}
                  disabled={busy === 'wardrobe'}
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'wardrobe' ? 'Adding…' : 'Add'}
                </button>
              </div>
            </Card>

            <Card title="Jewelry">
              <div className="space-y-2">
                <input
                  type="text"
                  value={jewelryAvatarId}
                  onChange={(e) => setJewelryAvatarId(e.target.value)}
                  placeholder="Avatar ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={jewelryType}
                  onChange={(e) => setJewelryType(e.target.value)}
                  placeholder="Jewelry type"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={jewelryId}
                  onChange={(e) => setJewelryId(e.target.value)}
                  placeholder="Jewelry ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={jewelrySlot}
                  onChange={(e) => setJewelrySlot(e.target.value)}
                  placeholder="Slot (optional)"
                  className={inputClass}
                />
                <button
                  onClick={handleAddJewelry}
                  disabled={busy === 'jewelry'}
                  className={`w-full ${buttonClass}`}
                >
                  {busy === 'jewelry' ? 'Adding…' : 'Add'}
                </button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
