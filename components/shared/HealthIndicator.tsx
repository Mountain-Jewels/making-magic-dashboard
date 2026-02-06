'use client'

import { useHealth } from '@/lib/api/hooks'

export function HealthIndicator() {
  const { data, isLoading, isError } = useHealth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span className="text-gray-400">Checking API...</span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <span className="text-red-400">API Offline</span>
      </div>
    )
  }

  const isHealthy = data.status === 'healthy'

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <span className={isHealthy ? 'text-green-400' : 'text-yellow-400'}>
        {data.service} v{data.version}
      </span>
    </div>
  )
}

