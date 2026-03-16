// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  DollarSign,
  Filter,
  Globe,
  Loader2,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import {
  SEARCH_TYPES,
  EVENT_CATEGORIES,
  checkGovernance,
  getEnrichmentEstimate,
  getCostEstimate,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '@/lib/scraper-data'
import { SEARCH_GROUP_LABELS } from '@/lib/types/scraper'
import type {
  SearchType,
  SearchGroup,
  LifeEvent,
  IntendedUse,
  GovernanceCheck,
  EnrichmentEstimate,
  CostEstimate,
  DayOfWeek,
  Jurisdiction,
} from '@/lib/types/scraper'
import { getStates, getCounties, getCitiesByState } from '@/lib/api/scraper-geo'
import { getEstimate, submitIntent } from '@/lib/api/scraper'
import { useWizardStore } from '@/lib/stores/scraper-wizard-store'
import { AIOptimizationPanel } from '@/components/scraper/AIOptimizationPanel'

const OPERATOR_EMAIL = 'operator@mountainjewels.com'

const INTENDED_USES: { value: IntendedUse; label: string; description: string }[] = [
  { value: 'ACQUISITION', label: 'Acquisition', description: 'Identify new prospects' },
  { value: 'STORAGE', label: 'Storage', description: 'Persist data long-term' },
  { value: 'ENRICHMENT', label: 'Enrichment', description: 'Enhance existing records' },
  { value: 'MARKETING', label: 'Marketing', description: 'Outreach & campaigns' },
  { value: 'EXPORT', label: 'Export', description: 'Share with third parties' },
]

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  step,
  icon: Icon,
  children,
  collapsible = true,
}: {
  title: string
  step: number
  icon: React.ElementType
  children: React.ReactNode
  collapsible?: boolean
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24]">
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">
            {step}
          </span>
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {collapsible && (open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />)}
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Run Builder page
// ---------------------------------------------------------------------------

