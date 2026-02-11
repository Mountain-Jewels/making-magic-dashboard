/**
 * AI Chat API — GPT-4, suggestions, Grok
 */

import { apiPost } from './client'
import type { ChatMessageRequest, ChatMessageResponse, SuggestionsRequest, SuggestionsResponse } from './types'

export async function chatMessage(
  request: ChatMessageRequest
): Promise<ChatMessageResponse> {
  return apiPost<ChatMessageResponse>('/ai/chat', request)
}

export async function getSuggestions(
  request: SuggestionsRequest
): Promise<SuggestionsResponse> {
  return apiPost<SuggestionsResponse>('/ai/suggest', request)
}

export async function chatWithGrok(
  request: ChatMessageRequest
): Promise<ChatMessageResponse> {
  return apiPost<ChatMessageResponse>('/ai/grok', request)
}
