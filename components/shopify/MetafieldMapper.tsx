'use client'

export interface MetafieldSpec {
  namespace: string
  key: string
  type: string
  description: string
}

interface MetafieldMapperProps {
  metafields: MetafieldSpec[]
}

export function MetafieldMapper({ metafields }: MetafieldMapperProps) {
  return (
    <div className="mt-4 rounded-lg border border-surface-border bg-surface-panel overflow-hidden">
      <div className="px-3 py-2 border-b border-surface-border">
        <span className="text-xs font-medium text-text-muted">Shopify Admin → Metafields to set</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left py-2 px-3 text-text-muted font-medium">Namespace.Key</th>
              <th className="text-left py-2 px-3 text-text-muted font-medium">Type</th>
              <th className="text-left py-2 px-3 text-text-muted font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {metafields.map((mf) => (
              <tr key={`${mf.namespace}.${mf.key}`} className="border-b border-surface-border last:border-0">
                <td className="py-2 px-3 font-mono text-text-primary">{mf.namespace}.{mf.key}</td>
                <td className="py-2 px-3 text-text-secondary">{mf.type}</td>
                <td className="py-2 px-3 text-text-muted">{mf.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-3 py-2 text-xs text-text-muted border-t border-surface-border">
        Set these product metafields in Shopify Admin so the Liquid snippet can render.
      </p>
    </div>
  )
}
