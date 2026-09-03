import { NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { triggerEmergencyStop } from '@/lib/device-control-service'

export async function POST() {
  try {
    const token = await requireAuthToken()
    const state = await triggerEmergencyStop(token)
    return NextResponse.json(state)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to trigger emergency stop'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
