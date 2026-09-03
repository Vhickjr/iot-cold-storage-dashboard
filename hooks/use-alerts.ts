'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTelemetryLatest } from '@/hooks/use-telemetry'
import { getStoredRefreshIntervalMs } from '@/hooks/use-preferences'
import { TEMP_HIGH, TEMP_LOW, BATTERY_LOW, BATTERY_CRITICAL } from '@/lib/thresholds'
import type { TelemetrySnapshot } from '@/lib/telemetry'

export interface SystemAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning'
}

export interface AlertHistoryEvent {
  id: string
  title: string
  event: 'started' | 'cleared'
  timestamp: number
}

const ALERT_TITLES: Record<string, string> = {
  'temp-high': 'High Temperature Detected',
  'temp-low': 'Low Temperature Detected',
  'battery-critical': 'Critical Battery Level',
  'battery-low': 'Battery Low Warning',
  'stale-data': 'No Recent Telemetry',
}

const ACK_KEY = 'cold-storage-alerts-ack'
const HISTORY_KEY = 'cold-storage-alerts-history'
const OPEN_KEY = 'cold-storage-alerts-open'
const HISTORY_LIMIT = 50
const STALE_MULTIPLIER = 2

function readAckSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(ACK_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeAckSet(set: Set<string>) {
  try {
    window.localStorage.setItem(ACK_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage unavailable — acknowledgement just won't persist across reloads
  }
}

function readOpenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(OPEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeOpenIds(set: Set<string>) {
  try {
    window.localStorage.setItem(OPEN_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage unavailable — open-alert tracking just won't persist across reloads
  }
}

function readHistory(): AlertHistoryEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeHistory(events: AlertHistoryEvent[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(events.slice(-HISTORY_LIMIT)))
  } catch {
    // localStorage unavailable — history just won't persist across reloads
  }
}

export function evaluateAlerts(snapshot: TelemetrySnapshot): SystemAlert[] {
  const alerts: SystemAlert[] = []

  if (snapshot.temperature != null) {
    if (snapshot.temperature > TEMP_HIGH) {
      alerts.push({
        id: 'temp-high',
        title: ALERT_TITLES['temp-high'],
        description: `Temperature has exceeded the optimal range. Current: ${snapshot.temperature.toFixed(1)}°C (threshold: ${TEMP_HIGH}°C).`,
        severity: 'critical',
      })
    } else if (snapshot.temperature < TEMP_LOW) {
      alerts.push({
        id: 'temp-low',
        title: ALERT_TITLES['temp-low'],
        description: `Temperature has dropped below the optimal range. Current: ${snapshot.temperature.toFixed(1)}°C (threshold: ${TEMP_LOW}°C).`,
        severity: 'warning',
      })
    }
  }

  if (snapshot.battery != null) {
    if (snapshot.battery < BATTERY_CRITICAL) {
      alerts.push({
        id: 'battery-critical',
        title: ALERT_TITLES['battery-critical'],
        description: `Battery level is critically low. Current: ${snapshot.battery}% (critical threshold: ${BATTERY_CRITICAL}%).`,
        severity: 'critical',
      })
    } else if (snapshot.battery < BATTERY_LOW) {
      alerts.push({
        id: 'battery-low',
        title: ALERT_TITLES['battery-low'],
        description: `Battery level is below the warning threshold. Current: ${snapshot.battery}% (threshold: ${BATTERY_LOW}%).`,
        severity: 'warning',
      })
    }
  }

  const staleAfterMs = getStoredRefreshIntervalMs() * STALE_MULTIPLIER
  if (snapshot.timestamp && Date.now() - snapshot.timestamp > staleAfterMs) {
    const minutes = Math.round((Date.now() - snapshot.timestamp) / 60000)
    alerts.push({
      id: 'stale-data',
      title: ALERT_TITLES['stale-data'],
      description: `The last telemetry reading was ${minutes} minute${minutes === 1 ? '' : 's'} ago.`,
      severity: 'warning',
    })
  }

  return alerts
}

export function useSystemAlerts() {
  const { data } = useTelemetryLatest()
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<AlertHistoryEvent[]>([])

  useEffect(() => {
    setAcknowledged(readAckSet())
    setHistory(readHistory())
  }, [])

  const allActive = useMemo(() => (data ? evaluateAlerts(data) : []), [data])
  const activeIdsKey = allActive
    .map((a) => a.id)
    .sort()
    .join(',')

  // Multiple components mount their own instance of this hook (Header,
  // AlertsPanel, ...). localStorage — read and written fresh on every run,
  // never cached in a ref — is the single source of truth for "was this
  // condition already open", so concurrent instances converge instead of
  // each independently logging the same started/cleared transition.
  useEffect(() => {
    // Skip while telemetry hasn't loaded yet — every remount of a component
    // using this hook (e.g. switching tabs away from and back to Alerts)
    // starts with `data === null` for a moment, which must NOT be treated
    // as "zero active alerts", or it spuriously logs a clear+restart pair
    // for any condition that was already open.
    if (!data) return

    const currentIds = new Set(allActive.map((a) => a.id))
    const prevIds = readOpenIds()
    const events: AlertHistoryEvent[] = []
    let currentAck = readAckSet()
    let ackChanged = false

    for (const id of currentIds) {
      if (!prevIds.has(id)) {
        events.push({ id, title: ALERT_TITLES[id] ?? id, event: 'started', timestamp: Date.now() })
      }
    }

    for (const id of prevIds) {
      if (!currentIds.has(id)) {
        events.push({ id, title: ALERT_TITLES[id] ?? id, event: 'cleared', timestamp: Date.now() })
        if (currentAck.has(id)) {
          currentAck = new Set(currentAck)
          currentAck.delete(id)
          ackChanged = true
        }
      }
    }

    if (events.length) {
      writeOpenIds(currentIds)
      const next = [...readHistory(), ...events].slice(-HISTORY_LIMIT)
      writeHistory(next)
      setHistory(next)
    }

    if (ackChanged) {
      writeAckSet(currentAck)
      setAcknowledged(currentAck)
    }
    // Keyed on the id set plus whether data has loaded yet — not on `data`
    // itself, since telemetry polls every cycle with a new timestamp even
    // when nothing has actually changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdsKey, Boolean(data)])

  const acknowledge = useCallback((id: string) => {
    const next = readAckSet()
    next.add(id)
    writeAckSet(next)
    setAcknowledged(next)
  }, [])

  const active = allActive.filter((a) => !acknowledged.has(a.id))

  return {
    active,
    acknowledged,
    history: [...history].reverse(),
    acknowledge,
    unreadCount: active.length,
  }
}
