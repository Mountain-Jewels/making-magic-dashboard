import Link from 'next/link'
import { MomentIntent } from '@/lib/types/moment'

const stateColors = {
  pending_approval: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  failed: 'bg-red-500/20 text-red-400',
}

export function MomentIntentCard({ moment }: { moment: MomentIntent }) {
  return (
    <Link href={`/moment/${moment.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-[#D4AF37]/50 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-white capitalize">{moment.moment_type}</h3>
            <p className="text-sm text-gray-400">For: {moment.recipient_role}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${stateColors[moment.approval_state]}`}>
            {moment.approval_state.replace('_', ' ')}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          <p>ID: {moment.id}</p>
          <p>Created: {new Date(moment.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  )
}
