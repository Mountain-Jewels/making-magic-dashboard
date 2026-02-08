import { create } from 'zustand'
import type { SingingTrack, Playlist, SingingVoice, MusicGenre, PerformanceStyle } from '@/lib/types/singing'

interface SingingStore {
  tracks: SingingTrack[]
  playlists: Playlist[]
  currentTrack: SingingTrack | null
  currentPlaylist: Playlist | null
  setCurrentTrack: (track: SingingTrack | null) => void
  setCurrentPlaylist: (playlist: Playlist | null) => void
  addTrack: (track: SingingTrack) => void
  updateTrack: (id: string, updates: Partial<SingingTrack>) => void
  removeTrack: (id: string) => void
  addPlaylist: (playlist: Playlist) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  addTrackToPlaylist: (playlistId: string, trackId: string) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
}

const MOCK_TRACKS: SingingTrack[] = [
  {
    id: 'track-001',
    title: 'Ten Years of Us',
    moment_type: 'anniversary',
    recipient_name: 'Sarah',
    lyrics: 'Through every season, through every year,\nYour love has been my constant, my dear.\nTen years of laughter, ten years of grace,\nEvery moment written on your face.\n\nThis ring of gold, this band of light,\nA promise kept from day to night.\nTen years of us, and many more to come,\nYou are my heart, you are my home.',
    lyrics_status: 'approved',
    voice: 'soprano_warm',
    genre: 'pop_ballad',
    performance_style: 'intimate_serenade',
    avatar_id: 'avatar-isabella',
    duration_seconds: 90,
    bpm: 72,
    key_signature: 'D Major',
    render_status: 'complete',
    created_at: '2026-02-06T10:00:00Z',
  },
  {
    id: 'track-002',
    title: 'Your Shining Day',
    moment_type: 'graduation',
    recipient_name: 'Alex',
    lyrics: '',
    lyrics_status: 'draft',
    voice: 'tenor_smooth',
    genre: 'acoustic_folk',
    performance_style: 'celebration',
    avatar_id: 'avatar-james',
    duration_seconds: 60,
    bpm: 110,
    key_signature: 'G Major',
    render_status: 'pending',
    created_at: '2026-02-07T14:00:00Z',
  },
  {
    id: 'track-003',
    title: 'A Mother\'s Love',
    moment_type: 'gratitude',
    recipient_name: 'Mom',
    lyrics: 'In gentle hands that held me close,\nIn whispered words when I needed most,\nA love so deep, it knows no end,\nMy mother, my guide, my dearest friend.',
    lyrics_status: 'edited',
    voice: 'alto_rich',
    genre: 'classical_aria',
    performance_style: 'gentle_hymn',
    avatar_id: 'avatar-aria',
    duration_seconds: 75,
    bpm: 66,
    key_signature: 'Bb Major',
    render_status: 'generating_audio',
    created_at: '2026-02-07T16:30:00Z',
  },
]

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-001',
    name: 'February Moments',
    description: 'All singing performances for February 2026',
    track_ids: ['track-001', 'track-003'],
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-07T16:30:00Z',
  },
]

export const useSingingStore = create<SingingStore>((set) => ({
  tracks: MOCK_TRACKS,
  playlists: MOCK_PLAYLISTS,
  currentTrack: null,
  currentPlaylist: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  updateTrack: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTrack: (id) =>
    set((state) => ({ tracks: state.tracks.filter((t) => t.id !== id) })),
  addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
  updatePlaylist: (id, updates) =>
    set((state) => ({
      playlists: state.playlists.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  addTrackToPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId && !p.track_ids.includes(trackId)
          ? { ...p, track_ids: [...p.track_ids, trackId], updated_at: new Date().toISOString() }
          : p
      ),
    })),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, track_ids: p.track_ids.filter((id) => id !== trackId), updated_at: new Date().toISOString() }
          : p
      ),
    })),
}))
