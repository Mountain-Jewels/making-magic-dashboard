export interface Signal {
  name: string;
  value: boolean;
  approved: boolean;
  source: 'llm' | 'ui' | 'governance' | 'timeout';
}

export interface SignalSet {
  intent_clear: Signal;
  interest_shown: Signal;
  ready_to_proceed: Signal;
  declined: Signal;
  timeout: Signal;
  governance_block: Signal;
}
