import { NextResponse } from 'next/server'
import type { AuthUser } from '@/contexts/auth-context'

export const DEV_MOCK_TOKEN = 'dev-bypass-token'

export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_AUTH_BYPASS === 'true'
  )
}

export function isDevToken(token: string): boolean {
  return token === DEV_MOCK_TOKEN
}

export function createDevUser(email: string): AuthUser {
  return {
    id: 'dev-user-id',
    email: email || 'dev@localhost',
    name: 'Dev User',
    authority: 'TENANT_ADMIN',
  }
}

const SECURE = process.env.NODE_ENV === 'production'
const TOKEN_MAX_AGE = 60 * 60 * 9

export function setAuthCookies(
  response: NextResponse,
  tokens: { token: string; refreshToken: string },
  user: AuthUser
) {
  const cookieOpts = {
    secure: SECURE,
    sameSite: 'lax' as const,
    path: '/',
  }

  response.cookies.set('tb_token', tokens.token, {
    ...cookieOpts,
    httpOnly: true,
    maxAge: TOKEN_MAX_AGE,
  })

  response.cookies.set('tb_refresh_token', tokens.refreshToken, {
    ...cookieOpts,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  })

  // Next.js's cookie serializer already URI-encodes the value when writing
  // the Set-Cookie header — encoding it again here double-encodes it, which
  // breaks the single decodeURIComponent() on the reading side (auth-context.tsx).
  response.cookies.set('tb_user', JSON.stringify(user), {
    ...cookieOpts,
    httpOnly: false,
    maxAge: TOKEN_MAX_AGE,
  })
}
