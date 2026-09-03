import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { fetchDeviceControlState, saveDeviceControlState } from '@/lib/device-control-service'

export async function GET() {
  try {
    const token = await requireAuthToken()
    const state = await fetchDeviceControlState(token)
    return NextResponse.json(state)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch control state'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthToken()
    const patch = await request.json()
    const state = await saveDeviceControlState(token, patch)
    return NextResponse.json(state)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update control state'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
