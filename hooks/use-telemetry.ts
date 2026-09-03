'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  HistoryRange,
  TelemetryHistoryResponse,
  TelemetrySnapshot,
} from '@/lib/telemetry'
import { getStoredRefreshIntervalMs } from '@/hooks/use-preferences'

interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

const initialState = { data: null, error: null, loading: true }

export function useTelemetryLatest(pollIntervalMs?: number) {
  const [state, setState] = useState<AsyncState<TelemetrySnapshot>>(initialState)
  const effectiveInterval = pollIntervalMs ?? getStoredRefreshIntervalMs()

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry/latest', { cache: 'no-store' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load telemetry')
      }

      const data = (await res.json()) as TelemetrySnapshot
      setState({ data, error: null, loading: false })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load telemetry',
        loading: false,
      }))
    }
  }, [])

  useEffect(() => {
    fetchLatest()
    const interval = setInterval(fetchLatest, effectiveInterval)
    return () => clearInterval(interval)
  }, [fetchLatest, effectiveInterval])

  return { ...state, refresh: fetchLatest }
}

export function useTelemetryHistory(range: HistoryRange, enabled = true) {
  const [state, setState] = useState<AsyncState<TelemetryHistoryResponse>>(initialState)

  const fetchHistory = useCallback(async () => {
    if (!enabled) return

    setState((prev) => ({ ...prev, loading: prev.data === null, error: null }))

    try {
      const res = await fetch(`/api/telemetry/history?range=${range}`, { cache: 'no-store' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load telemetry history')
      }

      const data = (await res.json()) as TelemetryHistoryResponse
      setState({ data, error: null, loading: false })
    } catch (err) {
      setState({
        data: null,
        error: err instanceof Error ? err.message : 'Failed to load telemetry history',
        loading: false,
      })
    }
  }, [enabled, range])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { ...state, refresh: fetchHistory }
}
