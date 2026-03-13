/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import type {
  IngestSource,
  IngestAssetType,
  CreateIngestJobPayload,
} from '@/lib/types/asset-ingest'

type AssetsActionsSectionProps = {
  onCreateJob: (payload: CreateIngestJobPayload) => Promise<void>
  onSyncMetahumans: () => Promise<void>
}

const SOURCE_OPTIONS: { value: IngestSource; label: string }[] = [
  { value: 'upload', label: 'Upload' },
  { value: 'url', label: 'URL' },
  { value: 'meshy', label: 'Meshy AI' },
  { value: 'mac_sync', label: 'Mac Sync' },
  { value: 'metahuman_import', label: 'MetaHuman Import' },
]

const TYPE_OPTIONS: { value: IngestAssetType; label: string }[] = [
  { value: 'mesh', label: 'Mesh' },
  { value: 'metahuman', label: 'MetaHuman' },
  { value: 'prop', label: 'Prop' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'material', label: 'Material' },
]

export function AssetsActionsSection({
  onCreateJob,
  onSyncMetahumans,
}: AssetsActionsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [source, setSource] = useState<IngestSource>('upload')
  const [assetType, setAssetType] = useState<IngestAssetType>('mesh')
  const [filename, setFilename] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [license, setLicense] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setSource('upload')
    setAssetType('mesh')
    setFilename('')
    setUrl('')
    setTags('')
    setLicense('')
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (source === 'url' && !url.trim()) {
      setFormError('URL is required when source is "URL"')
      return
    }

    const payload: CreateIngestJobPayload = {
      source,
      asset_type: assetType,
    }
    if (filename.trim()) payload.filename = filename.trim()
    if (url.trim()) payload.url = url.trim()

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (tagList.length > 0 || license.trim()) {
      payload.metadata = {}
      if (tagList.length > 0) payload.metadata.tags = tagList
      if (license.trim()) payload.metadata.license = license.trim()
    }

    setSubmitting(true)
    try {
      await onCreateJob(payload)
      resetForm()
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await onSyncMetahumans()
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Actions</h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="px-4 py-2 rounded bg-[#D4AF37] hover:bg-[#C4A030] text-black text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'New Ingest Job'}
        </button>
        <button
          type="button"
          disabled={syncing}
          onClick={handleSync}
          className={`px-4 py-2 rounded text-white text-sm font-medium transition-colors ${
            syncing
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {syncing ? 'Syncing…' : 'Sync MetaHumans'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Create Ingest Job
          </h3>

          {formError && (
            <div className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-200 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as IngestSource)
                  setFormError(null)
                }}
                className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Asset Type</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as IngestAssetType)}
                className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">
              Filename <span className="text-white/30">(optional)</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="necklace_v2.fbx"
              className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {source === 'url' && (
            <div>
              <label className="block text-xs text-white/60 mb-1">
                URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setFormError(null)
                }}
                placeholder="https://example.com/model.fbx"
                className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Tags <span className="text-white/30">(comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="jewelry, pendant, gold"
                className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                License <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="CC-BY-4.0"
                className="w-full rounded bg-[#0A0A0F] border border-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              submitting
                ? 'bg-[#D4AF37]/50 text-black/50 cursor-not-allowed'
                : 'bg-[#D4AF37] hover:bg-[#C4A030] text-black'
            }`}
          >
            {submitting ? 'Creating…' : 'Create Job'}
          </button>
        </form>
      )}
    </div>
  )
}
