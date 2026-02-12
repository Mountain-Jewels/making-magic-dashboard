/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import type { EmailTemplate } from '@/lib/types/preview'

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

interface EmailRendererProps {
  template: EmailTemplate
  personalization: Record<string, string>
  device: 'desktop' | 'mobile'
}

export function EmailRenderer({ template, personalization, device }: EmailRendererProps) {
  const subject = interpolate(template.subject, personalization)
  const bodyHtml = interpolate(template.body_html, personalization)

  return (
    <div
      className={`bg-gray-100 rounded-lg overflow-hidden shadow-xl transition-all ${
        device === 'desktop' ? 'w-full max-w-2xl' : 'w-[375px]'
      }`}
    >
      <div className="bg-gray-200 px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">From:</span> Mountain Jewels &lt;moments@mountainjewels.com&gt;
      </div>
      <div className="bg-gray-200 px-4 py-1 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-300">
        <span className="font-medium text-gray-700">Subject:</span>
        {subject}
      </div>
      <div className="bg-white p-6">
        <div className="h-1 bg-brand-gold rounded mb-6" />
        <div
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
          className="text-gray-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_p]:mb-3"
        />
        <div className="text-center mt-6">
          <span className="inline-block px-8 py-3 bg-brand-gold text-white rounded font-medium">
            {template.cta_label}
          </span>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Mountain Jewels · Luxury Moments, Delivered</p>
          <p className="mt-1">You received this because someone created a moment for you.</p>
          <p className="mt-1 text-gray-300">Unsubscribe | Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
