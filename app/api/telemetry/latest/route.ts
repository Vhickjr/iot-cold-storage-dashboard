import { NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { fetchLatestTelemetry } from '@/lib/telemetry-service'

export async function GET() {
  try {
    const token = await requireAuthToken()
    const snapshot = await fetchLatestTelemetry(token)
    return NextResponse.json(snapshot)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch telemetry'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
