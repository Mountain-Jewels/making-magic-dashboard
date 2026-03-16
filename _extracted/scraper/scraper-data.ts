// © 2026 Mountain Jewels LLC. All rights reserved.

import type {
  SearchType,
  LifeEvent,
  IntendedUse,
  GovernanceCheck,
  EventCategory,
  EnrichmentEstimate,
  CostEstimate,
  DayOfWeek,
} from '@/lib/types/scraper'

// ---------------------------------------------------------------------------
// Search Types — 46 items across groups A–H
// ---------------------------------------------------------------------------

export const SEARCH_TYPES: SearchType[] = [
  // Group A — Identity & Entity Searches
  { id: 'A01', group: 'A', label: 'Person Name Search', sensitivityLevel: 'PII', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'A02', group: 'A', label: 'SSN Trace (last 4)', sensitivityLevel: 'SENSITIVE', allowedUses: ['STORAGE'], minorRisk: false },
  { id: 'A03', group: 'A', label: 'Date of Birth Lookup', sensitivityLevel: 'PII', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT'], minorRisk: true },
  { id: 'A04', group: 'A', label: 'Entity / Business Name Search', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'MARKETING'], minorRisk: false },
  { id: 'A05', group: 'A', label: 'Phone Number Reverse Lookup', sensitivityLevel: 'PII', allowedUses: ['ACQUISITION', 'ENRICHMENT'], minorRisk: false },
  { id: 'A06', group: 'A', label: 'Email Reverse Lookup', sensitivityLevel: 'PII', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },

  // Group B — Property & Financial Searches
  { id: 'B01', group: 'B', label: 'Property Deed Search', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT'], minorRisk: false },
  { id: 'B02', group: 'B', label: 'Tax Assessor Records', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'B03', group: 'B', label: 'Mortgage Filing Search', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'B04', group: 'B', label: 'Foreclosure Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'B05', group: 'B', label: 'Property Transfer Alerts', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'B06', group: 'B', label: 'UCC Filing Search', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },

  // Group C — Legal & Court Searches
  { id: 'C01', group: 'C', label: 'Civil Court Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'C02', group: 'C', label: 'Probate Records', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT'], minorRisk: false },
  { id: 'C03', group: 'C', label: 'Divorce Filings', sensitivityLevel: 'SENSITIVE', allowedUses: ['STORAGE'], minorRisk: true },
  { id: 'C04', group: 'C', label: 'Bankruptcy Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'C05', group: 'C', label: 'Lien Records', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'C06', group: 'C', label: 'Judgment Records', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },

  // Group D — Event-Based Searches
  { id: 'D01', group: 'D', label: 'Marriage License Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'D02', group: 'D', label: 'Birth Records (Public Index)', sensitivityLevel: 'SENSITIVE', allowedUses: ['STORAGE'], minorRisk: true },
  { id: 'D03', group: 'D', label: 'Death Records (Public Index)', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'D04', group: 'D', label: 'New Business Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'D05', group: 'D', label: 'Professional License Issuance', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT'], minorRisk: false },
  { id: 'D06', group: 'D', label: 'Graduation Lists (Public)', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'MARKETING'], minorRisk: true },

  // Group E — Economic & Demographic Searches
  { id: 'E01', group: 'E', label: 'Census Tract Demographics', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'E02', group: 'E', label: 'Median Income by ZIP', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'E03', group: 'E', label: 'Home Value Index', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'E04', group: 'E', label: 'Wealth Band Classification', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'E05', group: 'E', label: 'Consumer Spending Patterns', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'E06', group: 'E', label: 'Population Density Mapping', sensitivityLevel: 'AGGREGATE', allowedUses: ['ENRICHMENT'], minorRisk: false },

  // Group F — Institutional Searches
  { id: 'F01', group: 'F', label: 'Church / Synagogue / Mosque Registry', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT'], minorRisk: false },
  { id: 'F02', group: 'F', label: 'University Alumni Directories', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'F03', group: 'F', label: 'Non-Profit IRS 990 Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT'], minorRisk: false },
  { id: 'F04', group: 'F', label: 'Hospital Charity Care Disclosures', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION'], minorRisk: false },
  { id: 'F05', group: 'F', label: 'Country Club & Private Membership', sensitivityLevel: 'SENSITIVE', allowedUses: ['ENRICHMENT'], minorRisk: false },

  // Group G — Commercial & Procurement Searches
  { id: 'G01', group: 'G', label: 'Vendor Registration Portals', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE'], minorRisk: false },
  { id: 'G02', group: 'G', label: 'Government Contract Awards', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT'], minorRisk: false },
  { id: 'G03', group: 'G', label: 'RFP / Bid Listings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION'], minorRisk: false },
  { id: 'G04', group: 'G', label: 'GSA Schedule Holders', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT'], minorRisk: false },
  { id: 'G05', group: 'G', label: 'SEC EDGAR Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'STORAGE', 'ENRICHMENT', 'EXPORT'], minorRisk: false },
  { id: 'G06', group: 'G', label: 'Patent & Trademark Filings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT'], minorRisk: false },

  // Group H — Media & Sentiment Searches
  { id: 'H01', group: 'H', label: 'Local News Mentions', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'H02', group: 'H', label: 'Obituary Monitoring', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION'], minorRisk: false },
  { id: 'H03', group: 'H', label: 'Engagement Announcement Scraping', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'], minorRisk: false },
  { id: 'H04', group: 'H', label: 'Community Event Listings', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'MARKETING'], minorRisk: false },
  { id: 'H05', group: 'H', label: 'Social Media Public Posts', sensitivityLevel: 'PII', allowedUses: ['ENRICHMENT'], minorRisk: true },
  { id: 'H06', group: 'H', label: 'Press Release Aggregation', sensitivityLevel: 'PUBLIC', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING', 'EXPORT'], minorRisk: false },
]

// ---------------------------------------------------------------------------
// Event Taxonomy — 13 categories
// ---------------------------------------------------------------------------

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 1,
    label: 'Religious & Cultural Ceremonies',
    events: [
      { id: 'E1-01', categoryId: 1, label: 'Bar/Bat Mitzvah', riskLevel: 'MODERATE', minorFlag: true, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E1-02', categoryId: 1, label: 'Confirmation', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E1-03', categoryId: 1, label: 'First Communion', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E1-04', categoryId: 1, label: 'Quinceañera', riskLevel: 'MODERATE', minorFlag: true, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E1-05', categoryId: 1, label: 'Baptism / Christening', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'BRONZE', allowedUses: ['ACQUISITION'] },
      { id: 'E1-06', categoryId: 1, label: 'Sweet 16', riskLevel: 'MODERATE', minorFlag: true, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
    ],
  },
  {
    id: 2,
    label: 'Wedding & Relationship Events',
    events: [
      { id: 'E2-01', categoryId: 2, label: 'Engagement', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E2-02', categoryId: 2, label: 'Wedding', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E2-03', categoryId: 2, label: 'Wedding Anniversary (milestone)', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E2-04', categoryId: 2, label: 'Vow Renewal', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E2-05', categoryId: 2, label: 'Bridal Shower', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E2-06', categoryId: 2, label: 'Bachelor/Bachelorette Party', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['MARKETING'] },
    ],
  },
  {
    id: 3,
    label: 'Birth & Family Events',
    events: [
      { id: 'E3-01', categoryId: 3, label: 'Birth of Child', riskLevel: 'MODERATE', minorFlag: true, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E3-02', categoryId: 3, label: 'Baby Shower', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'SILVER', allowedUses: ['MARKETING'] },
      { id: 'E3-03', categoryId: 3, label: 'Adoption', riskLevel: 'HIGH', minorFlag: true, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION'] },
      { id: 'E3-04', categoryId: 3, label: 'Gender Reveal', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'BRONZE', allowedUses: ['MARKETING'] },
      { id: 'E3-05', categoryId: 3, label: 'Birthday (milestone)', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
    ],
  },
  {
    id: 4,
    label: 'Education & Academic Milestones',
    events: [
      { id: 'E4-01', categoryId: 4, label: 'High School Graduation', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E4-02', categoryId: 4, label: 'College Graduation', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E4-03', categoryId: 4, label: 'Graduate Degree Completion', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E4-04', categoryId: 4, label: 'Professional Certification', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
      { id: 'E4-05', categoryId: 4, label: 'Scholarship Award', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'BRONZE', allowedUses: ['ACQUISITION'] },
    ],
  },
  {
    id: 5,
    label: 'Age-Based Milestones',
    events: [
      { id: 'E5-01', categoryId: 5, label: 'Turning 18', riskLevel: 'LOW', minorFlag: true, luxuryTier: 'BRONZE', allowedUses: ['ACQUISITION'] },
      { id: 'E5-02', categoryId: 5, label: 'Turning 21', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E5-03', categoryId: 5, label: 'Turning 30 / 40 / 50', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E5-04', categoryId: 5, label: 'Retirement (65+)', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
    ],
  },
  {
    id: 6,
    label: 'Property & Financial Milestones',
    events: [
      { id: 'E6-01', categoryId: 6, label: 'Home Purchase', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E6-02', categoryId: 6, label: 'Home Sale', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
      { id: 'E6-03', categoryId: 6, label: 'Mortgage Payoff', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ENRICHMENT'] },
    ],
  },
  {
    id: 7,
    label: 'Business & Professional Events',
    events: [
      { id: 'E7-01', categoryId: 7, label: 'New Business Filing', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E7-02', categoryId: 7, label: 'Professional License Issuance', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
      { id: 'E7-03', categoryId: 7, label: 'Promotion / Title Change', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ENRICHMENT'] },
    ],
  },
  {
    id: 8,
    label: 'Community & Social Events',
    events: [
      { id: 'E8-01', categoryId: 8, label: 'Charity Gala Attendance', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
      { id: 'E8-02', categoryId: 8, label: 'Award / Honor Received', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'MARKETING'] },
      { id: 'E8-03', categoryId: 8, label: 'Community Board Appointment', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ACQUISITION'] },
    ],
  },
  {
    id: 9,
    label: 'Legal & Court Events',
    events: [
      { id: 'E9-01', categoryId: 9, label: 'Probate Filing', riskLevel: 'MODERATE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
      { id: 'E9-02', categoryId: 9, label: 'Name Change', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'NONE', allowedUses: ['STORAGE'] },
    ],
  },
  {
    id: 10,
    label: 'Health & Life Status Events',
    events: [
      { id: 'E10-01', categoryId: 10, label: 'Death (Obituary)', riskLevel: 'MODERATE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION'] },
      { id: 'E10-02', categoryId: 10, label: 'Estate Settlement', riskLevel: 'MODERATE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
    ],
  },
  {
    id: 11,
    label: 'Government & Civic Events',
    events: [
      { id: 'E11-01', categoryId: 11, label: 'Voter Registration', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'NONE', allowedUses: ['ENRICHMENT'] },
      { id: 'E11-02', categoryId: 11, label: 'Political Donation Filing', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT'] },
      { id: 'E11-03', categoryId: 11, label: 'Government Appointment', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION'] },
    ],
  },
  {
    id: 12,
    label: 'Commercial & Consumer Signals',
    events: [
      { id: 'E12-01', categoryId: 12, label: 'Luxury Vehicle Registration', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ENRICHMENT', 'MARKETING'] },
      { id: 'E12-02', categoryId: 12, label: 'Yacht / Boat Registration', riskLevel: 'LOW', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ENRICHMENT', 'MARKETING'] },
      { id: 'E12-03', categoryId: 12, label: 'Luxury Real Estate Listing', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'PLATINUM', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
    ],
  },
  {
    id: 13,
    label: 'Digital & Social Signals',
    events: [
      { id: 'E13-01', categoryId: 13, label: 'Social Media Engagement Spike', riskLevel: 'MODERATE', minorFlag: false, luxuryTier: 'SILVER', allowedUses: ['ENRICHMENT'] },
      { id: 'E13-02', categoryId: 13, label: 'Published Interview / Feature', riskLevel: 'NONE', minorFlag: false, luxuryTier: 'GOLD', allowedUses: ['ACQUISITION', 'ENRICHMENT', 'MARKETING'] },
    ],
  },
]

// ---------------------------------------------------------------------------
// Governance check
// ---------------------------------------------------------------------------

export function checkGovernance(
  selectedSearchTypes: SearchType[],
  selectedEvents: LifeEvent[],
  intendedUses: IntendedUse[],
): GovernanceCheck {
  const blockedItems: string[] = []
  const warnings: string[] = []
  let minorRiskDetected = false
  let criticalRiskDetected = false

  for (const st of selectedSearchTypes) {
    if (st.minorRisk) {
      minorRiskDetected = true
      warnings.push(`Search type "${st.label}" involves minor data`)
    }
    if (st.sensitivityLevel === 'SENSITIVE' || st.sensitivityLevel === 'PII') {
      for (const use of intendedUses) {
        if (!st.allowedUses.includes(use)) {
          blockedItems.push(`"${st.label}" cannot be used for ${use}`)
        }
      }
    }
  }

  for (const ev of selectedEvents) {
    if (ev.minorFlag) {
      minorRiskDetected = true
      warnings.push(`Event "${ev.label}" involves minor data`)
    }
    if (ev.riskLevel === 'HIGH' || ev.riskLevel === 'CRITICAL') {
      criticalRiskDetected = true
      blockedItems.push(`Event "${ev.label}" requires elevated review (${ev.riskLevel})`)
    }
    for (const use of intendedUses) {
      if (!ev.allowedUses.includes(use)) {
        blockedItems.push(`Event "${ev.label}" does not permit ${use}`)
      }
    }
  }

  const status = blockedItems.length > 0 ? 'BLOCKED' : (warnings.length > 0 ? 'REVIEW' : 'PASS')

  return { status, blockedItems, warnings, minorRiskDetected, criticalRiskDetected }
}

// ---------------------------------------------------------------------------
// Schedule data
// ---------------------------------------------------------------------------

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
]

export const TIME_SLOTS: string[] = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
]

// ---------------------------------------------------------------------------
// Enrichment estimate
// ---------------------------------------------------------------------------

export function getEnrichmentEstimate(
  recordCount: number,
  selectedEvents: LifeEvent[],
): EnrichmentEstimate {
  const matchRate = 0.72

  const ageDistribution = [
    { bracket: '18-24', count: Math.round(recordCount * 0.08), pct: 8 },
    { bracket: '25-34', count: Math.round(recordCount * 0.18), pct: 18 },
    { bracket: '35-44', count: Math.round(recordCount * 0.22), pct: 22 },
    { bracket: '45-54', count: Math.round(recordCount * 0.20), pct: 20 },
    { bracket: '55-64', count: Math.round(recordCount * 0.17), pct: 17 },
    { bracket: '65+', count: Math.round(recordCount * 0.15), pct: 15 },
  ]

  const incomeDistribution = [
    { bracket: '<$50K', count: Math.round(recordCount * 0.12), pct: 12 },
    { bracket: '$50-100K', count: Math.round(recordCount * 0.25), pct: 25 },
    { bracket: '$100-250K', count: Math.round(recordCount * 0.30), pct: 30 },
    { bracket: '$250-500K', count: Math.round(recordCount * 0.20), pct: 20 },
    { bracket: '$500K+', count: Math.round(recordCount * 0.13), pct: 13 },
  ]

  const eventForecast = selectedEvents.map((ev) => ({
    event: ev.label,
    count: Math.round(recordCount * (Math.random() * 0.05 + 0.01)),
    withinDays: 90,
  }))

  return {
    totalRecords: recordCount,
    matchRate,
    ageDistribution,
    incomeDistribution,
    homeOwnershipRate: 0.64,
    eventForecast,
  }
}

// ---------------------------------------------------------------------------
// Cost estimate (simplified — uses MODERATE default risk)
// ---------------------------------------------------------------------------

export function getCostEstimate(recordCount: number): CostEstimate {
  const perRecordCost = 0.023
  const apiCostPerCall = 0.0015
  const apiCalls = Math.ceil(recordCount / 50)
  const enrichmentCost = recordCount * 0.008
  const storageCost = recordCount * 0.0002
  const totalEstimatedCost =
    recordCount * perRecordCost + apiCalls * apiCostPerCall + enrichmentCost + storageCost

  let tier: CostEstimate['tier'] = 'LOW'
  if (totalEstimatedCost > 500) tier = 'PREMIUM'
  else if (totalEstimatedCost > 200) tier = 'HIGH'
  else if (totalEstimatedCost > 50) tier = 'MEDIUM'

  const aiNotes: string[] = []
  if (recordCount > 10000) aiNotes.push('High volume — consider incremental mode for cost savings.')
  if (tier === 'PREMIUM') aiNotes.push('Premium cost tier — governance review recommended.')

  return {
    perRecordCost,
    estimatedRecords: recordCount,
    apiCalls,
    apiCostPerCall,
    enrichmentCost: Math.round(enrichmentCost * 100) / 100,
    storageCost: Math.round(storageCost * 100) / 100,
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
    currency: 'USD',
    tier,
    aiNotes,
  }
}
