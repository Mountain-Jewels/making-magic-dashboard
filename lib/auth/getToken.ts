import { getMsalInstance, loginRequest } from './msalConfig'

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const instance = await getMsalInstance()
    const accounts = instance.getAllAccounts()
    if (!accounts.length) return null

    const result = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    })
    return result.accessToken
  } catch {
    return null
  }
}
