'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

export function ScriptInput() {
  const { scriptText, setScriptText, generateDialogue, generatedDialogue } = useDashboardStore()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Script / Idea
        </label>
        <textarea
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Enter your creative idea or script..."
          className="w-full h-32 p-4 rounded-lg border-2 border-gray-300 focus:border-secondary focus:outline-none resize-none"
        />
      </div>

      <button
        onClick={generateDialogue}
        disabled={!scriptText.trim()}
        className="px-6 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Generate Dialogue with AI
      </button>

      {generatedDialogue && (
        <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
          <p className="text-sm font-semibold mb-2 text-gray-700">Generated Dialogue:</p>
          <p className="text-gray-800">{generatedDialogue}</p>
        </div>
      )}
    </div>
  )
}

