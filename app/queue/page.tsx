import { QueueList } from '@/components/queue/QueueList'
import { mockMoments } from '@/lib/mock/moments'

export default function QueuePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#D4AF37]">MomentIntent Queue</h1>
        <p className="text-gray-400 mt-1">Review and approve pending intents</p>
      </div>
      <QueueList moments={mockMoments} />
    </div>
  )
}
