'use client'

import { useState } from 'react'
import { useIntelligenceStore } from '@/lib/stores/intelligence-store'
import { US_STATES, SAMPLE_COUNTIES } from '@/lib/data/us-states'
import type { RunEstimate, ScraperRun } from '@/lib/types/intelligence'

const STEPS = [
  { num: 1, label: 'Source Category' },
  { num: 2, label: 'Jurisdiction' },
  { num: 3, label: 'Filters' },
  { num: 4, label: 'Time Range' },
  { num: 5, label: 'Intent Statement' },
  { num: 6, label: 'Review & Submit' },
]

const CATEGORY_ICONS: Record<string, string> = {
  PUBLIC_RECORDS: '🏛️', COURTS: '⚖️', GOVERNMENT_FILINGS: '📄',
  EDUCATIONAL_INSTITUTIONS: '🎓', RELIGIOUS_INSTITUTIONS: '⛪', NEWS_MEDIA: '📰',
  SOCIAL_MEDIA: '📱', BUSINESS_REGISTRIES: '🏢', REAL_ESTATE_LISTINGS: '🏠',
  NON_PROFIT_DISCLOSURES: '💝',
}

export default function RunBuilderPage() {
  const { sourceMatrix, runDraft, setRunDraft, resetRunDraft, runEstimate, setRunEstimate, addRun } = useIntelligenceStore()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const allowedCategories = sourceMatrix.categories.filter((c) => c.status === 'allowed')
  const selectedCategory = sourceMatrix.categories.find((c) => c.id === runDraft.category_id)
  const counties = runDraft.jurisdiction?.state ? (SAMPLE_COUNTIES[runDraft.jurisdiction.state] || []) : []

  const canProceed = () => {
    switch (step) {
      case 1: return !!runDraft.category_id
      case 2: return !!runDraft.jurisdiction?.state
      case 3: return true
      case 4: return !!runDraft.lookback_days
      case 5: return !!runDraft.intent_statement && runDraft.intent_statement.length >= 10
      case 6: return !!runEstimate
      default: return false
    }
  }

  const handleNext = () => {
    if (step === 4) {
      // Auto-generate mock estimate at step 4→5 transition
    }
    if (step === 5) {
      // Generate preview estimate
      const mockEstimate: RunEstimate = {
        estimated_portals: Math.floor(Math.random() * 30) + 5,
        estimated_pages: Math.floor(Math.random() * 2000) + 200,
        estimated_signals: Math.floor(Math.random() * 1000) + 50,
        estimated_duration_seconds: Math.floor(Math.random() * 3600) + 300,
        estimated_cost_usd: 0.00,
        legal_risk: 'LOW',
        governance_version: sourceMatrix.version,
        warnings: [],
      }
      setRunEstimate(mockEstimate)
    }
    setStep(step + 1)
  }

  const handleSubmit = () => {
    const run: ScraperRun = {
      id: `run-${Date.now()}`,
      category_id: runDraft.category_id!,
      jurisdiction: runDraft.jurisdiction!,
      filters: runDraft.filters || {},
      lookback_days: runDraft.lookback_days!,
      intent_statement: runDraft.intent_statement!,
      operator_id: 'colin',
      status: 'queued',
      portals_found: runEstimate?.estimated_portals || 0,
      pages_scraped: 0,
      signals_detected: 0,
      errors: 0,
      cost_usd: 0.00,
      started_at: new Date().toISOString(),
    }
    addRun(run)
    setSubmitted(true)
  }

  const handleReset = () => {
    resetRunDraft()
    setStep(1)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-3xl mb-3">✅</p>
          <h2 className="text-xl font-bold text-white mb-2">Intent Submitted</h2>
          <p className="text-gray-400 mb-4">Your scrape intent has been recorded. The engine will begin shortly.</p>
          <div className="flex gap-3 justify-center">
            <a href="/intelligence/history" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium">
              View History
            </a>
            <button onClick={handleReset} className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-sm font-medium">
              New Run
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Run Builder</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s) => (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
              s.num < step ? 'bg-green-600 text-white' :
              s.num === step ? 'bg-[#D4AF37] text-black' :
              'bg-gray-800 text-gray-500'
            }`}>
              {s.num < step ? '✓' : s.num}
            </div>
            <span className={`text-xs ${s.num === step ? 'text-white' : 'text-gray-600'}`}>{s.label}</span>
            {s.num < STEPS.length && <div className={`flex-1 h-px mx-2 ${s.num < step ? 'bg-green-600' : 'bg-gray-800'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[300px]">

        {/* Step 1: Source Category */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Select Source Category</h2>
            <p className="text-sm text-gray-500 mb-4">Only governance-allowed categories are shown</p>
            <div className="grid grid-cols-3 gap-3">
              {allowedCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRunDraft({ category_id: cat.id })}
                  className={`text-left p-4 border rounded-lg transition-colors ${
                    runDraft.category_id === cat.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{CATEGORY_ICONS[cat.id] || '📋'}</span>
                  <h3 className="font-medium text-white text-sm mt-2">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Jurisdiction */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Select Jurisdiction</h2>
            <p className="text-sm text-gray-500 mb-4">Geographic scoping — the engine resolves actual portals</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">State</label>
                <select
                  value={runDraft.jurisdiction?.state || ''}
                  onChange={(e) => setRunDraft({ jurisdiction: { state: e.target.value } })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Select state...</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">County (optional)</label>
                <select
                  value={runDraft.jurisdiction?.county_fips || ''}
                  onChange={(e) => setRunDraft({ jurisdiction: { ...runDraft.jurisdiction!, county_fips: e.target.value || undefined } })}
                  disabled={counties.length === 0}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white disabled:opacity-40"
                >
                  <option value="">All counties</option>
                  {counties.map((c) => (
                    <option key={c.fips} value={c.fips}>{c.name} ({c.fips})</option>
                  ))}
                </select>
              </div>
            </div>
            {counties.length === 0 && runDraft.jurisdiction?.state && (
              <p className="text-xs text-gray-600 mt-2">County data for {runDraft.jurisdiction.state} will come from geo API in Phase 7. State-level run will proceed.</p>
            )}
          </div>
        )}

        {/* Step 3: Filters */}
        {step === 3 && selectedCategory && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Domain Filters</h2>
            <p className="text-sm text-gray-500 mb-4">Parameters for {selectedCategory.name} — only allowed filters shown</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedCategory.parameters)
                .filter(([, status]) => status === 'allowed')
                .map(([param]) => (
                  <div key={param}>
                    <label className="block text-xs text-gray-400 mb-1 capitalize">{param.replace(/_/g, ' ')}</label>
                    <input
                      type="text"
                      placeholder={`Filter by ${param.replace(/_/g, ' ')}...`}
                      value={(runDraft.filters as Record<string, string>)?.[param] || ''}
                      onChange={(e) => setRunDraft({ filters: { ...runDraft.filters, [param]: e.target.value } })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    />
                  </div>
                ))}
              {Object.entries(selectedCategory.parameters)
                .filter(([, status]) => status === 'disabled')
                .map(([param]) => (
                  <div key={param} className="opacity-40">
                    <label className="block text-xs text-gray-400 mb-1 capitalize">{param.replace(/_/g, ' ')} (disabled)</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Disabled by governance"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white cursor-not-allowed"
                    />
                  </div>
                ))}
            </div>
            {Object.entries(selectedCategory.parameters).filter(([, s]) => s === 'forbidden').length > 0 && (
              <p className="text-xs text-gray-600 mt-4">
                {Object.entries(selectedCategory.parameters).filter(([, s]) => s === 'forbidden').length} forbidden parameter(s) hidden by governance policy
              </p>
            )}
          </div>
        )}

        {/* Step 4: Time Range */}
        {step === 4 && selectedCategory && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Time Range</h2>
            <p className="text-sm text-gray-500 mb-4">Max lookback for {selectedCategory.name}: {selectedCategory.max_lookback_days} days</p>
            <div className="w-64">
              <label className="block text-xs text-gray-400 mb-1">Lookback (days)</label>
              <input
                type="number"
                value={runDraft.lookback_days || 30}
                onChange={(e) => {
                  const v = Math.min(parseInt(e.target.value) || 1, selectedCategory.max_lookback_days)
                  setRunDraft({ lookback_days: v })
                }}
                min={1}
                max={selectedCategory.max_lookback_days}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
              />
              <p className="text-xs text-gray-600 mt-1">Governance enforces max {selectedCategory.max_lookback_days} days</p>
            </div>
            <div className="mt-4 w-64">
              <label className="block text-xs text-gray-400 mb-1">Mode</label>
              <select
                value={runDraft.mode || 'incremental'}
                onChange={(e) => setRunDraft({ mode: e.target.value as 'full' | 'incremental' })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
              >
                <option value="incremental">Incremental (new records only)</option>
                <option value="full">Full (all records in range)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Intent Statement */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Human Intent Statement</h2>
            <p className="text-sm text-gray-500 mb-4">Required. Explain why you are running this scrape. Logged immutably.</p>
            <textarea
              value={runDraft.intent_statement || ''}
              onChange={(e) => setRunDraft({ intent_statement: e.target.value })}
              rows={4}
              placeholder="Why are you running this scrape? Be specific about the business purpose..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none"
            />
            <p className={`text-xs mt-1 ${(runDraft.intent_statement?.length || 0) >= 10 ? 'text-gray-500' : 'text-red-400'}`}>
              {runDraft.intent_statement?.length || 0} characters (minimum 10)
            </p>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {step === 6 && selectedCategory && runEstimate && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Review & Submit</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Configuration */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400">Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="text-white">{selectedCategory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">State</span>
                    <span className="text-white">{runDraft.jurisdiction?.state}</span>
                  </div>
                  {runDraft.jurisdiction?.county_fips && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">County FIPS</span>
                      <span className="text-white">{runDraft.jurisdiction.county_fips}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lookback</span>
                    <span className="text-white">{runDraft.lookback_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode</span>
                    <span className="text-white capitalize">{runDraft.mode || 'incremental'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">Intent Statement</h4>
                  <p className="text-sm text-gray-300 italic">&ldquo;{runDraft.intent_statement}&rdquo;</p>
                </div>
              </div>

              {/* Right: Server Estimate */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400">Server Estimate</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Portals</span>
                    <span className="text-white">~{runEstimate.estimated_portals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pages</span>
                    <span className="text-white">~{runEstimate.estimated_pages.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signals</span>
                    <span className="text-[#D4AF37] font-medium">~{runEstimate.estimated_signals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-white">~{Math.ceil(runEstimate.estimated_duration_seconds / 60)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost</span>
                    <span className="text-white">${runEstimate.estimated_cost_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Legal Risk</span>
                    <span className={`font-medium ${
                      runEstimate.legal_risk === 'LOW' ? 'text-green-400' :
                      runEstimate.legal_risk === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{runEstimate.legal_risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Policy Version</span>
                    <span className="text-gray-400">v{runEstimate.governance_version}</span>
                  </div>
                </div>
                {runEstimate.warnings.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded p-2">
                    {runEstimate.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-yellow-300">⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded font-medium"
              >
                Submit Intent
              </button>
              <p className="text-xs text-gray-600 mt-2">This creates an immutable intent record. The engine will execute the scrape.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium disabled:opacity-30"
        >
          Back
        </button>
        {step < 6 && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-sm font-medium disabled:opacity-30"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
