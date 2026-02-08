'use client'

import { useState } from 'react'
import { useDeployStore } from '@/lib/stores/deploy-store'

const TYPE_LABELS: Record<string, string> = {
  video_player: '🎬 Video Player',
  gift_card_banner: '💳 Gift Card Banner',
  moment_badge: '🏷️ Moment Badge',
  product_story: '📖 Product Story',
  email_embed: '✉️ Email Embed',
}

export default function LiquidPage() {
  const { snippets } = useDeployStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selected = snippets.find((s) => s.id === selectedId)

  const handleCopy = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = selected.code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Liquid Generator</h1>
          <p className="text-sm text-gray-500">Auto-generated Shopify Liquid snippets — copy and paste into your theme</p>
        </div>
        <span className="text-xs text-gray-500">{snippets.length} snippets available</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Snippet List */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-400 mb-3">Snippets</h2>
          {snippets.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => { setSelectedId(snippet.id); setCopied(false) }}
              className={`w-full text-left p-3 border rounded-lg transition-colors ${
                selectedId === snippet.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{TYPE_LABELS[snippet.type]?.split(' ')[0]}</span>
                <h3 className="text-sm font-medium text-white">{snippet.name}</h3>
              </div>
              <p className="text-xs text-gray-500">{snippet.description.substring(0, 60)}...</p>
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                    <p className="text-sm text-gray-500">{selected.description}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-[#D4AF37] hover:bg-[#C4A030] text-black'
                    }`}
                  >
                    {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>

                {/* Code Block */}
                <div className="bg-black rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{selected.code}</pre>
                </div>
              </div>

              {/* Variables Reference */}
              {selected.variables.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-400 mb-3">Template Variables</h3>
                  <div className="space-y-2">
                    {selected.variables.map((v) => (
                      <div key={v.name} className="flex items-start gap-4 text-sm">
                        <code className="text-[#D4AF37] font-mono text-xs bg-gray-800 px-2 py-1 rounded shrink-0">
                          {`{{ ${v.name} }}`}
                        </code>
                        <div>
                          <p className="text-gray-300">{v.description}</p>
                          <p className="text-xs text-gray-600">Example: {v.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Instructions */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-2">How to Use</h3>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Copy the snippet above</li>
                  <li>In Shopify Admin → Themes → Edit Code</li>
                  <li>Create a new snippet file: <code className="text-xs bg-gray-800 px-1 rounded">snippets/mj-{selected.type.replace(/_/g, '-')}.liquid</code></li>
                  <li>Paste the code and save</li>
                  <li>Include in your template: <code className="text-xs bg-gray-800 px-1 rounded">{`{% render 'mj-${selected.type.replace(/_/g, '-')}' %}`}</code></li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-900 border border-gray-800 rounded-lg">
              <p className="text-gray-500">Select a snippet to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
