/**
 * Making Magic API Client
 * Base URL: https://making-magic-api.orangemushroom-9c6ca205.eastus.azurecontainerapps.io/
 * Version: 2.0.0
 */

const API_BASE = 'https://making-magic-api.orangemushroom-9c6ca205.eastus.azurecontainerapps.io'

export interface HealthResponse {
  status: string
  service: string
  version: string
  components: {
    dialogue_generator: string
    voice_synthesizer: string
    render_queue: string
    mux_publisher: string
    shopify_publisher: string
  }
  timestamp: string
}

export interface EventReceiveRequest {
  event_type: 'birthday' | 'anniversary' | 'engagement' | 'holiday' | 'thank_you'
  product_id: string
  emotional_tone?: string
}

export interface EventResponse {
  event_id: string
  event_type: string
  product_id: string
  status: string
  received_at: string
}

export interface ApproveEventRequest {
  approved_by: string
}

export interface RenderSubmitRequest {
  audio_file_path: string
  dialogue_text: string
  emotional_tone: string
  duration_seconds: number
  event_type?: string
  approved_by: string
}

export interface RenderJobResponse {
  job_id: string
  status: string
  submitted_at: string
}

export interface RenderStatusResponse {
  job_id: string
  status: 'queued' | 'rendering' | 'complete' | 'error'
  progress: number
  estimated_completion?: string
  video_file_path?: string
  error_message?: string
}

export interface PublishMuxRequest {
  video_file_path: string
  emotional_tone?: string
  event_type?: string
}

export interface PublishShopifyRequest {
  product_id: string
  playback_id: string
  emotional_tone: string
  event_type: string
}

export const api = {
  // Health Check
  health: async (): Promise<HealthResponse> => {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) throw new Error('Health check failed')
    return res.json()
  },

  // Event Management
  receiveEvent: async (data: EventReceiveRequest): Promise<EventResponse> => {
    const res = await fetch(`${API_BASE}/events/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to receive event')
    return res.json()
  },

  approveEvent: async (eventId: string, data: ApproveEventRequest): Promise<EventResponse> => {
    const res = await fetch(`${API_BASE}/events/${eventId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to approve event')
    return res.json()
  },

  // Render Jobs
  submitRender: async (data: RenderSubmitRequest): Promise<RenderJobResponse> => {
    const res = await fetch(`${API_BASE}/render/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to submit render job')
    return res.json()
  },

  renderStatus: async (jobId: string): Promise<RenderStatusResponse> => {
    const res = await fetch(`${API_BASE}/render/${jobId}/status`)
    if (!res.ok) throw new Error('Failed to get render status')
    return res.json()
  },

  // Publishing
  publishMux: async (data: PublishMuxRequest) => {
    const res = await fetch(`${API_BASE}/publish/mux`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to publish to Mux')
    return res.json()
  },

  publishShopify: async (data: PublishShopifyRequest) => {
    const res = await fetch(`${API_BASE}/publish/shopify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to publish to Shopify')
    return res.json()
  }
}

