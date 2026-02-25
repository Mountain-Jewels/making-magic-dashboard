'use client'

import { useMsal } from '@azure/msal-react'
import { jwtDecode } from 'jwt-decode'
import { useCallback } from 'react'

import { loginRequest } from './msalConfig'

interface TokenPayload {
  roles?: string[]
  sub?: string
  name?: string
  preferred_username?: string
}

export function useAuth() {
  const { instance, accounts } = useMsal()

  const isAuthenticated = accounts.length > 0

  const login = useCallback(async () => {
    await instance.loginRedirect(loginRequest)
  }, [instance])

  const logout = useCallback(async () => {
    await instance.logoutRedirect()
  }, [instance])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accounts.length) return null
    try {
      const result = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      return result.accessToken
    } catch {
      await instance.acquireTokenRedirect(loginRequest)
      return null
    }
  }, [instance, accounts])

  const getRoles = useCallback(async (): Promise<string[]> => {
    const token = await getAccessToken()
    if (!token) return []
    try {
      const decoded = jwtDecode<TokenPayload>(token)
      return decoded.roles ?? []
    } catch {
      return []
    }
  }, [getAccessToken])

  const isAdmin = useCallback(async (): Promise<boolean> => {
    const roles = await getRoles()
    return roles.includes('admin')
  }, [getRoles])

  return {
    isAuthenticated,
    accounts,
    login,
    logout,
    getAccessToken,
    getRoles,
    isAdmin,
    userName: accounts[0]?.name ?? accounts[0]?.username ?? null,
  }
}
