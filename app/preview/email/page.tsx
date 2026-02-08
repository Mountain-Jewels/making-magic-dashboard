'use client'

import { useState } from 'react'
import { usePreviewStore } from '@/lib/stores/preview-store'
import type { EmailDevice } from '@/lib/types/preview'

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
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Email Preview</h1>
          <p className="text-sm text-gray-500">7 moment type templates with personalization</p>
        </div>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${device === 'desktop' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            🖥 Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${device === 'mobile' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex gap-2 flex-wrap">
        {emailTemplates.map((tmpl) => {
          const color = MOMENT_COLORS[tmpl.moment_type] || 'bg-gray-800 border-gray-700 text-gray-300'
          return (
            <button
              key={tmpl.id}
              onClick={() => { setSelectedTemplate(tmpl); resetPersonalization() }}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedTemplate?.id === tmpl.id ? 'ring-2 ring-[#D4AF37] ' + color : color + ' opacity-60 hover:opacity-100'
              }`}
            >
              {tmpl.moment_type}
            </button>
          )
        })}
      </div>

      {active ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Personalization Editor */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Personalization</h3>
              <div className="space-y-3">
                {Object.entries(active.personalization).map(([key, defaultValue]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                    <input
                      type="text"
                      value={editedPersonalization[key] ?? defaultValue}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={resetPersonalization}
                className="mt-3 text-xs text-gray-500 hover:text-white"
              >
                Reset to defaults
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Email Metadata</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Subject</p>
                  <p className="text-white">{interpolate(active.subject, personalization as Record<string, string>)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Preview Text</p>
                  <p className="text-gray-400">{active.preview_text}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CTA</p>
                  <p className="text-[#D4AF37]">{active.cta_label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Email Preview */}
          <div className="col-span-2 flex justify-center">
            <div
              className={`bg-gray-100 rounded-lg overflow-hidden shadow-xl transition-all ${
                device === 'desktop' ? 'w-full max-w-2xl' : 'w-[375px]'
              }`}
            >
              {/* Email Header */}
              <div className="bg-gray-200 px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">From:</span> Mountain Jewels &lt;moments@mountainjewels.com&gt;
              </div>
              <div className="bg-gray-200 px-4 py-1 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-300">
                <span className="font-medium text-gray-700">Subject:</span>
                {interpolate(active.subject, personalization as Record<string, string>)}
              </div>

              {/* Email Body */}
              <div className="bg-white p-6">
                {/* Gold header bar */}
                <div className="h-1 bg-[#D4AF37] rounded mb-6" />

                <div
                  dangerouslySetInnerHTML={{
                    __html: interpolate(active.body_html, personalization as Record<string, string>),
                  }}
                  className="text-gray-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_p]:mb-3"
                />

                {/* CTA Button */}
                <div className="text-center mt-6">
                  <span className="inline-block px-8 py-3 bg-[#D4AF37] text-white rounded font-medium">
                    {active.cta_label}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                  <p>Mountain Jewels · Luxury Moments, Delivered</p>
                  <p className="mt-1">You received this because someone created a moment for you.</p>
                  <p className="mt-1 text-gray-300">Unsubscribe | Privacy Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-gray-500">Select a moment type template to preview</p>
        </div>
      )}
    </div>
  )
}
