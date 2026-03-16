/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { loginRequest } from '@/lib/auth/msalConfig'
import { useIsDevAuth } from '@/lib/auth/AuthProvider'

export function LoginGate({ children }: { children: React.ReactNode }) {
  const isDevMode = useIsDevAuth()

  if (isDevMode) {
    return <>{children}</>
  }

  return <MsalLoginGate>{children}</MsalLoginGate>
}

function MsalLoginGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const { inProgress, instance } = useMsal()

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0A0F] gap-4">
        <h1 className="text-xl font-semibold text-white">The Studio</h1>
        <p className="text-sm text-muted-foreground">Mountain Jewels Production Console</p>
        <button
          onClick={() => instance.loginRedirect(loginRequest)}
          className="mt-4 px-6 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          Sign in with Microsoft
        </button>
      </div>
    )
  }

  return <>{children}</>
}
