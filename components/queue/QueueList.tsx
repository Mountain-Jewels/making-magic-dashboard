import { MomentIntent } from '@/lib/types/moment'
import { MomentIntentCard } from './MomentIntentCard'

export function QueueList({ moments }: { moments: MomentIntent[] }) {
  if (moments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No MomentIntents found
      </div>
    )
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {moments.map((moment) => (
        <MomentIntentCard key={moment.id} moment={moment} />
      ))}
    </div>
  )
}
