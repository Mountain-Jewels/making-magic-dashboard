import { type Configuration, PublicClientApplication } from '@azure/msal-browser'

const CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID ?? 'ad3343de-67f5-46b9-b3f8-1cb1af5986fd'
const TENANT_ID = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID ?? 'b4942887-4cc7-45cc-a5ff-072c25936868'
const API_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_AD_API_CLIENT_ID ?? 'a2853166-d276-44a3-bb88-5f12aaca2ee6'

export const loginRequest = {
  scopes: [`api://${API_CLIENT_ID}/access_as_user`],
}

let _instance: PublicClientApplication | null = null
let _ready: Promise<PublicClientApplication> | null = null

export function getMsalInstance(): Promise<PublicClientApplication> {
  if (_ready) return _ready

  _ready = (async () => {
    const config: Configuration = {
      auth: {
        clientId: CLIENT_ID,
        authority: `https://login.microsoftonline.com/${TENANT_ID}`,
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
