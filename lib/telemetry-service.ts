import {
  buildDailySummaries,
  emptySnapshot,
  formatChartTime,
  getRangeConfig,
  normalizeTelemetryKey,
  parseTelemetryValue,
  TELEMETRY_KEYS,
  type HistoryRange,
  type TelemetryHistoryPoint,
  type TelemetryHistoryResponse,
  type TelemetryKey,
  type TelemetrySnapshot,
} from '@/lib/telemetry'
import {
  getTbDeviceId,
  getTbEntityType,
  tbGetLatestTelemetry,
  tbGetTenantDevices,
  tbGetTimeseriesHistory,
  type TbTimeseriesResponse,
} from '@/lib/thingsboard'
import { isDevAuthBypassEnabled, isDevToken } from '@/lib/dev-auth'

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function mockValueAt(timestamp: number, key: TelemetryKey): number | string | null {
  const hour = new Date(timestamp).getHours()
  const daySeed = timestamp / (60 * 60 * 1000)
  const noise = (seededNoise(daySeed + key.length) - 0.5) * 0.4

  switch (key) {
    case 'temperature':
      return round(4 + Math.sin((hour - 6) / 12 * Math.PI) * 0.8 + noise, 1)
    case 'humidity':
      return round(clamp(55 + Math.cos((hour - 8) / 10 * Math.PI) * 12 + noise * 10, 35, 85), 0)
    case 'battery':
      return round(clamp(88 - (hour / 24) * 8 + noise * 4, 20, 100), 0)
    case 'solarPower':
      return round(hour >= 6 && hour <= 18 ? Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI) * 420 + noise * 30) : 0, 0)
    case 'latitude':
      return 6.5244 + noise * 0.001
    case 'longitude':
      return 3.3792 + noise * 0.001
    case 'systemStatus':
      return 'running'
    default:
      return null
  }
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function generateMockSnapshot(): TelemetrySnapshot {
  const timestamp = Date.now()
  const snapshot = emptySnapshot('mock')

  for (const key of TELEMETRY_KEYS) {
    const value = mockValueAt(timestamp, key)
    assignSnapshotValue(snapshot, key, value)
  }

  snapshot.timestamp = timestamp
  return snapshot
}

export function generateMockHistory(range: HistoryRange): TelemetryHistoryResponse {
  const { startTs, endTs, intervalMs } = getRangeConfig(range)
  const points: TelemetryHistoryPoint[] = []

  for (let ts = startTs; ts <= endTs; ts += intervalMs) {
    points.push({
      timestamp: ts,
      time: formatChartTime(ts, range),
      temperature: mockValueAt(ts, 'temperature') as number,
      humidity: mockValueAt(ts, 'humidity') as number,
      battery: mockValueAt(ts, 'battery') as number,
      solarPower: mockValueAt(ts, 'solarPower') as number,
    })
  }

  return {
    source: 'mock',
    range,
    points,
    daily: buildDailySummaries(points),
  }
}

function assignSnapshotValue(
  snapshot: TelemetrySnapshot,
  key: TelemetryKey,
  value: number | string | null
): void {
  if (key === 'systemStatus') {
    snapshot.systemStatus = typeof value === 'string' ? value : null
    return
  }

  snapshot[key] = typeof value === 'number' ? value : null
}

function parseTbResponse(
  data: TbTimeseriesResponse,
  source: 'thingsboard' | 'mock'
): TelemetrySnapshot {
  const snapshot = emptySnapshot(source)
  let latestTs = 0

  for (const [rawKey, entries] of Object.entries(data)) {
    const key = normalizeTelemetryKey(rawKey)
    if (!key || !entries?.length) continue

    const latest = entries.reduce((acc, entry) => (entry.ts >= acc.ts ? entry : acc), entries[0])
    latestTs = Math.max(latestTs, latest.ts)
    assignSnapshotValue(snapshot, key, parseTelemetryValue(key, latest.value))
  }

  snapshot.timestamp = latestTs || Date.now()
  return snapshot
}

function mergeTimeseriesToPoints(
  data: TbTimeseriesResponse,
  range: HistoryRange
): TelemetryHistoryPoint[] {
  const byTimestamp = new Map<number, TelemetryHistoryPoint>()

  for (const [rawKey, entries] of Object.entries(data)) {
    const key = normalizeTelemetryKey(rawKey)
    if (!key || key === 'latitude' || key === 'longitude' || key === 'systemStatus') continue
    if (!entries?.length) continue

    for (const entry of entries) {
      const existing = byTimestamp.get(entry.ts) ?? {
        timestamp: entry.ts,
        time: formatChartTime(entry.ts, range),
        temperature: null,
        humidity: null,
        battery: null,
        solarPower: null,
      }

      const parsed = parseTelemetryValue(key, entry.value)
      if (typeof parsed === 'number') {
        existing[key] = parsed
      }

      byTimestamp.set(entry.ts, existing)
    }
  }

  return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp)
}

export async function resolveDeviceId(token: string): Promise<string> {
  const configuredId = getTbDeviceId()
  if (configuredId) return configuredId

  const devices = await tbGetTenantDevices(token, 1)
  if (!devices.length) {
    throw new Error(
      'No ThingsBoard device found. Set THINGSBOARD_DEVICE_ID in .env.local or provision a device.'
    )
  }

  return devices[0].id.id
}

export function shouldUseMockTelemetry(token: string): boolean {
  return isDevAuthBypassEnabled() && isDevToken(token)
}

export async function fetchLatestTelemetry(token: string): Promise<TelemetrySnapshot> {
  if (shouldUseMockTelemetry(token)) {
    return generateMockSnapshot()
  }

  const entityId = await resolveDeviceId(token)
  const entityType = getTbEntityType()
  const data = await tbGetLatestTelemetry(token, entityType, entityId, [...TELEMETRY_KEYS])

  return parseTbResponse(data, 'thingsboard')
}

export async function fetchTelemetryHistory(
  token: string,
  range: HistoryRange
): Promise<TelemetryHistoryResponse> {
  if (shouldUseMockTelemetry(token)) {
    return generateMockHistory(range)
  }

  const entityId = await resolveDeviceId(token)
  const entityType = getTbEntityType()
  const { startTs, endTs, intervalMs } = getRangeConfig(range)
  const data = await tbGetTimeseriesHistory(
    token,
    entityType,
    entityId,
    ['temperature', 'humidity', 'battery', 'solarPower'],
    startTs,
    endTs,
    intervalMs
  )

  const points = mergeTimeseriesToPoints(data, range)

  return {
    source: 'thingsboard',
    range,
    points,
    daily: buildDailySummaries(points),
  }
}
