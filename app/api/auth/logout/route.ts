import { NextRequest, NextResponse } from 'next/server'
import { tbLogout } from '@/lib/thingsboard'
import { isDevToken } from '@/lib/dev-auth'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('tb_token')?.value

  if (token && !isDevToken(token)) {
    await tbLogout(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('tb_token')
  response.cookies.delete('tb_refresh_token')
  response.cookies.delete('tb_user')

  return response
}
