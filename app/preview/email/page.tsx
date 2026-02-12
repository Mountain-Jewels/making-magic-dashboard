/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { usePreviewStore } from '@/lib/stores/preview-store'
import type { EmailDevice } from '@/lib/types/preview'
import { EmailRenderer } from '@/components/preview/EmailRenderer'
import { Monitor, Smartphone } from 'lucide-react'

const MOMENT_COLORS: Record<string, string> = {
  birthday: 'bg-pink-900/30 border-pink-800 text-pink-300',
  anniversary: 'bg-red-900/30 border-red-800 text-red-300',
  wedding: 'bg-purple-900/30 border-purple-800 text-purple-300',
  graduation: 'bg-blue-900/30 border-blue-800 text-blue-300',
  property: 'bg-green-900/30 border-green-800 text-green-300',
  legacy: 'bg-amber-900/30 border-amber-800 text-amber-300',
  gratitude: 'bg-rose-900/30 border-rose-800 text-rose-300',
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export default function EmailPreviewPage() {
  const { emailTemplates, selectedTemplate, setSelectedTemplate } = usePreviewStore()
  const [device, setDevice] = useState<EmailDevice>('desktop')
  const [editedPersonalization, setEditedPersonalization] = useState<Record<string, string>>({})

  const active = selectedTemplate
  const personalization = active ? { ...active.personalization, ...editedPersonalization } : {}

  const updateField = (key: string, value: string) => {
    setEditedPersonalization((prev) => ({ ...prev, [key]: value }))
  }

  const resetPersonalization = () => setEditedPersonalization({})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Email Preview</h1>
          <p className="text-sm text-text-muted">Moment type templates with personalization</p>
        </div>
        <div className="flex gap-1 bg-surface-panel rounded-lg p-1 border border-surface-border">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${device === 'desktop' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${device === 'mobile' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {emailTemplates.map((tmpl) => {
          const color = MOMENT_COLORS[tmpl.moment_type] ?? 'bg-surface-panel border-surface-border text-text-secondary'
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => { setSelectedTemplate(tmpl); resetPersonalization() }}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedTemplate?.id === tmpl.id ? 'ring-2 ring-brand-gold ' + color : color + ' opacity-60 hover:opacity-100'
              }`}
            >
              {tmpl.moment_type}
            </button>
          )
        })}
      </div>

      {active ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-muted mb-3">Personalization</h3>
              <div className="space-y-3">
                {Object.entries(active.personalization).map(([key, defaultValue]) => (
                  <div key={key}>
                    <label className="block text-xs text-text-muted mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                    <input
                      type="text"
                      value={editedPersonalization[key] ?? defaultValue}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full bg-surface-elevated border border-surface-border rounded px-2 py-1.5 text-sm text-text-primary"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={resetPersonalization}
                className="mt-3 text-xs text-text-muted hover:text-text-primary"
              >
                Reset to defaults
              </button>
            </div>
            <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-muted mb-3">Email Metadata</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Subject</p>
                  <p className="text-text-primary">{interpolate(active.subject, personalization as Record<string, string>)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Preview Text</p>
                  <p className="text-text-secondary">{active.preview_text}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">CTA</p>
                  <p className="text-brand-gold">{active.cta_label}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <EmailRenderer template={active} personalization={personalization as Record<string, string>} device={device} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-surface-panel border border-surface-border rounded-lg">
          <p className="text-text-muted">Select a moment type template to preview</p>
        </div>
      )}
    </div>
  )
}
