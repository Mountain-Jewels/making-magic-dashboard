/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CreationConfig {
  format: '3d_video' | '2d_video' | '3d_interactive' | 'still_image'
  purpose: 'web_content' | 'social_media' | 'event_occasion' | 'email_campaign' | 'custom'
  platform?: string
  event?: string
  eventType?: 'gift_card' | 'marketing'
}

interface CreationWizardProps {
  onComplete: (config: CreationConfig) => void
  initialValues?: CreationConfig | null
}

const FORMATS = [
  { id: '3d_video' as const, label: '3D Video', description: 'Cinematic 3D rendered video' },
  { id: '2d_video' as const, label: '2D Video (Talking Avatar)', description: 'Avatar-driven talking video' },
  { id: '3d_interactive' as const, label: '3D Interactive', description: 'Interactive 3D experience' },
  { id: 'still_image' as const, label: 'Still Image', description: 'High-quality rendered image' },
]

const PURPOSES: { id: CreationConfig['purpose']; label: string; description: string }[] = [
  { id: 'web_content', label: 'Web Content (Shopify)', description: 'Product pages, online store content' },
  { id: 'social_media', label: 'Social Media', description: 'Content for social platforms' },
  { id: 'event_occasion', label: 'Event / Occasion', description: 'Celebrations, gifts, special moments' },
  { id: 'email_campaign', label: 'Email Campaign', description: 'Email marketing content' },
  { id: 'custom', label: 'Custom', description: 'Other or multi-purpose' },
]

const SOCIAL_PLATFORMS = [
  { id: 'instagram_feed', label: 'Instagram Feed' },
  { id: 'instagram_reels', label: 'Instagram Reels' },
  { id: 'instagram_stories', label: 'Instagram Stories' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
]

const EVENTS = [
  'Anniversary', 'Birthday', "Valentine's Day", "Mother's Day", "Father's Day",
  'Graduation', 'Wedding', 'Engagement', 'Baby Shower', 'Christmas', 'Hanukkah',
  "New Year's", 'Thanksgiving', 'Retirement', 'Congratulations', 'Just Because',
]

const EVENT_TYPES: { id: 'gift_card' | 'marketing'; label: string }[] = [
  { id: 'gift_card', label: 'Gift Card' },
  { id: 'marketing', label: 'Marketing / Promotion' },
]

function needsDetails(purpose: CreationConfig['purpose'] | null): boolean {
  return purpose === 'social_media' || purpose === 'event_occasion'
}

export function CreationWizard({ onComplete, initialValues }: CreationWizardProps) {
  const [step, setStep] = useState(1)
  const [format, setFormat] = useState<CreationConfig['format'] | null>(initialValues?.format ?? null)
  const [purpose, setPurpose] = useState<CreationConfig['purpose'] | null>(initialValues?.purpose ?? null)
  const [platform, setPlatform] = useState(initialValues?.platform ?? '')
  const [event, setEvent] = useState(initialValues?.event ?? '')
  const [eventType, setEventType] = useState<CreationConfig['eventType'] | null>(initialValues?.eventType ?? null)

  const totalSteps = needsDetails(purpose) ? 3 : 2
  const isLastStep = step === totalSteps

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  const handleNext = () => {
    if (isLastStep) {
      const config: CreationConfig = { format: format!, purpose: purpose! }
      if (purpose === 'social_media' && platform) config.platform = platform
      if (purpose === 'event_occasion') {
        if (event) config.event = event
        if (eventType) config.eventType = eventType
      }
      onComplete(config)
    } else {
      setStep((s) => s + 1)
    }
  }

  const canNext = () => {
    if (step === 1) return format !== null
    if (step === 2) return purpose !== null
    if (step === 3) {
      if (purpose === 'social_media') return platform !== ''
      if (purpose === 'event_occasion') return event !== '' && eventType !== null
    }
    return false
  }

  const title =
    step === 1
      ? 'Choose Your Format'
      : step === 2
        ? "What's the Purpose?"
        : purpose === 'social_media'
          ? 'Choose Your Platform'
          : purpose === 'event_occasion'
            ? "What's the Occasion?"
            : ''

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-gold/40 shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      {step === 1 && (
        <div className="space-y-2">
          {FORMATS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-start gap-3 p-3 rounded-xl border-2 border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="format"
                checked={format === opt.id}
                onChange={() => setFormat(opt.id)}
                className="text-brand-gold focus:ring-brand-gold mt-1"
              />
              <div>
                <span className="text-gray-900 font-medium block">{opt.label}</span>
                <span className="text-sm text-gray-500">{opt.description}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {PURPOSES.map((opt) => (
            <label
              key={opt.id}
              className="flex items-start gap-3 p-3 rounded-xl border-2 border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="purpose"
                checked={purpose === opt.id}
                onChange={() => setPurpose(opt.id)}
                className="text-brand-gold focus:ring-brand-gold mt-1"
              />
              <div>
                <span className="text-gray-900 font-medium block">{opt.label}</span>
                <span className="text-sm text-gray-500">{opt.description}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {step === 3 && purpose === 'social_media' && (
        <div className="space-y-2">
          {SOCIAL_PLATFORMS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
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

      {step === 3 && purpose === 'event_occasion' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Event</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {EVENTS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
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
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Type</p>
            <div className="flex gap-2">
              {EVENT_TYPES.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 flex-1 p-3 rounded-xl border-2 border-brand-gold/40 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="eventType"
                    checked={eventType === opt.id}
                    onChange={() => setEventType(opt.id)}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="text-gray-900 text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-gold/40 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-brand-gold text-black hover:bg-brand-gold/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLastStep ? 'Create' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