export default function RunBuilderPage() {
  const store = useWizardStore()

  // Search types
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedSearchTypes, setSelectedSearchTypes] = useState<SearchType[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<SearchGroup>>(new Set())

  // Events
  const [selectedEvents, setSelectedEvents] = useState<LifeEvent[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // Jurisdiction
  const [selectedState, setSelectedState] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])

  // Run config
  const [lookbackDays, setLookbackDays] = useState(30)
  const [mode, setMode] = useState<'incremental' | 'full'>('incremental')
  const [scheduleDays, setScheduleDays] = useState<DayOfWeek[]>([])
  const [scheduleTime, setScheduleTime] = useState('06:00')
  const [recordEstimate, setRecordEstimate] = useState(5000)

  // Intended use
  const [intendedUses, setIntendedUses] = useState<IntendedUse[]>([])
  const [intentStatement, setIntentStatement] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  // Derived state
  const governance = useMemo(
    () => checkGovernance(selectedSearchTypes, selectedEvents, intendedUses),
    [selectedSearchTypes, selectedEvents, intendedUses],
  )
  const enrichment = useMemo(
    () => getEnrichmentEstimate(recordEstimate, selectedEvents),
    [recordEstimate, selectedEvents],
  )
  const cost = useMemo(
    () => getCostEstimate(recordEstimate),
    [recordEstimate],
  )

  // Geo queries
  const statesQ = useQuery({ queryKey: ['geo-states'], queryFn: getStates })
  const countiesQ = useQuery({
    queryKey: ['geo-counties', selectedState],
    queryFn: () => getCounties(selectedState),
    enabled: selectedState !== '',
  })
  const citiesQ = useQuery({
    queryKey: ['geo-cities', selectedState],
    queryFn: () => getCitiesByState(selectedState),
    enabled: selectedState !== '',
  })

  // Estimate
  const estimateM = useMutation({
    mutationFn: () =>
      getEstimate({
        category: selectedSearchTypes[0]?.group ?? 'A',
        jurisdiction: jurisdictions,
        filters: {},
        date_range: { lookback_days: lookbackDays },
        mode,
        operator_id: OPERATOR_EMAIL,
        intent_statement: intentStatement,
        acknowledged,
        timestamp: new Date().toISOString(),
      }),
  })

  // Submit
  const submitM = useMutation({
    mutationFn: () =>
      submitIntent({
        category: selectedSearchTypes[0]?.group ?? 'A',
        jurisdiction: jurisdictions,
        filters: {},
        date_range: { lookback_days: lookbackDays },
        mode,
        operator_id: OPERATOR_EMAIL,
        intent_statement: intentStatement,
        acknowledged,
        timestamp: new Date().toISOString(),
      }),
  })

  // Grouped search types
  const groupedSearch = useMemo(() => {
    const groups = new Map<SearchGroup, SearchType[]>()
    const q = searchFilter.toLowerCase()
    for (const st of SEARCH_TYPES) {
      if (q && !st.label.toLowerCase().includes(q) && !st.id.toLowerCase().includes(q)) continue
      if (!groups.has(st.group)) groups.set(st.group, [])
      groups.get(st.group)!.push(st)
    }
    return groups
  }, [searchFilter])

  const toggleSearchType = useCallback((st: SearchType) => {
    setSelectedSearchTypes((prev) =>
      prev.find((s) => s.id === st.id) ? prev.filter((s) => s.id !== st.id) : [...prev, st],
    )
  }, [])

  const toggleEvent = useCallback((ev: LifeEvent) => {
    setSelectedEvents((prev) =>
      prev.find((e) => e.id === ev.id) ? prev.filter((e) => e.id !== ev.id) : [...prev, ev],
    )
  }, [])

  const toggleUse = useCallback((use: IntendedUse) => {
    setIntendedUses((prev) =>
      prev.includes(use) ? prev.filter((u) => u !== use) : [...prev, use],
    )
  }, [])

  const addJurisdiction = useCallback(() => {
    if (!selectedState) return
    const j: Jurisdiction = { state: selectedState }
    if (selectedCounty) j.county_fips = selectedCounty
    if (selectedCity) j.city = selectedCity
    setJurisdictions((prev) => [...prev, j])
    setSelectedState('')
    setSelectedCounty('')
    setSelectedCity('')
  }, [selectedState, selectedCounty, selectedCity])

  const toggleGroup = useCallback((g: SearchGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }, [])

  const toggleCategory = useCallback((id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const canSubmit =
    selectedSearchTypes.length > 0 &&
    jurisdictions.length > 0 &&
    intendedUses.length > 0 &&
    intentStatement.trim() !== '' &&
    acknowledged &&
    governance.status !== 'BLOCKED'

  const buildIntent = () => ({
    category: selectedSearchTypes[0]?.group ?? 'A',
    jurisdiction: jurisdictions,
    filters: {},
    date_range: { lookback_days: lookbackDays },
    mode,
    operator_id: OPERATOR_EMAIL,
    intent_statement: intentStatement,
    acknowledged,
    timestamp: new Date().toISOString(),
  })

  const sensitivityBadge = (level: string) => {
    const colors: Record<string, string> = {
      PII: 'bg-red-500/20 text-red-400',
      SENSITIVE: 'bg-amber-500/20 text-amber-400',
      PUBLIC: 'bg-emerald-500/20 text-emerald-400',
      AGGREGATE: 'bg-blue-500/20 text-blue-400',
    }
    return colors[level] ?? 'bg-gray-500/20 text-gray-400'
  }

  const riskBadge = (level: string) => {
    const colors: Record<string, string> = {
      NONE: 'bg-emerald-500/20 text-emerald-400',
      LOW: 'bg-blue-500/20 text-blue-400',
      MODERATE: 'bg-amber-500/20 text-amber-400',
      HIGH: 'bg-red-500/20 text-red-400',
      CRITICAL: 'bg-red-700/30 text-red-300',
    }
    return colors[level] ?? 'bg-gray-500/20 text-gray-400'
  }

  const luxuryBadge = (tier: string) => {
    const colors: Record<string, string> = {
      PLATINUM: 'bg-purple-500/20 text-purple-400',
      GOLD: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      SILVER: 'bg-gray-400/20 text-gray-300',
      BRONZE: 'bg-orange-500/20 text-orange-400',
      NONE: 'bg-gray-600/20 text-gray-500',
    }
    return colors[tier] ?? 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold text-white">Run Builder</h1>
        <span className="text-xs text-gray-400 font-mono">{OPERATOR_EMAIL}</span>
      </div>

      {/* Step 1 — Search Types */}
      <Section title="Search Types" step={1} icon={Search}>
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter search types…"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] pl-10 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {selectedSearchTypes.length} of {SEARCH_TYPES.length} selected
          </p>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {Array.from(groupedSearch.entries()).map(([group, types]) => (
            <div key={group}>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-2 w-full text-left py-1.5"
              >
                {expandedGroups.has(group) ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className="text-xs font-semibold text-[#D4AF37]">
                  Group {group}
                </span>
                <span className="text-xs text-gray-400">— {SEARCH_GROUP_LABELS[group]}</span>
                <span className="ml-auto text-[10px] text-gray-500">{types.length}</span>
              </button>
              {expandedGroups.has(group) && (
                <div className="ml-5 space-y-1 mb-2">
                  {types.map((st) => {
                    const selected = selectedSearchTypes.some((s) => s.id === st.id)
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleSearchType(st)}
                        className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-left transition-colors ${
                          selected ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' : 'border border-transparent hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#2A2A35]'
                        }`}>
                          {selected && <Check className="h-3 w-3 text-black" />}
                        </div>
                        <span className="text-xs font-mono text-gray-400 w-8">{st.id}</span>
                        <span className="text-sm text-white flex-1">{st.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sensitivityBadge(st.sensitivityLevel)}`}>
                          {st.sensitivityLevel}
                        </span>
                        {st.minorRisk && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-500/20 text-red-400">
                            MINOR
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Step 2 — Event Filter */}
      <Section title="Event Filter" step={2} icon={Filter}>
        <p className="text-xs text-gray-400 mb-3">
          {selectedEvents.length} event(s) selected across {EVENT_CATEGORIES.length} categories
        </p>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {EVENT_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center gap-2 w-full text-left py-1.5"
              >
                {expandedCategories.has(cat.id) ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className="text-xs font-semibold text-white">{cat.label}</span>
                <span className="ml-auto text-[10px] text-gray-500">{cat.events.length}</span>
              </button>
              {expandedCategories.has(cat.id) && (
                <div className="ml-5 space-y-1 mb-2">
                  {cat.events.map((ev) => {
                    const selected = selectedEvents.some((e) => e.id === ev.id)
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => toggleEvent(ev)}
                        className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-left transition-colors ${
                          selected ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' : 'border border-transparent hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#2A2A35]'
                        }`}>
                          {selected && <Check className="h-3 w-3 text-black" />}
                        </div>
                        <span className="text-sm text-white flex-1">{ev.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${riskBadge(ev.riskLevel)}`}>
                          {ev.riskLevel}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${luxuryBadge(ev.luxuryTier)}`}>
                          {ev.luxuryTier}
                        </span>
                        {ev.minorFlag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-500/20 text-red-400">
                            MINOR
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Step 3 — Jurisdiction */}
      <Section title="Jurisdiction" step={3} icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">State</label>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setSelectedCounty(''); setSelectedCity('') }}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            >
              <option value="">Select…</option>
              {(statesQ.data ?? []).map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">County</label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              disabled={!selectedState}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50 disabled:opacity-40"
            >
              <option value="">All counties</option>
              {(countiesQ.data ?? []).map((c) => (
                <option key={c.fips} value={c.fips}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50 disabled:opacity-40"
            >
              <option value="">All cities</option>
              {(citiesQ.data ?? []).map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={addJurisdiction}
          disabled={!selectedState}
          className="rounded-md bg-[#D4AF37]/20 px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          + Add Jurisdiction
        </button>
        {jurisdictions.length > 0 && (
          <div className="mt-3 space-y-1">
            {jurisdictions.map((j, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md bg-[#111118] border border-[#2A2A35] px-3 py-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-white flex-1">
                  {j.state}{j.county_fips ? ` › ${j.county_fips}` : ''}{j.city ? ` › ${j.city}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setJurisdictions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Step 4 — Run Config */}
      <Section title="Run Configuration" step={4} icon={Clock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Lookback (days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={lookbackDays}
              onChange={(e) => setLookbackDays(Number(e.target.value))}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Mode</label>
            <div className="flex gap-2">
              {(['incremental', 'full'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'bg-[#111118] text-gray-400 border border-[#2A2A35] hover:text-white'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Record Estimate</label>
            <input
              type="number"
              min={100}
              step={500}
              value={recordEstimate}
              onChange={(e) => setRecordEstimate(Number(e.target.value))}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Schedule Time</label>
            <select
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-white/70 mb-1.5">Schedule Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const active = scheduleDays.includes(d.value)
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    setScheduleDays((prev) =>
                      active ? prev.filter((v) => v !== d.value) : [...prev, d.value],
                    )
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'bg-[#111118] text-gray-400 border border-[#2A2A35] hover:text-white'
                  }`}
                >
                  {d.label.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Step 5 — Intended Use */}
      <Section title="Intended Use & Statement" step={5} icon={Shield}>
        <div className="flex flex-wrap gap-2 mb-4">
          {INTENDED_USES.map((u) => {
            const active = intendedUses.includes(u.value)
            return (
              <button
                key={u.value}
                type="button"
                onClick={() => toggleUse(u.value)}
                className={`rounded-md px-3 py-2 text-left transition-colors ${
                  active
                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                    : 'bg-[#111118] border border-[#2A2A35] hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-xs font-medium ${active ? 'text-[#D4AF37]' : 'text-white'}`}>
                  {u.label}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">{u.description}</p>
              </button>
            )
          })}
        </div>
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">Intent Statement</label>
          <textarea
            rows={3}
            value={intentStatement}
            onChange={(e) => setIntentStatement(e.target.value)}
            placeholder="Describe the business purpose for this scrape run…"
            className="w-full rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50 resize-none"
          />
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <div
            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
              acknowledged ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#2A2A35]'
            }`}
            onClick={() => setAcknowledged(!acknowledged)}
          >
            {acknowledged && <Check className="h-3 w-3 text-black" />}
          </div>
          <span className="text-xs text-gray-400" onClick={() => setAcknowledged(!acknowledged)}>
            I confirm this data acquisition complies with Mountain Jewels governance policies.
          </span>
        </label>
      </Section>

      {/* Step 6 — Summary */}
      <Section title="Summary & Estimates" step={6} icon={Zap}>
        {/* Governance */}
        <div className={`rounded-md border p-4 mb-4 ${
          governance.status === 'PASS' ? 'border-emerald-400/30 bg-emerald-400/5'
            : governance.status === 'REVIEW' ? 'border-amber-400/30 bg-amber-400/5'
              : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {governance.status === 'PASS' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : governance.status === 'REVIEW' ? (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${
              governance.status === 'PASS' ? 'text-emerald-400'
                : governance.status === 'REVIEW' ? 'text-amber-400'
                  : 'text-red-400'
            }`}>
              Governance: {governance.status}
            </span>
          </div>
          {governance.blockedItems.length > 0 && (
            <ul className="text-xs text-red-400 space-y-1 mt-2">
              {governance.blockedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {governance.warnings.length > 0 && (
            <ul className="text-xs text-amber-400 space-y-1 mt-2">
              {governance.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Enrichment Estimate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-md border border-[#2A2A35] bg-[#111118] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-white">Enrichment Estimate</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total records</span>
                <span className="text-white font-medium">{enrichment.totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Match rate</span>
                <span className="text-white font-medium">{(enrichment.matchRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Home ownership</span>
                <span className="text-white font-medium">{(enrichment.homeOwnershipRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="rounded-md border border-[#2A2A35] bg-[#111118] p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-white">Cost Estimate</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total estimated</span>
                <span className="text-white font-bold text-base">${cost.totalEstimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Per record</span>
                <span className="text-white font-medium">${cost.perRecordCost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tier</span>
                <span className={`font-medium ${
                  cost.tier === 'PREMIUM' ? 'text-red-400'
                    : cost.tier === 'HIGH' ? 'text-amber-400'
                      : cost.tier === 'MEDIUM' ? 'text-[#D4AF37]'
                        : 'text-emerald-400'
                }`}>
                  {cost.tier}
                </span>
              </div>
            </div>
            {cost.aiNotes.length > 0 && (
              <div className="mt-3 space-y-1">
                {cost.aiNotes.map((note, i) => (
                  <p key={i} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                    <Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-[#D4AF37]" />
                    {note}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected summary */}
        <div className="rounded-md border border-[#2A2A35] bg-[#111118] p-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-400">Search types</span>
            <span className="text-white">{selectedSearchTypes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Events</span>
            <span className="text-white">{selectedEvents.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Jurisdictions</span>
            <span className="text-white">{jurisdictions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Intended uses</span>
            <span className="text-white">{intendedUses.join(', ') || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mode</span>
            <span className="text-white">{mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lookback</span>
            <span className="text-white">{lookbackDays} days</span>
          </div>
        </div>
      </Section>

      {/* Step 7 — AI Optimization */}
      <Section title="AI Optimization" step={7} icon={Sparkles}>
        <AIOptimizationPanel
          intent={canSubmit ? buildIntent() : null}
          onEmit={() => submitM.mutate()}
        />
      </Section>

      {/* Step 8 — Submit */}
      <Section title="Submit" step={8} icon={Zap} collapsible={false}>
        {submitM.isSuccess && (
          <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Intent submitted successfully.</span>
          </div>
        )}
        {submitM.isError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 mb-4 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">{(submitM.error as Error).message}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => estimateM.mutate()}
            disabled={!canSubmit || estimateM.isPending}
            className="flex items-center gap-2 rounded-md bg-white/5 border border-[#2A2A35] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {estimateM.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Get Estimate
          </button>
          <button
            type="button"
            onClick={() => submitM.mutate()}
            disabled={!canSubmit || submitM.isPending}
            className="flex items-center gap-2 rounded-md bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#D4AF37]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitM.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Intent
          </button>
        </div>
        {estimateM.data && (
          <div className="mt-4 rounded-md border border-[#2A2A35] bg-[#111118] p-4 text-xs space-y-1.5">
            <p className="text-white font-semibold text-sm mb-2">Server Estimate</p>
            <div className="flex justify-between"><span className="text-gray-400">Portals</span><span className="text-white">{estimateM.data.estimated_portals}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Pages</span><span className="text-white">{estimateM.data.estimated_pages.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Signals</span><span className="text-white">{estimateM.data.estimated_signals.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{Math.round(estimateM.data.estimated_duration_seconds / 60)}m</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cost</span><span className="text-white font-medium">${estimateM.data.estimated_cost_usd.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Legal risk</span><span className={`font-medium ${estimateM.data.legal_risk === 'HIGH' ? 'text-red-400' : estimateM.data.legal_risk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>{estimateM.data.legal_risk}</span></div>
            {estimateM.data.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {estimateM.data.warnings.map((w, i) => (
                  <p key={i} className="text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  )
}
