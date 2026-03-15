/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Rules, boundaries, guidelines, policies, and diamond reference data.
 * Shared knowledge — enforced across all avatars.
 */

export type GuardrailCategory =
  | 'boundary'
  | 'guideline'
  | 'diamond_reference'
  | 'policy'
  | 'context_rule'

export interface Guardrail {
  id: string
  category: GuardrailCategory
  name: string
  description: string
  active: boolean
  environments: string[]
  created_at: string
  updated_at: string
}

export interface DiamondSizeEntry {
  shape: string
  carat: number
  length_mm: number
  width_mm: number
  depth_mm: number
}

export const GUARDRAIL_CATEGORY_LABELS: Record<GuardrailCategory, string> = {
  boundary: 'Boundaries',
  guideline: 'Guidelines',
  diamond_reference: 'Diamond Reference',
  policy: 'Policies',
  context_rule: 'Context Rules',
}

export const GUARDRAIL_CATEGORY_DESCRIPTIONS: Record<GuardrailCategory, string> = {
  boundary: 'Hard limits all avatars must respect — never crossed',
  guideline: 'Soft guidance for avatar behavior — best practices',
  diamond_reference: 'Factual gemstone data — mm/carat, 4Cs, shapes',
  policy: 'Business rules — returns, custom orders, shipping',
  context_rule: 'Occasion and seasonal triggers — holidays, events',
}

/**
 * Static diamond mm reference table.
 * Covers standard shapes at common carat weights.
 * Used as a fast client-side fallback when the API is unavailable.
 */
