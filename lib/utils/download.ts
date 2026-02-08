/**
 * Download utilities for playlist export.
 * In Phase 7, these will point to real Mux/ElevenLabs/Azure Blob URLs.
 * For now, they generate mock downloads to prove the UI flow.
 */

export function downloadTextFile(filename: string, content: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadJSON(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), 'application/json')
}

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  downloadTextFile(filename, csvContent, 'text/csv')
}

export function triggerMockMediaDownload(filename: string, type: 'audio' | 'video') {
  // In Phase 7, this will fetch from Mux (video) or ElevenLabs/Azure Blob (audio)
  // For now, create a small placeholder file so the browser download flow works
  const placeholder = type === 'audio'
    ? `[Mountain Jewels Audio Placeholder]\nFile: ${filename}\nThis will be replaced with real MP3 from ElevenLabs in Phase 7.`
    : `[Mountain Jewels Video Placeholder]\nFile: ${filename}\nThis will be replaced with real MP4 from Mux in Phase 7.`
  downloadTextFile(filename, placeholder, type === 'audio' ? 'audio/mpeg' : 'video/mp4')
}

export async function downloadPlaylistBundle(
  playlistName: string,
  tracks: { title: string; id: string; hasAudio: boolean; hasVideo: boolean }[],
  metadata: unknown
) {
  // In Phase 7, this will use JSZip or server-side bundling to create a real ZIP
  // For now, download the metadata JSON as a stand-in
  const bundleManifest = {
    playlist: playlistName,
    exported_at: new Date().toISOString(),
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      audio_file: t.hasAudio ? `${t.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3` : null,
      video_file: t.hasVideo ? `${t.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4` : null,
    })),
    metadata,
    note: 'Full ZIP bundle with actual audio/video files will be available after Phase 7 (backend wiring).',
  }
  downloadJSON(`${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}_bundle.json`, bundleManifest)
}
