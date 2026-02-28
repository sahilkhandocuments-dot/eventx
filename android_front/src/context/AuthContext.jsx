import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [token, setToken]             = useState(null)
  const [role, setRole]               = useState(null)
  const [interestsSet, setInterestsSet] = useState(false)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        const storedRole  = await AsyncStorage.getItem('role')
        if (!storedToken) { setLoading(false); return }
        setToken(storedToken)
        setRole(storedRole)
        const res = await getMe()
        setUser(res.data)
        setRole(res.data.role)
        setInterestsSet(res.data.interests_set)
      } catch {
        await AsyncStorage.multiRemove(['token', 'role'])
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  const saveAuth = useCallback(async ({ access_token, role, interests_set }) => {
    await AsyncStorage.setItem('token', access_token)
    await AsyncStorage.setItem('role', role)
    setToken(access_token)
    setRole(role)
    setInterestsSet(interests_set)
  }, [])

  const clearAuth = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'role'])
    setToken(null)
    setRole(null)
    setUser(null)
    setInterestsSet(false)
  }, [])

  const value = {
    user,
    token,
    role,
    interestsSet,
    setInterestsSet,
    loading,
    isLoggedIn: !!token,
    isAdmin: role === 'admin',
    isOrganizer: role === 'organizer' || role === 'admin',
    saveAuth,
    logout: clearAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
