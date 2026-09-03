import { cookies } from 'next/headers'

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('tb_token')?.value ?? null
}

export async function requireAuthToken(): Promise<string> {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('Unauthorized')
  }
  return token
}
