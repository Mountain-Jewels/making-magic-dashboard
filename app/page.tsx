'use client'

import { useDashboardStore } from '@/lib/store/dashboard'
import { LeftRail } from '@/components/layout/LeftRail'
import { MainCanvas } from '@/components/layout/MainCanvas'
import { RightRail } from '@/components/layout/RightRail'

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-900">
      <LeftRail />
      <MainCanvas />
      <RightRail />
    </div>
  )
}

