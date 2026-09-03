import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { fetchTelemetryHistory } from '@/lib/telemetry-service'
import type { HistoryRange } from '@/lib/telemetry'

const VALID_RANGES: HistoryRange[] = ['24h', '7d', '30d', '90d', '365d']

function parseRange(value: string | null): HistoryRange {
  if (value && VALID_RANGES.includes(value as HistoryRange)) {
    return value as HistoryRange
  }
  return '24h'
}

export async function GET(request: NextRequest) {
  try {
    const token = await requireAuthToken()
    const range = parseRange(request.nextUrl.searchParams.get('range'))
    const history = await fetchTelemetryHistory(token, range)
    return NextResponse.json(history)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch telemetry history'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
