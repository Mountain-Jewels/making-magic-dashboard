/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet } from './client'

export interface AgentInfo {
  agent_type: string
  name: string
  description: string
  capabilities: string[]
  status?: string
}

export async function listAgents(): Promise<AgentInfo[]> {
  return apiGet<AgentInfo[]>('/agents/')
}

export async function getAgent(agentType: string): Promise<AgentInfo> {
  return apiGet<AgentInfo>(`/agents/${encodeURIComponent(agentType)}`)
}
