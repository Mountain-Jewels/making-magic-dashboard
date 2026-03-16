/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { type Configuration, PublicClientApplication } from '@azure/msal-browser'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const loginRequest = {
  get scopes() {
    const apiClientId = process.env.NEXT_PUBLIC_AZURE_AD_API_CLIENT_ID
    return apiClientId ? [`api://${apiClientId}/access_as_user`] : []
  },
}

let _instance: PublicClientApplication | null = null
let _ready: Promise<PublicClientApplication> | null = null

export function getMsalInstance(): Promise<PublicClientApplication> {
  if (_ready) return _ready

  const clientId = requireEnv('NEXT_PUBLIC_AZURE_AD_CLIENT_ID')
  const tenantId = requireEnv('NEXT_PUBLIC_AZURE_AD_TENANT_ID')

  _ready = (async () => {
    const config: Configuration = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    }

    _instance = new PublicClientApplication(config)
    await _instance.initialize()
    await _instance.handleRedirectPromise()
    return _instance
  })()

  return _ready
}
