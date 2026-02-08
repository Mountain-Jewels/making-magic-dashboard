'use client'

import { useState } from 'react'
import { useIntelligenceStore } from '@/lib/stores/intelligence-store'
import type { SourceCategory, ParameterStatus } from '@/lib/types/intelligence'

const CATEGORY_ICONS: Record<string, string> = {
  PUBLIC_RECORDS: '🏛️',
  COURTS: '⚖️',
  GOVERNMENT_FILINGS: '📄',
  EDUCATIONAL_INSTITUTIONS: '🎓',
  RELIGIOUS_INSTITUTIONS: '⛪',
  NEWS_MEDIA: '📰',
  SOCIAL_MEDIA: '📱',
  BUSINESS_REGISTRIES: '🏢',
  REAL_ESTATE_LISTINGS: '🏠',
  NON_PROFIT_DISCLOSURES: '💝',
}

const STATUS_DISPLAY: Record<ParameterStatus, { label: string; color: string; bg: string }> = {
  allowed: { label: 'ALLOWED', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800' },
  disabled: { label: 'DISABLED', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/50' },
  forbidden: { label: 'FORBIDDEN', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/50' },
}

const PARAM_STATUS_DOT: Record<ParameterStatus, string> = {
  allowed: '🟢',
  disabled: '🟡',
  forbidden: '🔴',
}

export default function SourcesPage() {
  const { sourceMatrix } = useIntelligenceStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Source Browser</h1>
          <p className="text-sm text-gray-500">Governance Source Matrix v{sourceMatrix.version}</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400">{sourceMatrix.categories.filter((c) => c.status === 'allowed').length} allowed</span>
          <span className="text-yellow-400">{sourceMatrix.categories.filter((c) => c.status === 'disabled').length} disabled</span>
          <span className="text-gray-500">Updated {new Date(sourceMatrix.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-xs text-gray-500">
        <strong className="text-gray-400">How this works:</strong> The source matrix is owned by the Governance Core.
        The UI renders what the server allows — it never hardcodes categories or parameters.
        <span className="text-green-400"> allowed</span> = usable |
        <span className="text-yellow-400"> disabled</span> = greyed out |
        <span className="text-red-400"> forbidden</span> = hidden from Run Builder
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {sourceMatrix.categories.map((cat) => {
          const status = STATUS_DISPLAY[cat.status]
          const isExpanded = expanded === cat.id
          const icon = CATEGORY_ICONS[cat.id] || '📋'
          const allowedParams = Object.entries(cat.parameters).filter(([, s]) => s === 'allowed')
          const disabledParams = Object.entries(cat.parameters).filter(([, s]) => s === 'disabled')
          const forbiddenParams = Object.entries(cat.parameters).filter(([, s]) => s === 'forbidden')

          return (
            <div
              key={cat.id}
              className={`border rounded-lg transition-colors ${
                cat.status === 'allowed' ? 'bg-gray-900 border-gray-800' :
                cat.status === 'disabled' ? 'bg-gray-900/50 border-gray-800/50' :
                'bg-gray-900/30 border-gray-800/30'
              }`}
            >
              <button
                onClick={() => toggleExpand(cat.id)}
                className={`w-full text-left p-4 flex items-center gap-4 ${cat.status === 'disabled' ? 'opacity-60' : ''}`}
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${status.bg} ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{cat.max_lookback_days}d lookback</p>
                  <p className="text-xs text-gray-500">{cat.rate_limit_per_minute} req/min</p>
                </div>
                <span className="text-gray-600 ml-2">{isExpanded ? '▼' : '▶'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  {cat.notes && (
                    <div className="bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2 mb-3 text-xs text-yellow-300">
                      {cat.notes}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Allowed Parameters ({allowedParams.length})</h4>
                      {allowedParams.length > 0 ? (
                        <ul className="space-y-1">
                          {allowedParams.map(([param]) => (
                            <li key={param} className="text-gray-300 text-xs flex items-center gap-2">
                              {PARAM_STATUS_DOT.allowed} {param.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600">None</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Disabled Parameters ({disabledParams.length})</h4>
                      {disabledParams.length > 0 ? (
                        <ul className="space-y-1">
                          {disabledParams.map(([param]) => (
                            <li key={param} className="text-gray-500 text-xs flex items-center gap-2">
                              {PARAM_STATUS_DOT.disabled} {param.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600">None</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Forbidden ({forbiddenParams.length})</h4>
                      {forbiddenParams.length > 0 ? (
                        <ul className="space-y-1">
                          {forbiddenParams.map(([param]) => (
                            <li key={param} className="text-red-400/60 text-xs flex items-center gap-2">
                              {PARAM_STATUS_DOT.forbidden} {param.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600">None</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800/50 flex gap-6 text-xs text-gray-500">
                    <span>Jurisdiction: {cat.jurisdiction_scope.join(', ')}</span>
                    <span>Max lookback: {cat.max_lookback_days} days</span>
                    <span>Rate limit: {cat.rate_limit_per_minute}/min</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
