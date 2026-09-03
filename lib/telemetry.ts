export const TELEMETRY_KEYS = [
  'temperature',
  'humidity',
  'battery',
  'solarPower',
  'latitude',
  'longitude',
  'systemStatus',
] as const

export type TelemetryKey = (typeof TELEMETRY_KEYS)[number]

export interface TelemetrySnapshot {
  temperature: number | null
  humidity: number | null
  battery: number | null
  solarPower: number | null
  latitude: number | null
  longitude: number | null
  systemStatus: string | null
  timestamp: number
  source: 'thingsboard' | 'mock'
}

export interface TelemetryHistoryPoint {
  timestamp: number
  time: string
  temperature: number | null
  humidity: number | null
  battery: number | null
  solarPower: number | null
}

export interface DailyTelemetrySummary {
  date: string
  avgTemp: number
  maxTemp: number
  minTemp: number
  avgBattery: number
  maxBattery: number
  minBattery: number
  avgSolarPower: number
}

export interface TelemetryHistoryResponse {
  source: 'thingsboard' | 'mock'
  range: HistoryRange
  points: TelemetryHistoryPoint[]
  daily: DailyTelemetrySummary[]
}

export type HistoryRange = '24h' | '7d' | '30d' | '90d' | '365d'

const KEY_ALIASES: Record<string, TelemetryKey> = {
  temperature: 'temperature',
  temp: 'temperature',
  humidity: 'humidity',
  battery: 'battery',
  batteryLevel: 'battery',
  battery_level: 'battery',
  solarPower: 'solarPower',
  solar_power: 'solarPower',
  solar: 'solarPower',
  latitude: 'latitude',
  lat: 'latitude',
  longitude: 'longitude',
  lng: 'longitude',
  lon: 'longitude',
  systemStatus: 'systemStatus',
  system_status: 'systemStatus',
  status: 'systemStatus',
}

export function normalizeTelemetryKey(key: string): TelemetryKey | null {
  return KEY_ALIASES[key] ?? null
}

export function parseTelemetryValue(
  key: TelemetryKey,
  value: string | number | boolean
): number | string | null {
  if (key === 'systemStatus') {
    return String(value)
  }

  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

export function getRangeConfig(range: HistoryRange): {
  startTs: number
  endTs: number
  intervalMs: number
} {
  const endTs = Date.now()
  const ranges: Record<HistoryRange, { ms: number; intervalMs: number }> = {
    '24h': { ms: 24 * 60 * 60 * 1000, intervalMs: 5 * 60 * 1000 },
    '7d': { ms: 7 * 24 * 60 * 60 * 1000, intervalMs: 60 * 60 * 1000 },
    '30d': { ms: 30 * 24 * 60 * 60 * 1000, intervalMs: 6 * 60 * 60 * 1000 },
    '90d': { ms: 90 * 24 * 60 * 60 * 1000, intervalMs: 24 * 60 * 60 * 1000 },
    '365d': { ms: 365 * 24 * 60 * 60 * 1000, intervalMs: 24 * 60 * 60 * 1000 },
  }

  const config = ranges[range]
  return {
    startTs: endTs - config.ms,
    endTs,
    intervalMs: config.intervalMs,
  }
}

export function mapDateRangeSelection(selection: string): HistoryRange {
  switch (selection) {
    case 'month':
      return '30d'
    case 'quarter':
      return '90d'
    case 'year':
      return '365d'
    case 'week':
    default:
      return '7d'
  }
}

export function formatChartTime(timestamp: number, range: HistoryRange): string {
  const date = new Date(timestamp)
  if (range === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  if (range === '7d') {
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDayLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'short' })
}

export function buildDailySummaries(points: TelemetryHistoryPoint[]): DailyTelemetrySummary[] {
  const buckets = new Map<string, TelemetryHistoryPoint[]>()

  for (const point of points) {
    const dayKey = new Date(point.timestamp).toISOString().slice(0, 10)
    const bucket = buckets.get(dayKey) ?? []
    bucket.push(point)
    buckets.set(dayKey, bucket)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, dayPoints]) => {
      const temps = dayPoints.map((p) => p.temperature).filter((v): v is number => v !== null)
      const batteries = dayPoints.map((p) => p.battery).filter((v): v is number => v !== null)
      const solar = dayPoints.map((p) => p.solarPower).filter((v): v is number => v !== null)

      const avg = (values: number[]) =>
        values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0

      return {
        date: formatDayLabel(dayPoints[0]?.timestamp ?? Date.parse(`${dayKey}T12:00:00`)),
        avgTemp: round(avg(temps), 1),
        maxTemp: temps.length ? round(Math.max(...temps), 1) : 0,
        minTemp: temps.length ? round(Math.min(...temps), 1) : 0,
        avgBattery: round(avg(batteries), 1),
        maxBattery: batteries.length ? round(Math.max(...batteries), 1) : 0,
        minBattery: batteries.length ? round(Math.min(...batteries), 1) : 0,
        avgSolarPower: round(avg(solar), 0),
      }
    })
}

export function emptySnapshot(source: 'thingsboard' | 'mock'): TelemetrySnapshot {
  return {
    temperature: null,
    humidity: null,
    battery: null,
    solarPower: null,
    latitude: null,
    longitude: null,
    systemStatus: null,
    timestamp: Date.now(),
    source,
  }
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
