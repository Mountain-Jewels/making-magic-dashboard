'use client'

import { useState } from 'react'
import { approveMoment, rejectMoment } from '@/lib/api/moments'

export function ActionButtons({ momentId, currentState }: { momentId: string; currentState: string }) {
  const [loading, setLoading] = useState(false)
  
  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveMoment(momentId)
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectMoment(momentId, 'Rejected by operator')
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setLoading(false)
    }
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
