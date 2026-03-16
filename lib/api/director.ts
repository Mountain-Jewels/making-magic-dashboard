/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from './client'

export interface DirectorMessage {
  role: string
  content: string
  timestamp?: string
}

export interface DirectorChatResponse {
  response: string
  session_id: string
  state: string
  clarification?: string
  messages?: DirectorMessage[]
  questions?: PendingQuestion[]
  intent?: Record<string, unknown>
  plan?: Record<string, unknown>
}

export interface DirectorApproveResponse {
  status: string
  job_id?: string
}

export interface PendingQuestion {
  field?: string
  question?: string
}

export interface DirectorStateResponse {
  state: string
  current_job_id?: string
  pending_questions: (string | PendingQuestion)[]
}

export interface SimilarJob {
  job_id: string
  similarity: number
  summary: string
}

export async function chatWithDirector(
  message: string,
  sessionId?: string
): Promise<DirectorChatResponse> {
  const res = await apiPost<{
    status: string
    data?: { status?: string; questions?: Array<{ field?: string; question?: string }>; intent?: Record<string, unknown>; plan?: Record<string, unknown> }
    messages?: Array<{ role: string; content: string }>
  }>('/director/chat', { message, session_id: sessionId })

  const lastDirector = res.messages?.filter((m) => m.role === 'director').pop()
  const response = lastDirector?.content ?? ''
  const state = res.data?.status ?? res.status ?? 'idle'
  const questions = res.data?.questions ?? []
  const clarification = questions.map((q) => q.question ?? q.field ?? '').join('\n') || undefined

  return {
    response,
    session_id: sessionId ?? '',
    state,
    clarification,
    messages: res.messages,
    questions,
    intent: res.data?.intent,
    plan: res.data?.plan,
  }
}

export async function answerDirector(
  sessionId: string,
  answer: string,
  context: { field: string; intent: Record<string, unknown> }
): Promise<DirectorChatResponse> {
  const res = await apiPost<{
    status: string
    data?: { status?: string; questions?: Array<{ field?: string; question?: string }>; intent?: Record<string, unknown>; plan?: Record<string, unknown> }
    messages?: Array<{ role: string; content: string }>
  }>('/director/answer', {
    session_id: sessionId,
    field: context.field,
    value: answer,
    intent: context.intent,
  })

  const lastDirector = res.messages?.filter((m) => m.role === 'director').pop()
  const response = lastDirector?.content ?? ''
  const state = res.data?.status ?? res.status ?? 'idle'
  const questions = res.data?.questions ?? []
  const clarification = questions.map((q) => q.question ?? q.field ?? '').join('\n') || undefined

  return {
    response,
    session_id: sessionId,
    state,
    clarification,
    messages: res.messages,
    questions,
    intent: res.data?.intent,
    plan: res.data?.plan,
  }
}

export async function approveDirectorPlan(
  sessionId: string,
  plan: Record<string, unknown>
): Promise<DirectorApproveResponse> {
  const res = await apiPost<{
    status: string
    data?: { job_id?: string; plan?: { job_id?: string } }
  }>('/director/approve', { session_id: sessionId, plan })

  const job_id = res.data?.job_id ?? res.data?.plan?.job_id
  return {
    status: res.status,
    job_id,
  }
}

export async function getDirectorState(): Promise<
  DirectorStateResponse & { messages?: DirectorMessage[] }
> {
  const res = await apiGet<{
    state: string
    progress?: number
    messages?: Array<{ role: string; content: string }>
    pending_questions?: Array<{ field?: string; question?: string } | string>
  }>('/director/state')

  const pending_questions = res.pending_questions ?? []

  return {
    state: res.state,
    current_job_id: undefined,
    pending_questions,
    messages: res.messages,
  }
}

export async function resetDirector(): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/director/reset')
}

export async function getSimilarJobs(jobId: string): Promise<SimilarJob[]> {
  const res = await apiGet<{
    job_id: string
    neighbors?: Array<{ job_id: string; distance?: number; rank?: number }>
  }>(`/director/similar/${encodeURIComponent(jobId)}`)

  return (res.neighbors ?? []).map((n) => ({
    job_id: n.job_id,
    similarity: n.distance != null ? 1 - Math.min(1, n.distance) : 0,
    summary: '',
  }))
}
