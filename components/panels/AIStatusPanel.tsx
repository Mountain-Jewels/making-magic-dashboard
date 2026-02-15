/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * AI Status panel — Ready | Generating | Complete | Error.
 */

'use client'

import { Check, AlertCircle } from 'lucide-react'
import { useAIStatusStore } from '@/lib/stores/ai-status-store'

export function AIStatusPanel() {
  const { status, progress, message } = useAIStatusStore()

  return (
    <div
      className="h-20 flex-shrink-0 flex flex-col justify-center px-3 border-t border-[#2A2A35]"
      style={{ backgroundColor: '#111118' }}
    >
      <div className="flex items-center gap-2">
        {status === 'ready' && (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm text-white/80">Ready</span>
          </>
        )}
        {status === 'generating' && (
          <>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0 ring-2 ring-amber-500/30" />
            <span className="text-sm text-white/80">
              Generating...{progress != null ? ` ${progress}%` : ''}
            </span>
          </>
        )}
        {status === 'complete' && (
          <>
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm text-white/80">Complete</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm text-white/80 truncate">
              {message ?? 'Error'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
