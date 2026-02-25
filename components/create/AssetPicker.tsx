'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { searchAssets } from '@/lib/api/studio-v1'
import type { AssetSearchResult } from '@/lib/types/studio-v1'

function assetDisplayName(path: string): string {
  return path.split('/').pop() ?? path
}

export function AssetPicker() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AssetSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    try {
      setLoading(true)
      const res = await searchAssets(q)
      setResults(res.results)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) doSearch('')
  }, [open, doSearch])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      doSearch(query)
    },
    [query, doSearch]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Search className="h-3 w-3 mr-1.5" />
          Browse Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Asset Browser</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Search assets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            Search
          </Button>
        </form>

        <ScrollArea className="h-64">
          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <Package className="h-8 w-8 mb-2" />
              <p className="text-sm">
                {query ? 'No assets found' : 'Search to browse Unreal assets'}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 p-1">
            {results.map((asset) => (
              <button
                key={asset.asset_path}
                className="p-3 rounded-lg border border-border hover:border-primary/50 text-left transition-colors"
                onClick={() => {
                  navigator.clipboard?.writeText(asset.asset_path)
                  setOpen(false)
                }}
              >
                <div className="w-full h-12 rounded bg-muted flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium truncate">
                  {assetDisplayName(asset.asset_path)}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
