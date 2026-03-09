// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deriveTemplate } from '@/lib/api/scraper-templates'
import type { SearchTemplate, DeriveTemplateRequest } from '@/lib/types/scraper'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

interface Props {
  template: SearchTemplate
  onClose: () => void
}

export function DeriveModal({ template, onClose }: Props) {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState(`${template.name} (derived)`)
  const [state, setState] = useState(template.scope.jurisdiction.state || '')
  const [county, setCounty] = useState(template.scope.jurisdiction.county || '')
  const [city, setCity] = useState(template.scope.jurisdiction.city || '')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: DeriveTemplateRequest) => deriveTemplate(template.template_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      onClose()
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleSubmit = () => {
    if (!newName.trim()) { setError('Name is required'); return }
    setError(null)
    mutation.mutate({
      new_name: newName.trim(),
      jurisdiction_override: {
        country: 'US',
        state: state || undefined,
        county: county || undefined,
        city: city || undefined,
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-[#2A2A35] bg-[#1A1A24] shadow-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A35]">
          <h2 className="text-base font-semibold text-white">Derive Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-400">
            Create a new template based on <span className="font-medium text-white">{template.name}</span>.
            Change the location below — all other settings are copied.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">New Template Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">County</label>
              <input
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="Optional"
                className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
                className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#2A2A35]">
          <button onClick={onClose} className="px-4 py-2 border border-[#2A2A35] rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium hover:bg-[#C4A030] disabled:opacity-50"
          >
            {mutation.isPending ? 'Deriving...' : 'Derive Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
