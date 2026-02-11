'use client'

import { usePathname } from 'next/navigation'
import { Shell } from './Shell'

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
