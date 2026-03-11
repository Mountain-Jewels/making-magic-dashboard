'use client'

import { MsalProvider } from '@azure/msal-react'
import { type PublicClientApplication } from '@azure/msal-browser'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

import { getMsalInstance } from './msalConfig'

const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? 'dev'

const DevAuthContext = createContext<boolean>(false)
export function useIsDevAuth() {
  return useContext(DevAuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const initializing = useRef(false)

  const isDevMode = AUTH_MODE === 'dev' ||
    !process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID ||
    !process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID

  useEffect(() => {
    if (isDevMode || initializing.current) return
    initializing.current = true

    getMsalInstance()
      .then(setInstance)
      .catch((e) => setError(String(e)))
  }, [isDevMode])

  if (isDevMode) {
    return <DevAuthContext.Provider value={true}>{children}</DevAuthContext.Provider>
  }

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
