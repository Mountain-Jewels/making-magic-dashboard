/**
 * The Studio Director API client
 * Connects Making Magic Dashboard to The Studio AI Director
 */

const STUDIO_API_URL =
  process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL?.replace(/\/$/, "") || "http://localhost:8100";

export interface DirectorMessage {
  role: "director" | "user" | "system";
  content: string;
  timestamp: string;
}

export interface DirectorChatResponse {
  status: "needs_clarification" | "awaiting_approval" | "complete" | "failed";
  data: {
    questions?: Array<{
      field: string;
      question: string;
      options: string[];
      free_text?: boolean;
    }>;
    plan?: Record<string, unknown>;
    suggestions?: Array<{
      category: string;
      suggestion: string;
    }>;
    intent?: Record<string, unknown>;
    errors?: string[];
  };
  messages: DirectorMessage[];
}

export async function chatWithDirector(
  message: string
): Promise<DirectorChatResponse> {
  const resp = await fetch(`${STUDIO_API_URL}/director/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}

export async function answerDirectorQuestion(
  field: string,
  value: string,
  intent: Record<string, unknown>
): Promise<DirectorChatResponse> {
  const resp = await fetch(`${STUDIO_API_URL}/director/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, value, intent }),
  });
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}

export async function approvePlan(
  plan: Record<string, unknown>
): Promise<DirectorChatResponse> {
  const resp = await fetch(`${STUDIO_API_URL}/director/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}

export async function getDirectorState(): Promise<{
  state: string;
  progress: number;
  messages: DirectorMessage[];
}> {
  const resp = await fetch(`${STUDIO_API_URL}/director/state`);
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}

export function connectDirectorWebSocket(
  onMessage: (event: Record<string, unknown>) => void
): WebSocket {
  const wsUrl = STUDIO_API_URL.replace("http", "ws");
  const ws = new WebSocket(`${wsUrl}/ws/progress`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data as string);
    onMessage(data);
  };
  ws.onopen = () => {
    ws.send(JSON.stringify({ action: "ping" }));
  };
  return ws;
}

export async function listStudioAgents(): Promise<{
  agent_count: number;
  agents: Record<string, { type: string; capabilities: string[]; status: string }>;
}> {
  const resp = await fetch(`${STUDIO_API_URL}/agents/`);
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}

export async function studioHealthCheck(): Promise<Record<string, unknown>> {
  const resp = await fetch(`${STUDIO_API_URL}/health`);
  if (!resp.ok) throw new Error(`Director API error: ${resp.status}`);
  return resp.json();
}
