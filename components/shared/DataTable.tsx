/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data',
  loading = false,
}: {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="py-8 text-center text-white/50 text-sm">Loading...</div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-white/40 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/40 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-surface-border/50 ${
                onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-2.5 pr-4 text-white/80 ${col.className ?? ''}`}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
