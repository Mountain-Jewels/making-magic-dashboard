'use client'

import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { useSingingStore } from '@/lib/stores/singing-store'

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: 'text-gray-400', icon: '📝' },
  ready: { label: 'Ready', color: 'text-blue-400', icon: '✅' },
  rendering: { label: 'Rendering', color: 'text-yellow-400', icon: '⏳' },
  complete: { label: 'Complete', color: 'text-green-400', icon: '🎬' },
  pending: { label: 'Pending', color: 'text-gray-400', icon: '⏸️' },
  generating_audio: { label: 'Audio Gen', color: 'text-purple-400', icon: '🎵' },
  generating_video: { label: 'Video Gen', color: 'text-blue-400', icon: '🎥' },
  failed: { label: 'Failed', color: 'text-red-400', icon: '❌' },
  approved: { label: 'Approved', color: 'text-green-400', icon: '✅' },
  generated: { label: 'Generated', color: 'text-purple-400', icon: '🤖' },
}

export default function ContentQueuePage() {
  const scenes = useSceneStore((s) => s.scenes)
  const directions = useAvatarStore((s) => s.directions)
  const tracks = useSingingStore((s) => s.tracks)

  const allItems = [
    ...scenes.map((s) => ({
      id: s.id,
      type: 'Scene' as const,
      name: s.name,
      status: s.status,
      created_at: s.created_at,
    })),
    ...directions.map((d) => ({
      id: d.id,
      type: 'Avatar Direction' as const,
      name: `${d.moment_type} — ${d.avatar_id.replace('avatar-', '')}`,
      status: d.script_status,
      created_at: d.created_at,
    })),
    ...tracks.map((t) => ({
      id: t.id,
      type: 'Singing Track' as const,
      name: t.title,
      status: t.render_status,
      created_at: t.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const activeCount = allItems.filter((i) => !['complete', 'approved'].includes(i.status)).length
  const completeCount = allItems.filter((i) => ['complete', 'approved'].includes(i.status)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Content Queue</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-yellow-400">{activeCount} active</span>
          <span className="text-green-400">{completeCount} complete</span>
          <span className="text-gray-500">{allItems.length} total</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Scenes</h3>
          <p className="text-2xl font-bold text-white">{scenes.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {scenes.filter((s) => s.status === 'rendering').length} rendering
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Avatar Directions</h3>
          <p className="text-2xl font-bold text-white">{directions.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {directions.filter((d) => d.script_status === 'approved').length} approved
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Singing Tracks</h3>
          <p className="text-2xl font-bold text-white">{tracks.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {tracks.filter((t) => t.render_status === 'complete').length} complete
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item) => {
              const display = STATUS_DISPLAY[item.status] || STATUS_DISPLAY.draft
              return (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-xs text-gray-400">{item.type}</td>
                  <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${display.color}`}>
                      {display.icon} {display.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
