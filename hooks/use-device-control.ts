'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DeviceControlState } from '@/lib/device-control-service'

interface AsyncState {
  state: DeviceControlState | null
  error: string | null
  loading: boolean
  pending: boolean
}

const initialState: AsyncState = { state: null, error: null, loading: true, pending: false }

export function useDeviceControl() {
  const [asyncState, setAsyncState] = useState<AsyncState>(initialState)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/device/control', { cache: 'no-store' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load control state')
      }
      const state = (await res.json()) as DeviceControlState
      setAsyncState({ state, error: null, loading: false, pending: false })
    } catch (err) {
      setAsyncState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load control state',
        loading: false,
        pending: false,
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateState = useCallback(async (patch: Partial<DeviceControlState>) => {
    setAsyncState((prev) => ({ ...prev, pending: true, error: null }))
    try {
      const res = await fetch('/api/device/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to update control state')
      }
      const state = (await res.json()) as DeviceControlState
      setAsyncState({ state, error: null, loading: false, pending: false })
    } catch (err) {
      setAsyncState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update control state',
        pending: false,
      }))
    }
  }, [])

  const emergencyStop = useCallback(async () => {
    setAsyncState((prev) => ({ ...prev, pending: true, error: null }))
    try {
      const res = await fetch('/api/device/emergency-stop', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to trigger emergency stop')
      }
      const state = (await res.json()) as DeviceControlState
      setAsyncState({ state, error: null, loading: false, pending: false })
    } catch (err) {
      setAsyncState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to trigger emergency stop',
        pending: false,
      }))
    }
  }, [])

  return { ...asyncState, updateState, emergencyStop, refresh }
}
