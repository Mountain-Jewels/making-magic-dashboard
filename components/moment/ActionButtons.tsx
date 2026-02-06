'use client'

import { useState } from 'react'

export function ActionButtons({ momentId, currentState }: { momentId: string; currentState: string }) {
  const [loading, setLoading] = useState(false)
  
  const handleApprove = async () => {
    setLoading(true)
    // TODO: Call API
    console.log('Approve:', momentId)
    setLoading(false)
  }
  
  const handleReject = async () => {
    setLoading(true)
    // TODO: Call API
    console.log('Reject:', momentId)
    setLoading(false)
  }
  
  if (currentState !== 'pending_approval') {
    return null
  }
  
  return (
    <div className="flex gap-4">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
