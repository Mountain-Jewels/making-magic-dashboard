'use client'

import { useState } from 'react'

type PublishTarget = 'shopify' | 'email' | 'social' | null
type PublishSchedule = 'immediate' | 'scheduled' | 'event-driven'

export function PublishControls() {
  const [target, setTarget] = useState<PublishTarget>(null)
  const [schedule, setSchedule] = useState<PublishSchedule>('immediate')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Publish Destination</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTarget('shopify')}
            className={`p-4 rounded-lg border-2 transition-all ${
              target === 'shopify'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">🛍️</div>
            <p className="text-sm font-medium">Shopify PDP</p>
          </button>

          <button
            onClick={() => setTarget('email')}
            className={`p-4 rounded-lg border-2 transition-all ${
              target === 'email'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">📧</div>
            <p className="text-sm font-medium">Email</p>
          </button>

          <button
            onClick={() => setTarget('social')}
            className={`p-4 rounded-lg border-2 transition-all ${
              target === 'social'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm font-medium">Social</p>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule</h3>
        <div className="space-y-2">
          {(['immediate', 'scheduled', 'event-driven'] as const).map((sched) => (
            <button
              key={sched}
              onClick={() => setSchedule(sched)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                schedule === sched
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <p className="font-medium capitalize">{sched.replace('-', ' ')}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!target}
        className="w-full py-4 bg-primary text-accent font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Publish Now
      </button>
    </div>
  )
}

