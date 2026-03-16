/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { ConciergeIdleEvent } from '@/lib/api/concierge'

type IdlePhase = ConciergeIdleEvent

export interface IdleTrackerOptions {
  idleThresholdMs?: number
  onSignal: (event: ConciergeIdleEvent) => void | Promise<void>
}

export class IdleTracker {
  private readonly idleThresholdMs: number
  private readonly onSignal: IdleTrackerOptions['onSignal']
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private confirmTimer: ReturnType<typeof setTimeout> | null = null
  private phase: IdlePhase = 'active'

  private readonly events: Array<keyof WindowEventMap> = [
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
  ]

  private readonly onActivity = () => {
    if (this.phase !== 'active') {
      void this.emit('active')
    }
    this.phase = 'active'
    this.resetTimers()
  }

  constructor({ idleThresholdMs = 30000, onSignal }: IdleTrackerOptions) {
    this.idleThresholdMs = idleThresholdMs
    this.onSignal = onSignal
  }

  start(): void {
    this.events.forEach((eventName) => {
      window.addEventListener(eventName, this.onActivity, { passive: true })
    })
    this.resetTimers()
  }

  stop(): void {
    this.events.forEach((eventName) => {
      window.removeEventListener(eventName, this.onActivity)
    })
    this.clearTimers()
  }

  private resetTimers(): void {
    this.clearTimers()
    this.idleTimer = setTimeout(() => {
      this.phase = 'idle_imminent'
      void this.emit('idle_imminent')
      this.confirmTimer = setTimeout(() => {
        this.phase = 'idle_confirmed'
        void this.emit('idle_confirmed')
      }, this.idleThresholdMs)
    }, this.idleThresholdMs)
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
    if (this.confirmTimer) {
      clearTimeout(this.confirmTimer)
      this.confirmTimer = null
    }
  }

  private async emit(event: ConciergeIdleEvent): Promise<void> {
    await this.onSignal(event)
  }
}
