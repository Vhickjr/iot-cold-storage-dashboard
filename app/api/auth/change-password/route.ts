import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken } from '@/lib/server-auth'
import { tbChangePassword } from '@/lib/thingsboard'
import { isDevAuthBypassEnabled, isDevToken } from '@/lib/dev-auth'

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthToken()

    if (isDevAuthBypassEnabled() && isDevToken(token)) {
      return NextResponse.json(
        { error: 'Password changes are not available in demo mode.' },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 })
    }

    await tbChangePassword(token, currentPassword, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to change password'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
