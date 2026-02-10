'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from './TopBar'
import { ToolBar } from './ToolBar'
import { BottomBar } from './BottomBar'
import { KeyboardShortcuts } from './KeyboardShortcuts'

function useMinWidth(width: number) {
  const [ok, setOk] = useState(true)
  useEffect(() => {
    setOk(window.innerWidth >= width)
    const mql = window.matchMedia(`(min-width: ${width}px)`)
    const handler = () => setOk(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [width])
  return ok
}

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWideEnough = useMinWidth(1024)

  return (
    <div className="flex flex-col h-screen overflow-hidden min-w-0" style={{ backgroundColor: '#0A0A0F' }}>
      <KeyboardShortcuts />
      {!isWideEnough && (
        <div
          className="flex-shrink-0 px-4 py-2 bg-amber-900/30 border-b border-amber-700/50 text-amber-200 text-sm text-center"
          role="status"
        >
          For the best experience, use a screen at least 1024px wide.
        </div>
      )}
      <TopBar />
      <div className="flex flex-1 min-h-0 min-w-[1024px]">
        <ToolBar />
        <main className="flex-1 min-w-0 overflow-auto">
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
      <BottomBar />
    </div>
  )
}
