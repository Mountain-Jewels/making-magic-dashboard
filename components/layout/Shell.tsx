/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar } from './TopBar'
import { SidebarMenu } from './SidebarMenu'
import { ChatBox } from './ChatBox'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { useSceneStore } from '@/lib/stores/scene-store'
import { exportToShopify } from '@/lib/api/export'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deployConfirmOpen, setDeployConfirmOpen] = useState(false)
  const [deploySubmitting, setDeploySubmitting] = useState(false)
  const { currentScene, scenes, updateScene } = useSceneStore()
  const scene = currentScene ?? scenes[0]

  const handleDeployClick = () => setDeployConfirmOpen(true)
  const handleDeployConfirm = async () => {
    if (!scene) {
      toast.error('No scene to deploy')
      return
    }
    setDeploySubmitting(true)
    try {
      await exportToShopify(scene.id, scene.name, undefined)
      updateScene(scene.id, { status: 'pending_review' })
      toast.success('Sent to governance review')
      setDeployConfirmOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Deploy failed')
    } finally {
      setDeploySubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden w-full max-w-full min-w-0" style={{ backgroundColor: '#0A0A0F' }}>
      <KeyboardShortcuts />
      <TopBar
        onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)}
        onDeploy={handleDeployClick}
      />
      <Dialog open={deployConfirmOpen} onOpenChange={setDeployConfirmOpen}>
        <DialogContent className="bg-surface-panel border-surface-border">
          <DialogHeader>
            <DialogTitle>Send to governance review?</DialogTitle>
            <DialogDescription>
              Your scene will be submitted for review. You can track its status in the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployConfirmOpen(false)} disabled={deploySubmitting}>
              Cancel
            </Button>
            <Button onClick={handleDeployConfirm} disabled={deploySubmitting} className="bg-brand-gold text-black hover:bg-brand-gold/90">
              {deploySubmitting ? 'Sending...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-1 min-h-0 min-w-0 w-full overflow-hidden">
        {/* Sidebar: visible on md+, hidden on mobile */}
        <aside className="hidden md:flex w-60 flex-shrink-0 flex-col overflow-hidden">
          <SidebarMenu />
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
              className="absolute left-0 top-0 bottom-0 w-60 flex flex-col bg-[#0A0A0F] z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarMenu onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <main className="flex-1 min-h-0 overflow-auto w-full">
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
          <ChatBox />
        </div>
      </div>
    </div>
  )
}
