import { mockMoments } from '@/lib/mock/moments'
import { TemporalPhaseBadge } from '@/components/moment/TemporalPhaseBadge'
import { ActionButtons } from '@/components/moment/ActionButtons'
import Link from 'next/link'

export default function MomentDetailPage({ params }: { params: { id: string } }) {
  const moment = mockMoments.find(m => m.id === params.id)
  
  if (!moment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">MomentIntent not found</p>
        <Link href="/queue" className="text-[#D4AF37] hover:underline mt-4 inline-block">
          Back to Queue
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl">
      <Link href="/queue" className="text-gray-400 hover:text-white mb-4 inline-block">
        ← Back to Queue
      </Link>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#D4AF37] capitalize">{moment.moment_type}</h1>
            <p className="text-gray-400">ID: {moment.id}</p>
          </div>
          <TemporalPhaseBadge phase="READY" />
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Recipient Role</h3>
            <p className="text-white capitalize">{moment.recipient_role}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Emotional Tone</h3>
            <p className="text-white capitalize">{moment.emotional_tone}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Delivery Window</h3>
            <p className="text-white">
              {new Date(moment.temporal_window.earliest).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Policy Version</h3>
            <p className="text-white">{moment.policy_version}</p>
          </div>
        </div>
        
        <ActionButtons momentId={moment.id} currentState={moment.approval_state} />
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Audit Trail</h2>
        <p className="text-gray-500 text-sm">Created: {new Date(moment.created_at).toLocaleString()}</p>
        {moment.approved_at && (
          <p className="text-gray-500 text-sm">Approved: {new Date(moment.approved_at).toLocaleString()} by {moment.approved_by}</p>
        )}
      </div>
    </div>
  )
}
