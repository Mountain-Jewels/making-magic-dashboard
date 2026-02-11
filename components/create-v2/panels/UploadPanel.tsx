'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  return (
    <div className="p-4 space-y-4">
      <label className="block">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="rounded-lg border-2 border-dashed border-brand-gold/40 p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Drop files here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, HEIC</p>
        </div>
      </label>
      {file && (
        <div className="rounded-lg border-2 border-brand-gold/40 p-3 space-y-2">
          <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            Preview
          </div>
          <p className="text-sm text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          <Button size="sm" className="w-full">
            Use in Canvas
          </Button>
        </div>
      )}
    </div>
  )
}
