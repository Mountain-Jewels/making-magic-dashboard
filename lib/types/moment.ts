export type ApprovalState = 
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type MomentType =
  | 'birthday'
  | 'anniversary'
  | 'milestone'
  | 'gratitude'
  | 'legacy'
  | 'seasonal'
  | 'promotional';

export type RecipientRole =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'friend'
  | 'self'
  | 'customer';

export interface MomentIntent {
  id: string;
  signal_id: string;
  created_at: string;
  policy_version: string;
  
  moment_type: MomentType;
  recipient_role: RecipientRole;
  emotional_tone: string;
  personalization_level: number;
  
  approval_state: ApprovalState;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  temporal_window: {
    earliest: string;
    latest: string;
    urgency_grace_hours: number;
  };
  
  assets?: Asset[];
}

export interface Asset {
  id: string;
  type: 'video' | 'image' | 'message' | 'gift_card';
  url: string;
  created_at: string;
  delivery_status: 'pending' | 'delivered' | 'failed';
}
