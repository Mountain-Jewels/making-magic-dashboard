'use client'

import { useRenderStatus } from '@/lib/api/hooks'

interface RenderStatusProps {
  jobId: string | null
}

export function RenderStatus({ jobId }: RenderStatusProps) {
  const { data, isLoading } = useRenderStatus(jobId)

  if (!jobId) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-600">No active render job</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700">Loading render status...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-red-100 rounded-lg p-6">
        <p className="text-red-700">Failed to load render status</p>
      </div>
    )
  }

  const getStatusColor = () => {
    switch (data.status) {
      case 'queued': return 'bg-yellow-500'
      case 'rendering': return 'bg-blue-500'
      case 'complete': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Render Status</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor()}`}>
          {data.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-800">{data.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.progress}%` }}
            ></div>
          </div>
        </div>

        {data.estimated_completion && (
          <p className="text-sm text-gray-600">
            Estimated completion: {new Date(data.estimated_completion).toLocaleTimeString()}
          </p>
        )}

        {data.error_message && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-700">{data.error_message}</p>
          </div>
        )}

        {data.status === 'complete' && data.video_file_path && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-700 font-medium">✓ Render complete!</p>
            <p className="text-xs text-green-600 mt-1">{data.video_file_path}</p>
          </div>
        )}
      </div>
    </div>
  )
}

