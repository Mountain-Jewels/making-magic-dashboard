'use client'

import { useState } from 'react'

interface Event {
  id: string
  type: 'birthday' | 'anniversary' | 'engagement' | 'holiday' | 'thank_you'
  product_id: string
  status: 'pending' | 'approved' | 'rendering' | 'published'
  created_at: string
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    type: 'engagement',
    product_id: 'diamond-solitaire-ring-001',
    status: 'approved',
    created_at: '2026-02-06T10:30:00Z'
  },
  {
    id: '2',
    type: 'birthday',
    product_id: 'pearl-necklace-002',
    status: 'pending',
    created_at: '2026-02-06T09:15:00Z'
  },
]

export function EventTimeline() {
  const [events] = useState<Event[]>(MOCK_EVENTS)

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'approved': return 'bg-blue-500'
      case 'rendering': return 'bg-purple-500'
      case 'published': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'birthday': return '🎂'
      case 'anniversary': return '💝'
      case 'engagement': return '💍'
      case 'holiday': return '🎄'
      case 'thank_you': return '🙏'
      default: return '📅'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Event Timeline</h3>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-secondary transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{getEventIcon(event.type)}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 capitalize">{event.type}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Product: {event.product_id}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                {event.status === 'pending' && (
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-all">
                    Approve
                  </button>
                )}
                {event.status === 'approved' && (
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-all">
                    Render
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

