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
  | 'wedding'
  | 'graduation'
  | 'property'
  | 'legacy'
  | 'gratitude';

export type RecipientRole =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'friend'
  | 'unknown';

export type EmotionalTone =
  | 'romantic'
  | 'celebratory'
  | 'grateful'
  | 'legacy'
  | 'milestone';

export type AgeBand = 'under_13' | 'minor_13_17' | 'adult_18_plus';

export type EligibilityStatus = 'eligible' | 'review_required' | 'ineligible';

export type AssetType =
  | 'CINEMATIC_VIDEO'
  | 'PERSONAL_MESSAGE'
  | 'DIGITAL_GIFT_CARD'
  | 'PRODUCT_RECOMMENDATION';

export type Channel = 'email' | 'sms' | 'notification';

export interface MomentIntent {
  id: string;
  signal_id: string;
  created_at: string;
  policy_version: string;

  // Moment Definition
  moment_type: MomentType;
  recipient_role: RecipientRole;

  // Governance
  age_band: AgeBand;
  eligibility_status: EligibilityStatus;
  approval_required: true;
  approval_state: ApprovalState;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;

  // Creative Direction
  emotional_tone: EmotionalTone;
  allowed_assets: AssetType[];
  forbidden_language: string[];

  // Delivery Constraints
  delivery_channels: Channel[];
  delivery_window: {
    earliest: string;
    latest: string;
  };

  // Execution Outputs (filled post-run)
  outputs?: {
    video?: { mux_playback_id: string };
    message?: { text: string; approved_version: number };
    gift_card?: { shopify_gift_card_id: string; value: number; currency: string };
  };

  // Audit
  audit_trail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export interface Asset {
  id: string;
  type: 'video' | 'image' | 'message' | 'gift_card';
  url: string;
  created_at: string;
  delivery_status: 'pending' | 'delivered' | 'failed';
}
