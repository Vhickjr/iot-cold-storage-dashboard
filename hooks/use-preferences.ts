'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Preferences {
  notifyEmail: boolean
  notifySms: boolean
  notifyCriticalOnly: boolean
  telemetryRefreshIntervalMs: number
}

export const DEFAULT_PREFERENCES: Preferences = {
  notifyEmail: true,
  notifySms: true,
  notifyCriticalOnly: false,
  telemetryRefreshIntervalMs: 30000,
}

const STORAGE_KEY = 'cold-storage-preferences'

function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function getStoredRefreshIntervalMs(): number {
  return readPreferences().telemetryRefreshIntervalMs
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    setPreferences(readPreferences())
  }, [])

  const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage unavailable (private browsing, etc) — preference just won't persist
      }
      return next
    })
  }, [])

  return { preferences, setPreference }
}
