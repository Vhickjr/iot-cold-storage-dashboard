import { NextRequest, NextResponse } from 'next/server'
import { tbLogin, tbGetCurrentUser, tbDisplayName } from '@/lib/thingsboard'
import {
  createDevUser,
  DEV_MOCK_TOKEN,
  isDevAuthBypassEnabled,
  setAuthCookies,
} from '@/lib/dev-auth'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (isDevAuthBypassEnabled()) {
    const user = createDevUser(username)
    const response = NextResponse.json({ success: true, user })
    setAuthCookies(
      response,
      { token: DEV_MOCK_TOKEN, refreshToken: DEV_MOCK_TOKEN },
      user
    )
    return response
  }

  let tokens
  try {
    tokens = await tbLogin(username, password)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid credentials' },
      { status: 401 }
    )
  }

  let tbUser
  try {
    tbUser = await tbGetCurrentUser(tokens.token)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 })
  }

  const user = {
    id: tbUser.id.id,
    email: tbUser.email,
    name: tbDisplayName(tbUser),
    authority: tbUser.authority,
  }

  const response = NextResponse.json({ success: true, user })
  setAuthCookies(response, tokens, user)

  return response
}
