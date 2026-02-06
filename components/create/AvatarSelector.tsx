'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const AVATARS = [
  { id: 'avatar-1', name: 'Sophia', thumbnail: '/assets/avatars/sophia.png' },
  { id: 'avatar-2', name: 'Isabella', thumbnail: '/assets/avatars/isabella.png' },
  { id: 'avatar-3', name: 'Olivia', thumbnail: '/assets/avatars/olivia.png' },
]

export function AvatarSelector() {
  const { selectedAvatar, selectAvatar } = useDashboardStore()

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wide">
        Avatars
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => selectAvatar(avatar.id)}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${
                selectedAvatar === avatar.id
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
            `}
          >
            <div className="aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-xs text-center text-gray-300">{avatar.name}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