export const DIAMOND_SIZE_TABLE: DiamondSizeEntry[] = [
  // Round
  { shape: 'round', carat: 0.25, length_mm: 4.1, width_mm: 4.1, depth_mm: 2.5 },
  { shape: 'round', carat: 0.50, length_mm: 5.2, width_mm: 5.2, depth_mm: 3.1 },
  { shape: 'round', carat: 0.75, length_mm: 5.8, width_mm: 5.8, depth_mm: 3.5 },
  { shape: 'round', carat: 1.00, length_mm: 6.5, width_mm: 6.5, depth_mm: 3.9 },
  { shape: 'round', carat: 1.25, length_mm: 6.9, width_mm: 6.9, depth_mm: 4.2 },
  { shape: 'round', carat: 1.50, length_mm: 7.4, width_mm: 7.4, depth_mm: 4.5 },
  { shape: 'round', carat: 2.00, length_mm: 8.2, width_mm: 8.2, depth_mm: 4.9 },
  { shape: 'round', carat: 3.00, length_mm: 9.3, width_mm: 9.3, depth_mm: 5.6 },
  { shape: 'round', carat: 4.00, length_mm: 10.2, width_mm: 10.2, depth_mm: 6.2 },
  { shape: 'round', carat: 5.00, length_mm: 11.0, width_mm: 11.0, depth_mm: 6.6 },

  // Oval
  { shape: 'oval', carat: 0.25, length_mm: 5.0, width_mm: 3.5, depth_mm: 2.2 },
  { shape: 'oval', carat: 0.50, length_mm: 6.0, width_mm: 4.5, depth_mm: 2.8 },
  { shape: 'oval', carat: 0.75, length_mm: 7.0, width_mm: 5.0, depth_mm: 3.1 },
  { shape: 'oval', carat: 1.00, length_mm: 7.7, width_mm: 5.7, depth_mm: 3.5 },
  { shape: 'oval', carat: 1.50, length_mm: 8.5, width_mm: 6.5, depth_mm: 4.0 },
  { shape: 'oval', carat: 2.00, length_mm: 9.5, width_mm: 7.0, depth_mm: 4.3 },
  { shape: 'oval', carat: 3.00, length_mm: 10.5, width_mm: 8.0, depth_mm: 4.9 },
  { shape: 'oval', carat: 5.00, length_mm: 13.0, width_mm: 9.5, depth_mm: 5.8 },

  // Pear
  { shape: 'pear', carat: 0.25, length_mm: 5.5, width_mm: 3.5, depth_mm: 2.2 },
  { shape: 'pear', carat: 0.50, length_mm: 7.0, width_mm: 4.5, depth_mm: 2.8 },
  { shape: 'pear', carat: 0.75, length_mm: 7.5, width_mm: 5.0, depth_mm: 3.1 },
  { shape: 'pear', carat: 1.00, length_mm: 8.0, width_mm: 5.5, depth_mm: 3.4 },
  { shape: 'pear', carat: 1.50, length_mm: 9.0, width_mm: 6.0, depth_mm: 3.8 },
  { shape: 'pear', carat: 2.00, length_mm: 10.0, width_mm: 7.0, depth_mm: 4.3 },
  { shape: 'pear', carat: 3.00, length_mm: 11.5, width_mm: 7.5, depth_mm: 4.8 },
  { shape: 'pear', carat: 5.00, length_mm: 14.0, width_mm: 9.0, depth_mm: 5.5 },

  // Emerald
  { shape: 'emerald', carat: 0.25, length_mm: 4.5, width_mm: 3.0, depth_mm: 2.0 },
  { shape: 'emerald', carat: 0.50, length_mm: 5.5, width_mm: 4.0, depth_mm: 2.6 },
  { shape: 'emerald', carat: 0.75, length_mm: 6.0, width_mm: 4.5, depth_mm: 2.9 },
  { shape: 'emerald', carat: 1.00, length_mm: 6.5, width_mm: 5.0, depth_mm: 3.3 },
  { shape: 'emerald', carat: 1.50, length_mm: 7.5, width_mm: 5.5, depth_mm: 3.7 },
  { shape: 'emerald', carat: 2.00, length_mm: 8.5, width_mm: 6.0, depth_mm: 4.0 },
  { shape: 'emerald', carat: 3.00, length_mm: 9.5, width_mm: 7.0, depth_mm: 4.6 },
  { shape: 'emerald', carat: 5.00, length_mm: 11.5, width_mm: 8.5, depth_mm: 5.3 },

  // Cushion
  { shape: 'cushion', carat: 0.25, length_mm: 3.7, width_mm: 3.7, depth_mm: 2.4 },
  { shape: 'cushion', carat: 0.50, length_mm: 4.7, width_mm: 4.7, depth_mm: 3.0 },
  { shape: 'cushion', carat: 0.75, length_mm: 5.3, width_mm: 5.3, depth_mm: 3.4 },
  { shape: 'cushion', carat: 1.00, length_mm: 5.8, width_mm: 5.8, depth_mm: 3.7 },
  { shape: 'cushion', carat: 1.50, length_mm: 6.5, width_mm: 6.5, depth_mm: 4.2 },
  { shape: 'cushion', carat: 2.00, length_mm: 7.3, width_mm: 7.3, depth_mm: 4.7 },
  { shape: 'cushion', carat: 3.00, length_mm: 8.2, width_mm: 8.2, depth_mm: 5.2 },
  { shape: 'cushion', carat: 5.00, length_mm: 9.8, width_mm: 9.8, depth_mm: 6.3 },

  // Princess
  { shape: 'princess', carat: 0.25, length_mm: 3.5, width_mm: 3.5, depth_mm: 2.6 },
  { shape: 'princess', carat: 0.50, length_mm: 4.4, width_mm: 4.4, depth_mm: 3.3 },
  { shape: 'princess', carat: 0.75, length_mm: 5.0, width_mm: 5.0, depth_mm: 3.7 },
  { shape: 'princess', carat: 1.00, length_mm: 5.5, width_mm: 5.5, depth_mm: 4.0 },
  { shape: 'princess', carat: 1.50, length_mm: 6.2, width_mm: 6.2, depth_mm: 4.5 },
  { shape: 'princess', carat: 2.00, length_mm: 7.0, width_mm: 7.0, depth_mm: 5.0 },
  { shape: 'princess', carat: 3.00, length_mm: 7.8, width_mm: 7.8, depth_mm: 5.7 },
  { shape: 'princess', carat: 5.00, length_mm: 9.2, width_mm: 9.2, depth_mm: 6.7 },

  // Marquise
  { shape: 'marquise', carat: 0.25, length_mm: 6.0, width_mm: 3.0, depth_mm: 1.9 },
  { shape: 'marquise', carat: 0.50, length_mm: 8.0, width_mm: 4.0, depth_mm: 2.5 },
  { shape: 'marquise', carat: 0.75, length_mm: 9.0, width_mm: 4.5, depth_mm: 2.8 },
  { shape: 'marquise', carat: 1.00, length_mm: 10.0, width_mm: 5.0, depth_mm: 3.1 },
  { shape: 'marquise', carat: 1.50, length_mm: 11.5, width_mm: 5.7, depth_mm: 3.5 },
  { shape: 'marquise', carat: 2.00, length_mm: 12.5, width_mm: 6.2, depth_mm: 3.8 },
  { shape: 'marquise', carat: 3.00, length_mm: 14.0, width_mm: 7.0, depth_mm: 4.3 },
  { shape: 'marquise', carat: 5.00, length_mm: 17.0, width_mm: 8.5, depth_mm: 5.3 },

  // Radiant
  { shape: 'radiant', carat: 0.25, length_mm: 3.8, width_mm: 3.5, depth_mm: 2.3 },
  { shape: 'radiant', carat: 0.50, length_mm: 4.7, width_mm: 4.3, depth_mm: 2.9 },
  { shape: 'radiant', carat: 0.75, length_mm: 5.3, width_mm: 4.9, depth_mm: 3.3 },
  { shape: 'radiant', carat: 1.00, length_mm: 5.8, width_mm: 5.3, depth_mm: 3.6 },
  { shape: 'radiant', carat: 1.50, length_mm: 6.7, width_mm: 6.1, depth_mm: 4.0 },
  { shape: 'radiant', carat: 2.00, length_mm: 7.3, width_mm: 6.7, depth_mm: 4.4 },
  { shape: 'radiant', carat: 3.00, length_mm: 8.3, width_mm: 7.5, depth_mm: 5.0 },
  { shape: 'radiant', carat: 5.00, length_mm: 10.0, width_mm: 9.0, depth_mm: 5.8 },
]

