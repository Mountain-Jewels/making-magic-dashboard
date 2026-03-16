/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

const STUDIO_ENGINE_URL =
  process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL?.replace(/\/$/, '') ?? 'http://localhost:8100'

export type ConciergeIdleEvent = 'idle_imminent' | 'idle_confirmed' | 'active'

export type ConciergeIdleNextAction =
  | 'none'
  | 'offer_resume'
  | 'downgrade_streaming'
  | 'go_dormant'

export interface ConciergeIdleSignalRequest {
  session_id: string
  timestamp: string
  event: ConciergeIdleEvent
}

export interface ConciergeIdleSignalResponse {
  status: 'ok'
  next_action?: ConciergeIdleNextAction
  // Forward compatibility for clients expecting echoed signal.
  signal?: ConciergeIdleEvent
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { getAccessToken } = await import('@/lib/auth/getToken')
    const token = await getAccessToken()
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
  } catch {
    // Auth may not be available in all runtimes.
  }
  return {}
}

export async function postConciergeIdleSignal(
  payload: ConciergeIdleSignalRequest
): Promise<ConciergeIdleSignalResponse> {
  const authHeader = await getAuthHeaders()
  const res = await fetch(`${STUDIO_ENGINE_URL}/concierge/idle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || 'Failed to send concierge idle signal')
  }

  return res.json() as Promise<ConciergeIdleSignalResponse>
}
