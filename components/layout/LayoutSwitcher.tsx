'use client'

import { usePathname } from 'next/navigation'
import { Shell } from './Shell'

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCreateV2 = pathname?.startsWith('/create')

  if (isCreateV2) {
    return <>{children}</>
  }

  return <Shell>{children}</Shell>
}
