'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  name: string
  authority: 'SYS_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER_USER'
}

interface AuthContextValue {
  user: AuthUser | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUserCookie(): AuthUser | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)tb_user=([^;]*)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(readUserCookie())
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
