import { TemporalPhase } from '@/lib/types/temporal'

const phaseColors = {
  SCHEDULED: 'bg-gray-500/20 text-gray-400',
  READY: 'bg-green-500/20 text-green-400',
  URGENT: 'bg-orange-500/20 text-orange-400',
  EXPIRED: 'bg-red-500/20 text-red-400',
}

export function TemporalPhaseBadge({ phase }: { phase: TemporalPhase }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${phaseColors[phase]}`}>
      {phase}
    </span>
  )
}
