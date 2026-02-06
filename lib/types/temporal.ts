export type TemporalPhase =
  | 'SCHEDULED'
  | 'READY'
  | 'URGENT'
  | 'EXPIRED';

export interface TemporalWindow {
  earliest: string;
  latest: string;
  urgency_grace_hours: number;
}

export interface TemporalState {
  phase: TemporalPhase;
  window: TemporalWindow;
  time_until_next_phase?: number; // milliseconds
}
