import { NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { getTbDeviceId, getTbEntityType } from '@/lib/thingsboard'

export async function GET() {
  try {
    await requireAuthToken()
    return NextResponse.json({
      thingsboardUrl: process.env.THINGSBOARD_URL ?? null,
      deviceId: getTbDeviceId(),
      entityType: getTbEntityType(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch connection info'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
