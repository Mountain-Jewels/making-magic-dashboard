import { MomentIntent } from '@/lib/types/moment'

export const mockMoments: MomentIntent[] = [
  {
    id: 'mi_001',
    signal_id: 'sig_birthday_jane',
    created_at: '2026-02-06T10:00:00Z',
    policy_version: '2026-02-01',
    moment_type: 'birthday',
    recipient_role: 'spouse',
    emotional_tone: 'celebratory',
    personalization_level: 4,
    approval_state: 'pending_approval',
    temporal_window: {
      earliest: '2026-02-14T00:00:00Z',
      latest: '2026-02-14T23:59:59Z',
      urgency_grace_hours: 24,
    },
  },
  {
    id: 'mi_002',
    signal_id: 'sig_anniversary_john',
    created_at: '2026-02-05T14:30:00Z',
    policy_version: '2026-02-01',
    moment_type: 'anniversary',
    recipient_role: 'spouse',
    emotional_tone: 'romantic',
    personalization_level: 5,
    approval_state: 'approved',
    approved_by: 'operator@mountainjewels.com',
    approved_at: '2026-02-05T15:00:00Z',
    temporal_window: {
      earliest: '2026-02-20T00:00:00Z',
      latest: '2026-02-20T23:59:59Z',
      urgency_grace_hours: 48,
    },
  },
  {
    id: 'mi_003',
    signal_id: 'sig_milestone_sarah',
    created_at: '2026-02-04T09:00:00Z',
    policy_version: '2026-02-01',
    moment_type: 'milestone',
    recipient_role: 'child',
    emotional_tone: 'proud',
    personalization_level: 3,
    approval_state: 'in_progress',
    temporal_window: {
      earliest: '2026-02-10T00:00:00Z',
      latest: '2026-02-10T23:59:59Z',
      urgency_grace_hours: 12,
    },
  },
]
