'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedScreenProps {
  children: ReactNode
  screenKey: string
}

export function AnimatedScreen({ children, screenKey }: AnimatedScreenProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

