'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (params: { query: string; slots: string[]; colors: string[] }) => Promise<void>
  disabled?: boolean
}

export function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [slotsInput, setSlotsInput] = useState('')
  const [colorsInput, setColorsInput] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <form
      className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
          await onSearch({
            query,
            slots: slotsInput
              .split(',')
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean),
            colors: colorsInput
              .split(',')
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean),
          })
        } finally {
          setLoading(false)
        }
      }}
    >
      <div className="text-sm text-white/80 font-medium">Fashion Guru Search</div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search terms (e.g. modern black cocktail dress)"
        className="w-full rounded-md bg-[#0D0D12] border border-[#2A2A35] px-3 py-2 text-sm text-white"
        disabled={disabled}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={slotsInput}
          onChange={(event) => setSlotsInput(event.target.value)}
          placeholder="Slots (comma separated, e.g. dress,shoes)"
          className="w-full rounded-md bg-[#0D0D12] border border-[#2A2A35] px-3 py-2 text-sm text-white"
          disabled={disabled}
        />
        <input
          value={colorsInput}
          onChange={(event) => setColorsInput(event.target.value)}
          placeholder="Colors (comma separated, e.g. black,gold)"
          className="w-full rounded-md bg-[#0D0D12] border border-[#2A2A35] px-3 py-2 text-sm text-white"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-white text-black text-sm px-3 py-2 font-medium disabled:opacity-50"
        disabled={disabled || loading}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
