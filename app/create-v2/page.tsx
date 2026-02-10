'use client'

import { useState } from 'react'
import { Gem, Play, Save, Upload } from 'lucide-react'
import { CreativeToolBar, type ToolId } from '@/components/create-v2/CreativeToolBar'
import { ToolPanel } from '@/components/create-v2/ToolPanel'
import { ChatInput } from '@/components/create-v2/ChatInput'
import { CreationWizard, type CreationConfig } from '@/components/create-v2/CreationWizard'

function formatConfigSummary(config: CreationConfig): string {
  const ct = config.contentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const pf = config.platform.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return `${ct} • ${pf} • ${config.event} • ${config.purpose.replace(/_/g, ' ')}`
}

function LeftPanelContent({
  creationConfig,
  onCreationConfig,
}: {
  creationConfig: CreationConfig | null
  onCreationConfig: (config: CreationConfig) => void
}) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleWizardComplete = (config: CreationConfig) => {
    onCreationConfig(config)
    setWizardOpen(false)
  }

  return (
    <>
      {/* Top-left: Canvas + edit chat */}
      <div className="flex-[3] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border border-brand-gold/40 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
          {!creationConfig ? (
            wizardOpen ? (
              <CreationWizard onComplete={handleWizardComplete} />
            ) : (
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors"
              >
                ✨ Start Creating
              </button>
            )
          ) : (
            <div className="w-full text-center">
              <p className="text-sm font-medium text-gray-700">
                {formatConfigSummary(creationConfig)}
              </p>
            </div>
          )}
        </div>
        {/* Edit chat input — only when wizard done */}
        {creationConfig && (
          <ChatInput
            placeholder="Type to edit your scene..."
            onSubmit={() => {}}
          />
        )}
      </div>

      {/* Toolbar — icon strip (disabled until wizard done) */}
      <CreativeToolBar
        activeTool={creationConfig ? activeTool : null}
        onToolChange={setActiveTool}
        disabled={!creationConfig}
      />

      {/* Bottom-left: Tool panel + generate chat */}
      <div className="flex-[2] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border border-brand-gold/40 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ToolPanel activeTool={activeTool} wizardCompleted={!!creationConfig} />
        </div>
        {/* Generate chat input — only when wizard done */}
        {creationConfig && (
          <ChatInput
            placeholder="Describe what you want to create..."
            onSubmit={() => {}}
          />
        )}
      </div>
    </>
  )
}

function RightPanelContent() {
  return (
    <>
      {/* Display canvas — rounded card */}
      <div className="flex-1 min-h-0 rounded-2xl shadow-sm bg-white text-gray-900 border border-brand-gold/40 flex items-center justify-center overflow-hidden">
        <p className="text-base text-gray-500">Your creation will appear here</p>
      </div>

      {/* Action bar — always visible at bottom */}
      <div className="flex-shrink-0 rounded-2xl bg-white text-gray-900 border border-brand-gold/40 shadow-sm p-4 flex items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Play className="h-4 w-4 mr-2" /> Preview
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" /> Save
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" /> Deploy
        </button>
      </div>
    </>
  )
}

export default function CreateV2Page() {
  const [creationConfig, setCreationConfig] = useState<CreationConfig | null>(null)

  return (
    <div className="h-full w-full flex flex-col">
      {/* Logo — centered, large */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-6">
        <Gem className="h-12 w-12 text-brand-gold" />
        <span
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}
        >
          The Studio
        </span>
      </div>

      {/* Panels below logo */}
      <div className="flex-1 min-h-0 flex gap-4 px-6 pb-6">
        {/* Left side — 60% width */}
        <div className="flex flex-col gap-4 min-h-0" style={{ width: '60%' }}>
          <LeftPanelContent
            creationConfig={creationConfig}
            onCreationConfig={setCreationConfig}
          />
        </div>
        {/* Right side — 40% width */}
        <div className="flex flex-col gap-4 min-h-0" style={{ width: '40%' }}>
          <RightPanelContent />
        </div>
      </div>
    </div>
  )
}
