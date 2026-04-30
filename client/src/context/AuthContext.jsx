import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as loginApi, logout as logoutApi } from '../api/hrmApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const me = await getCurrentUser()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const login = useCallback(async (username, password) => {
    await loginApi(username, password)
    await loadCurrentUser()
  }, [loadCurrentUser])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // ignore logout failures and clear local state anyway
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
