// © 2026 Mountain Jewels LLC. All rights reserved.

import { useState, useEffect, useRef } from 'react'

export interface RunProgress {
  status: string
  pages_scraped: number
  pages_total: number
  current_source: string
  errors_count: number
  progress_pct: number
  elapsed_seconds: number
}

function getWsUrl(runId: string): string {
  const base = process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'http://localhost:8000'
  const wsBase = base.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')
  return `${wsBase}/ws/runs/${runId}`
}

export function useRunProgress(runId: string | null) {
  const [progress, setProgress] = useState<RunProgress | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const terminalRef = useRef(false)
  const maxRetries = 3
  const backoffMs = 2000

  useEffect(() => {
    if (!runId) {
      setProgress(null)
      setConnected(false)
      setError(null)
      terminalRef.current = false
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>
    terminalRef.current = false

    const connect = () => {
      if (cancelled) return
      const url = getWsUrl(runId!)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) {
          ws.close()
          return
        }
        setConnected(true)
        setError(null)
        retryCountRef.current = 0
      }

      ws.onmessage = (event) => {
        if (cancelled) return
        try {
          const data = JSON.parse(event.data)
          if (data.error) {
            setError(data.error)
            setProgress(null)
            terminalRef.current = true
            ws.close()
            return
          }
          setProgress(data)
          if (['completed', 'failed', 'cancelled'].includes(data.status)) {
            terminalRef.current = true
            ws.close()
          }
        } catch {
          setError('Invalid message')
        }
      }

      ws.onerror = () => {
        if (cancelled) return
        setError('Connection error')
      }

      ws.onclose = () => {
        if (cancelled) return
        setConnected(false)
        wsRef.current = null
        if (retryCountRef.current < maxRetries && !terminalRef.current) {
          timeoutId = setTimeout(() => {
            retryCountRef.current += 1
            connect()
          }, backoffMs)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setProgress(null)
      setConnected(false)
    }
  }, [runId])

  return { progress, connected, error }
}
