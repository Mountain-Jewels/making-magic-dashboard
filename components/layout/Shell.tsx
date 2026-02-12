/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { TopBar } from './TopBar'
import { ToolBar } from './ToolBar'
import { BottomBar } from './BottomBar'
import { KeyboardShortcuts } from './KeyboardShortcuts'

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden w-full max-w-full min-w-0" style={{ backgroundColor: '#0A0A0F' }}>
      <KeyboardShortcuts />
      <TopBar onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)} />
      <div className="flex flex-1 min-h-0 min-w-0 w-full overflow-hidden">
        {/* Sidebar: visible on md+, hidden on mobile */}
        <aside className="hidden md:flex w-14 flex-shrink-0 flex-col border-r border-surface-border overflow-hidden">
          <ToolBar />
        </aside>
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          >
            <div className="absolute inset-0 bg-black/50" />
            <aside
              className="absolute left-0 top-0 bottom-0 w-14 flex flex-col border-r border-surface-border bg-[#0A0A0F] z-50 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              <ToolBar onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}
        <main className="flex-1 min-w-0 min-h-0 overflow-auto w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              className="h-full min-h-full"
              {...pageTransition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <div className="flex-shrink-0">
        <BottomBar />
      </div>
    </div>
  )
}
