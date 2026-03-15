/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export function JsonViewer({
  data,
  maxHeight = '300px',
}: {
  data: unknown
  maxHeight?: string
}) {
  return (
    <div
      className="overflow-auto rounded-md border border-surface-border bg-surface p-3"
      style={{ maxHeight }}
    >
      <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
