/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { CheckCircle2, XCircle, Eye } from 'lucide-react'

export function ApproveView() {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Approval Queue</h2>
        <p className="text-sm text-white/40">
          Review staged content before deployment. Compare candidates
          side-by-side.
        </p>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success/50" />
            </div>
          </div>
          <p className="text-sm text-white/30">No items awaiting approval</p>
          <p className="text-xs text-white/15 max-w-sm">
            Items move here from the Stage view once you mark them ready for
            review. Approve to publish or reject to return to Create.
          </p>
        </div>
      </div>

      {/* Action template (hidden when no items) */}
      <div className="h-12 border-t border-surface-border flex items-center gap-2 pt-3 opacity-30">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-success/20 text-success text-xs font-medium rounded">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-error/20 text-error text-xs font-medium rounded">
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-white/50 text-xs font-medium rounded">
          <Eye className="h-3.5 w-3.5" />
          Compare
        </button>
      </div>
    </div>
  )
}
