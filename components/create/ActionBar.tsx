'use client'

import { useState } from 'react'
import { Play, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ActionBar() {
  const [saveOpen, setSaveOpen] = useState(false)

  return (
    <div className="flex-shrink-0 sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2 justify-end">
      <Button variant="outline" size="sm">
        <Play className="h-4 w-4 mr-1.5" />
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaveOpen(!saveOpen)}
      >
        <Save className="h-4 w-4 mr-1.5" />
        Save
      </Button>
      <Button size="sm" className="bg-brand-gold text-black hover:bg-brand-gold/90">
        <Upload className="h-4 w-4 mr-1.5" />
        Deploy
      </Button>
    </div>
  )
}
