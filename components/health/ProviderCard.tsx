import { ProviderHealth } from '@/lib/mock/health'

const statusColors = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
}

export function ProviderCard({ provider }: { provider: ProviderHealth }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${statusColors[provider.status]}`} />
        <h3 className="font-semibold text-white">{provider.name}</h3>
      </div>
      <div className="text-sm text-gray-400 space-y-1">
        <p>Latency: {provider.latency_ms}ms</p>
        <p>Circuit: {provider.circuit_breaker}</p>
      </div>
    </div>
  )
}
