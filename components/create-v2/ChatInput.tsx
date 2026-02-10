'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  placeholder: string
  onSubmit?: (text: string) => void
  className?: string
}

export function ChatInput({ placeholder, onSubmit, className = '' }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
    setValue('')
  }

  return (
    <div
      className={`border-t border-brand-gold/40 p-4 ${className}`}
      style={{ backgroundColor: '#F3F4F6', minHeight: 120 }}
    >
      <div
        className="flex items-end gap-3 rounded-2xl border border-brand-gold/40 shadow-sm px-4 py-3"
        style={{ backgroundColor: '#FFFFFF', minHeight: 90 }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          rows={4}
          style={{ minHeight: 70, color: '#111827' }}
          className="flex-1 bg-transparent placeholder:text-gray-400 text-sm resize-none focus:outline-none leading-relaxed"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="shrink-0 p-3 rounded-full bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
