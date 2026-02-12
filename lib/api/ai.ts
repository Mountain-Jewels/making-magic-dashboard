/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * AI Chat API — GPT-4, suggestions, Grok
 */

import { apiPost } from './client'
import type {
  ChatMessageRequest,
  ChatMessageResponse,
  SuggestionsRequest,
  SuggestionsResponse,
  GrokResponse,
} from './types'

export async function chatMessage(
  request: ChatMessageRequest
): Promise<ChatMessageResponse & { suggestions?: { type: string; action: string; value: string }[] }> {
  return apiPost('/ai/chat', request)
}

export async function getSuggestions(
  request: SuggestionsRequest
): Promise<SuggestionsResponse> {
  return apiPost<SuggestionsResponse>('/ai/suggest', request)
}

export async function chatWithGrok(
  request: ChatMessageRequest
): Promise<GrokResponse & { content?: string }> {
  return apiPost('/ai/grok', request)
}
