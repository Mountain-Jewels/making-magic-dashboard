export interface ProviderHealth {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  latency_ms: number
  circuit_breaker: 'closed' | 'open' | 'half-open'
  last_check: string
}

export const mockProviders: ProviderHealth[] = [
  { name: 'Replicate', status: 'healthy', latency_ms: 245, circuit_breaker: 'closed', last_check: '2026-02-06T13:00:00Z' },
  { name: 'ElevenLabs', status: 'healthy', latency_ms: 180, circuit_breaker: 'closed', last_check: '2026-02-06T13:00:00Z' },
  { name: 'Runway', status: 'degraded', latency_ms: 1200, circuit_breaker: 'half-open', last_check: '2026-02-06T13:00:00Z' },
  { name: 'Mux', status: 'healthy', latency_ms: 95, circuit_breaker: 'closed', last_check: '2026-02-06T13:00:00Z' },
  { name: 'OpenAI', status: 'healthy', latency_ms: 320, circuit_breaker: 'closed', last_check: '2026-02-06T13:00:00Z' },
]
