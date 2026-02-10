'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CreationConfig {
  contentType: '3d_video' | '3d_interactive' | 'still_image' | 'web_content'
  platform: string
  event: string
  purpose: 'gift_card' | 'marketing'
}

interface CreationWizardProps {
  onComplete: (config: CreationConfig) => void
}

const CONTENT_TYPES = [
  { id: '3d_video', label: '3D Video' },
  { id: '3d_interactive', label: '3D Interactive' },
  { id: 'still_image', label: 'Still Image' },
  { id: 'web_content', label: 'Web Content' },
] as const

const PLATFORMS = [
  { id: 'instagram_feed', label: 'Instagram Feed', category: 'social' },
  { id: 'instagram_reels', label: 'Instagram Reels', category: 'social' },
  { id: 'instagram_stories', label: 'Instagram Stories', category: 'social' },
  { id: 'tiktok', label: 'TikTok', category: 'social' },
  { id: 'youtube', label: 'YouTube', category: 'social' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', category: 'social' },
  { id: 'facebook', label: 'Facebook', category: 'social' },
  { id: 'pinterest', label: 'Pinterest', category: 'social' },
  { id: 'web', label: 'Web', category: 'web' },
  { id: 'email', label: 'Email', category: 'email' },
  { id: 'custom', label: 'Custom', category: 'custom' },
]

const EVENTS = [
  'Anniversary', 'Birthday', "Valentine's Day", "Mother's Day", "Father's Day",
  'Graduation', 'Wedding', 'Engagement', 'Baby Shower', 'Christmas', 'Hanukkah',
  "New Year's", 'Thanksgiving', 'Retirement', 'Congratulations', 'Just Because',
  'None / Skip',
]

const PURPOSES: { id: CreationConfig['purpose']; label: string }[] = [
  { id: 'gift_card', label: 'Gift Card' },
  { id: 'marketing', label: 'Marketing' },
]

export function CreationWizard({ onComplete }: CreationWizardProps) {
  const [step, setStep] = useState(1)
  const [contentType, setContentType] = useState<CreationConfig['contentType'] | null>(null)
  const [platform, setPlatform] = useState('')
  const [event, setEvent] = useState('')
  const [purpose, setPurpose] = useState<CreationConfig['purpose'] | null>(null)

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  const handleNext = () => {
    if (step === 4) {
      if (contentType && platform && event && purpose) {
        onComplete({ contentType, platform, event, purpose })
      }
    } else {
      setStep((s) => Math.min(4, s + 1))
    }
  }

  const canNext = () => {
    if (step === 1) return contentType !== null
    if (step === 2) return platform !== ''
    if (step === 3) return event !== ''
    if (step === 4) return purpose !== null
    return false
  }

  const title =
    step === 1
      ? 'What are you creating?'
      : step === 2
        ? 'Where will it be published?'
        : step === 3
          ? "What's the occasion?"
          : "What's the purpose?"

  return (
    <div className="bg-white rounded-2xl border border-brand-gold/40 shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      {step === 1 && (
        <div className="space-y-2">
          {CONTENT_TYPES.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="contentType"
                checked={contentType === opt.id}
                onChange={() => setContentType(opt.id)}
                className="text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {PLATFORMS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="platform"
                checked={platform === opt.id}
                onChange={() => setPlatform(opt.id)}
                className="text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2 max-h-64 overflow-auto">
          {EVENTS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="event"
                checked={event === opt}
                onChange={() => setEvent(opt)}
                className="text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-gray-900">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          {PURPOSES.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="purpose"
                checked={purpose === opt.id}
                onChange={() => setPurpose(opt.id)}
                className="text-brand-gold focus:ring-brand-gold"
              />
              <span className="text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-brand-gold text-black hover:bg-brand-gold/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {step === 4 ? 'Create' : 'Next'}
          {step < 4 && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
