'use client'

import { MsalProvider } from '@azure/msal-react'
import { type PublicClientApplication } from '@azure/msal-browser'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { getMsalInstance } from './msalConfig'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const initializing = useRef(false)

  useEffect(() => {
    if (initializing.current) return
    initializing.current = true

    getMsalInstance()
      .then(setInstance)
      .catch((e) => setError(String(e)))
  }, [])

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-sm text-red-400">Auth init failed: {error}</p>
      </div>
    )
  }

  if (!instance) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-sm text-[#8B8B9E]">Loading...</p>
      </div>
    )
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>
}
