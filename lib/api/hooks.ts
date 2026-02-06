import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { 
  EventReceiveRequest, 
  ApproveEventRequest, 
  RenderSubmitRequest,
  PublishMuxRequest,
  PublishShopifyRequest
} from './client'

// Health Check Hook
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3
  })
}

// Event Hooks
export function useReceiveEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: EventReceiveRequest) => api.receiveEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}

export function useApproveEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: ApproveEventRequest }) => 
      api.approveEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}

// Render Hooks
export function useSubmitRender() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: RenderSubmitRequest) => api.submitRender(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renders'] })
    }
  })
}

export function useRenderStatus(jobId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['render-status', jobId],
    queryFn: () => api.renderStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling if complete or error
      if (query.state.data?.status === 'complete' || query.state.data?.status === 'error') {
        return false
      }
      // Poll every 5 seconds while rendering
      return 5000
    }
  })
}

// Publishing Hooks
export function usePublishMux() {
  return useMutation({
    mutationFn: (data: PublishMuxRequest) => api.publishMux(data)
  })
}

export function usePublishShopify() {
  return useMutation({
    mutationFn: (data: PublishShopifyRequest) => api.publishShopify(data)
  })
}

