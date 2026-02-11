'use client'

import { useState } from 'react'
import { ChevronLeft, Gem, Play, Save, Sparkles, Upload } from 'lucide-react'
import { CreativeToolBar, type ToolId } from '@/components/create/CreativeToolBar'
import { ToolPanel } from '@/components/create/ToolPanel'
import { ChatInput } from '@/components/create/ChatInput'
import { CreationWizard, type CreationConfig } from '@/components/create/CreationWizard'

function formatConfigSummary(config: CreationConfig): string {
  const fmt = config.format.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const purposeLabel = config.purpose.replace(/_/g, ' ')
  const parts = [fmt, purposeLabel]
  if (config.platform) parts.push(config.platform.replace(/_/g, ' '))
  if (config.event) parts.push(config.event)
  if (config.eventType) parts.push(config.eventType.replace(/_/g, ' '))
  return parts.join(' • ')
}

function LeftPanelContent({
  creationConfig,
  showWizard,
  onCreationConfig,
  onShowWizard,
  onBackToSetup,
}: {
  creationConfig: CreationConfig | null
  showWizard: boolean
  onCreationConfig: (config: CreationConfig) => void
  onShowWizard: (show: boolean) => void
  onBackToSetup: () => void
}) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)

  const handleWizardComplete = (config: CreationConfig) => {
    onCreationConfig(config)
    onShowWizard(false)
  }

  return (
    <>
      {/* Back to Setup — re-opens wizard with current config, does NOT clear work */}
      {creationConfig && !showWizard && (
        <div className="flex-shrink-0 flex justify-start">
          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Setup
          </button>
        </div>
      )}

      {/* Top-left: Canvas + edit chat */}
      <div className="flex-[3] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
          {showWizard ? (
            <CreationWizard
              key="wizard"
              initialValues={creationConfig}
              onComplete={handleWizardComplete}
            />
          ) : !creationConfig ? (
            <button
              type="button"
              onClick={() => onShowWizard(true)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors"
            >
              ✨ Start Creating
            </button>
          ) : (
            <div className="w-full text-center">
              <p className="text-sm font-medium text-gray-700">
                {formatConfigSummary(creationConfig)}
              </p>
            </div>
          )}
        </div>
        {/* Edit chat input — only when wizard done and not re-opening */}
        {creationConfig && !showWizard && (
          <ChatInput
            placeholder="Type to edit your scene..."
            onSubmit={() => {}}
            creationConfig={creationConfig}
          />
        )}
      </div>

      {/* AI icon between top and bottom left panels */}
      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-1 text-brand-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>

      {/* Toolbar — icon strip (disabled until wizard done) */}
      <CreativeToolBar
        activeTool={creationConfig && !showWizard ? activeTool : null}
        onToolChange={setActiveTool}
        disabled={!creationConfig || showWizard}
      />

      {/* Bottom-left: Tool panel + generate chat */}
      <div className="flex-[2] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ToolPanel activeTool={activeTool} wizardCompleted={!!creationConfig} />
        </div>
        {/* Generate chat input — only when wizard done */}
        {creationConfig && !showWizard && (
          <ChatInput
            placeholder="Describe what you want to create..."
            onSubmit={() => {}}
            creationConfig={creationConfig}
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
      <div className="flex-1 min-h-0 rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 flex items-center justify-center overflow-hidden">
        <p className="text-base text-gray-500">Your creation will appear here</p>
      </div>

      {/* Action bar — always visible at bottom */}
      <div className="flex-shrink-0 rounded-2xl bg-white text-gray-900 border-[3px] border-brand-gold/50 shadow-sm p-4 flex items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-gold/40 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Play className="h-4 w-4 mr-2" /> Preview
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-gold/40 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
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
  const [showWizard, setShowWizard] = useState(false)

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
            showWizard={showWizard}
            onCreationConfig={setCreationConfig}
            onShowWizard={setShowWizard}
            onBackToSetup={() => setShowWizard(true)}
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
