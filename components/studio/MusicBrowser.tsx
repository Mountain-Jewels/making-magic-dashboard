/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Music, Mic, Play, Pause, Sparkles } from 'lucide-react'
import { chatWithDirector } from '@/lib/api/director'

export function MusicBrowser() {
  const [musicPrompt, setMusicPrompt] = useState('')
  const [voiceText, setVoiceText] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('alloy')
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  async function handleGenerateMusic() {
    if (!musicPrompt.trim()) return
    setGenerating(true)
    try {
      const res = await chatWithDirector(`[music] ${musicPrompt}`)
      toast.success(res.response || 'Music generation requested')
    } catch { toast.error('Music generation failed') }
    finally { setGenerating(false) }
  }

  async function handleGenerateVoice() {
    if (!voiceText.trim()) return
    setGenerating(true)
    try {
      const res = await chatWithDirector(`[dialogue] Voice: ${voiceStyle}. Text: ${voiceText}`)
      toast.success(res.response || 'Voice generation requested')
    } catch { toast.error('Voice generation failed') }
    finally { setGenerating(false) }
  }

  function togglePlay() {
    if (!audioRef.current || !audioUrl) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const inputCls = 'w-full h-8 px-3 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Music & Audio</h2>
        <p className="text-[11px] text-white/30">Generate music with Suno, voice with ElevenLabs</p>
      </div>

      {/* Music Generation */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-gold" />
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Music Generation</h3>
        </div>
        <textarea
          value={musicPrompt}
          onChange={(e) => setMusicPrompt(e.target.value)}
          placeholder="Describe the mood, genre, tempo... e.g., 'warm cinematic underscore, gentle piano, 15 seconds'"
          rows={3}
          className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold resize-none"
        />
        <button
          onClick={handleGenerateMusic}
          disabled={generating || !musicPrompt.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate Music
        </button>
      </section>

      {/* Voice / Dialogue */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-gold" />
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Voice / Dialogue</h3>
        </div>
        <textarea
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          placeholder="Enter dialogue text for the avatar to speak..."
          rows={3}
          className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold resize-none"
        />
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1 block">Voice</label>
          <select value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className={inputCls}>
            {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateVoice}
          disabled={generating || !voiceText.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
        >
          <Mic className="h-3.5 w-3.5" />
          Generate Voice
        </button>
      </section>

      {/* Audio Player */}
      {audioUrl && (
        <section className="p-3 bg-surface-panel rounded-lg border border-surface-border">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold/20">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <div className="flex-1 h-1 bg-surface rounded-full">
              <div className="h-full w-1/3 bg-gold rounded-full" />
            </div>
          </div>
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
        </section>
      )}
    </div>
  )
}
