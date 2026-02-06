import { ProviderCard } from '@/components/health/ProviderCard'
import { mockProviders } from '@/lib/mock/health'

export default function HealthPage() {
  const healthyCount = mockProviders.filter(p => p.status === 'healthy').length
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#D4AF37]">System Health</h1>
        <p className="text-gray-400 mt-1">
          {healthyCount}/{mockProviders.length} providers healthy
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProviders.map((provider) => (
          <ProviderCard key={provider.name} provider={provider} />
        ))}
      </div>
    </div>
  )
}
