'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { updateNodeSchedule } from '@/lib/api/vm-control'
import type { VmNode, DayOfWeek } from '@/lib/types/vm-control'
import { DAYS_OF_WEEK } from '@/lib/types/vm-control'

interface Props {
  node: VmNode | null
  onRefresh: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function ScheduleGridSection({ node, onRefresh }: Props) {
  const [grid, setGrid] = useState<Record<string, Set<number>>>({})
  const [mode, setMode] = useState<string>('manual')
  const [saving, setSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(false)

  useEffect(() => {
    if (!node) return
    setMode(node.schedule_mode)
    const initial: Record<string, Set<number>> = {}
    for (const day of DAYS_OF_WEEK) {
      initial[day] = new Set(node.schedule_json?.[day] ?? [])
    }
    setGrid(initial)
  }, [node])

  const toggleCell = useCallback((day: DayOfWeek, hour: number, forceValue?: boolean) => {
    setGrid((prev) => {
      const next = { ...prev }
      const set = new Set(next[day] ?? [])
      const newVal = forceValue !== undefined ? forceValue : !set.has(hour)
      if (newVal) set.add(hour)
      else set.delete(hour)
      next[day] = set
      return next
    })
  }, [])

  const handleMouseDown = (day: DayOfWeek, hour: number) => {
    const isActive = grid[day]?.has(hour) ?? false
    setDragValue(!isActive)
    setIsDragging(true)
    toggleCell(day, hour, !isActive)
  }

  const handleMouseEnter = (day: DayOfWeek, hour: number) => {
    if (!isDragging) return
    toggleCell(day, hour, dragValue)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = async () => {
    if (!node) return
    setSaving(true)
    try {
      const scheduleJson: Record<string, number[]> = {}
      for (const day of DAYS_OF_WEEK) {
        scheduleJson[day] = Array.from(grid[day] ?? []).sort((a, b) => a - b)
      }
      await updateNodeSchedule(node.id, mode, scheduleJson)
      toast.success('Schedule saved')
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save schedule'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const totalHours = Object.values(grid).reduce((sum, set) => sum + set.size, 0)
  const costPerHour = node?.gpu_type === 'A10' ? 1.60 : 0.526
  const weeklyCost = totalHours * costPerHour
  const monthlyCost = weeklyCost * 4.33

  if (!node) {
    return (
      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-8 text-center text-white/60">
        Select a VM above to configure its schedule
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">
          Schedule — {node.name}
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="text-xs bg-[#1a1a24] text-white/80 border border-[#2A2A35] rounded px-2 py-1"
          >
            <option value="manual">Manual</option>
            <option value="scheduled">Scheduled</option>
            <option value="ai_managed">AI Managed</option>
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded text-xs bg-[#D4AF37] text-black font-medium hover:bg-[#c4a030] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-xs text-white/60">
        <span>Weekly hours: <span className="text-white font-medium">{totalHours}h</span></span>
        <span>Est. weekly cost: <span className="text-white font-medium">${weeklyCost.toFixed(2)}</span></span>
        <span>Est. monthly: <span className="text-white font-medium">${monthlyCost.toFixed(2)}</span></span>
      </div>

      <div
        className="overflow-x-auto select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <table className="border-collapse w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="text-xs text-white/50 text-left py-1 px-1 w-20" />
              {HOURS.map((h) => (
                <th key={h} className="text-[10px] text-white/40 py-1 px-0 text-center w-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day) => (
              <tr key={day}>
                <td className="text-xs text-white/60 capitalize py-0.5 px-1">{day.slice(0, 3)}</td>
                {HOURS.map((h) => {
                  const active = grid[day]?.has(h) ?? false
                  return (
                    <td
                      key={h}
                      className="p-0"
                      onMouseDown={() => handleMouseDown(day, h)}
                      onMouseEnter={() => handleMouseEnter(day, h)}
                    >
                      <div
                        className={`w-5 h-5 mx-auto rounded-sm cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#D4AF37]'
                            : 'bg-[#1a1a24] hover:bg-[#2A2A35]'
                        }`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#D4AF37]" /> 3D Active
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#1a1a24] border border-[#2A2A35]" /> Cinematic / Off
        </span>
        <span className="ml-auto">Click and drag to toggle hours</span>
      </div>
    </div>
  )
}