export const DIAMOND_SHAPES = [
  'round', 'oval', 'pear', 'emerald', 'cushion', 'princess', 'marquise', 'radiant',
] as const

export type DiamondShape = typeof DIAMOND_SHAPES[number]

export const DEFAULT_GUARDRAILS: Guardrail[] = [
  {
    id: 'b-no-competitor',
    category: 'boundary',
    name: 'No Competitor Discussion',
    description: 'Never discuss competitor pricing, products, or brand comparisons.',
    active: true,
    environments: ['Landing', 'Cave', 'Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'b-max-discount',
    category: 'boundary',
    name: 'Maximum Discount 15%',
    description: 'Avatars cannot offer or imply discounts greater than 15% without manager approval.',
    active: true,
    environments: ['Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'b-no-medical',
    category: 'boundary',
    name: 'No Medical Claims',
    description: 'Never make health, healing, or medical claims about gemstones.',
    active: true,
    environments: ['Landing', 'Cave', 'Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'g-complementary',
    category: 'guideline',
    name: 'Suggest Complementary Pieces',
    description: 'When a customer selects a ring, suggest matching earrings or pendant.',
    active: true,
    environments: ['Avatar'],
    created_at: '2026-01-15',
    updated_at: '2026-01-15',
  },
  {
    id: 'g-care',
    category: 'guideline',
    name: 'Mention Jewelry Care',
    description: 'After any purchase discussion, mention cleaning and care instructions.',
    active: true,
    environments: ['Avatar'],
    created_at: '2026-01-15',
    updated_at: '2026-01-15',
  },
  {
    id: 'g-budget-respect',
    category: 'guideline',
    name: 'Respect Budget',
    description: 'If a customer states a budget, only suggest items within that range. Upsell gently, never aggressively.',
    active: true,
    environments: ['Avatar'],
    created_at: '2026-02-01',
    updated_at: '2026-02-01',
  },
  {
    id: 'p-custom-no-return',
    category: 'policy',
    name: 'Custom Orders Non-Refundable',
    description: 'Custom-designed pieces are final sale. Satisfaction guarantee on craftsmanship applies.',
    active: true,
    environments: ['Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'p-30-day-return',
    category: 'policy',
    name: '30-Day Return Policy',
    description: 'Standard catalog items can be returned within 30 days in original condition.',
    active: true,
    environments: ['Landing', 'Cave', 'Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'p-shipping',
    category: 'policy',
    name: 'Free Shipping Over $500',
    description: 'Free insured shipping on orders over $500. International shipping available for additional fee.',
    active: true,
    environments: ['Landing', 'Avatar'],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'cr-holiday',
    category: 'context_rule',
    name: 'Holiday Season',
    description: 'Emphasize gift-wrapping, holiday collections, and extended return window.',
    active: true,
    environments: ['Landing', 'Avatar'],
    created_at: '2026-01-05',
    updated_at: '2026-01-05',
  },
  {
    id: 'cr-valentines',
    category: 'context_rule',
    name: "Valentine's Day",
    description: 'Lead with romantic pieces, heart motifs, and couples collections.',
    active: false,
    environments: ['Landing', 'Cave', 'Avatar'],
    created_at: '2026-02-01',
    updated_at: '2026-02-01',
  },
]
