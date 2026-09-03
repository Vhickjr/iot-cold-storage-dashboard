function getTbUrl(): string {
  const url = process.env.THINGSBOARD_URL
  if (!url) throw new Error('THINGSBOARD_URL environment variable is not set')
  return url
}

export function getTbDeviceId(): string | null {
  return process.env.THINGSBOARD_DEVICE_ID ?? null
}

export type TbEntityType = 'DEVICE' | 'ASSET'

export function getTbEntityType(): TbEntityType {
  const type = process.env.THINGSBOARD_ENTITY_TYPE
  return type === 'ASSET' ? 'ASSET' : 'DEVICE'
}

export interface TbTelemetryEntry {
  ts: number
  value: string | number | boolean
}

export type TbTimeseriesResponse = Record<string, TbTelemetryEntry[]>

export interface ThingsBoardUser {
  id: { id: string }
  tenantId: { id: string }
  customerId?: { id: string }
  email: string
  authority: 'SYS_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER_USER'
  firstName?: string
  lastName?: string
  name: string
}

export interface ThingsBoardTokens {
  token: string
  refreshToken: string
}

export async function tbLogin(username: string, password: string): Promise<ThingsBoardTokens> {
  const res = await fetch(`${getTbUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Invalid credentials')
  }

  return res.json()
}

export async function tbGetCurrentUser(token: string): Promise<ThingsBoardUser> {
  const res = await fetch(`${getTbUrl()}/api/auth/user`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch user info')
  }

  return res.json()
}

export async function tbLogout(token: string): Promise<void> {
  await fetch(`${getTbUrl()}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {})
}

export async function tbRefreshToken(refreshToken: string): Promise<ThingsBoardTokens> {
  const res = await fetch(`${getTbUrl()}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    throw new Error('Failed to refresh token')
  }

  return res.json()
}

export function tbDisplayName(user: ThingsBoardUser): string {
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  }
  return user.name || user.email
}

export function tbRoleLabel(authority: ThingsBoardUser['authority']): string {
  switch (authority) {
    case 'SYS_ADMIN':
      return 'System Administrator'
    case 'TENANT_ADMIN':
      return 'Administrator'
    case 'CUSTOMER_USER':
      return 'Operator'
  }
}

export async function tbGetLatestTelemetry(
  token: string,
  entityType: TbEntityType,
  entityId: string,
  keys: string[]
): Promise<TbTimeseriesResponse> {
  const params = new URLSearchParams({ keys: keys.join(',') })
  const res = await fetch(
    `${getTbUrl()}/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries?${params}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to fetch latest telemetry')
  }

  return res.json()
}

export async function tbGetTimeseriesHistory(
  token: string,
  entityType: TbEntityType,
  entityId: string,
  keys: string[],
  startTs: number,
  endTs: number,
  intervalMs: number,
  limit = 500
): Promise<TbTimeseriesResponse> {
  const params = new URLSearchParams({
    keys: keys.join(','),
    startTs: String(startTs),
    endTs: String(endTs),
    interval: String(intervalMs),
    limit: String(limit),
    agg: 'AVG',
  })

  const res = await fetch(
    `${getTbUrl()}/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries?${params}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to fetch telemetry history')
  }

  return res.json()
}

export async function tbGetSharedAttributes(
  token: string,
  entityType: TbEntityType,
  entityId: string,
  keys?: string[]
): Promise<Record<string, string | number | boolean>> {
  const params = keys?.length ? `?keys=${keys.join(',')}` : ''
  const res = await fetch(
    `${getTbUrl()}/api/plugins/telemetry/${entityType}/${entityId}/values/attributes/SHARED_SCOPE${params}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to fetch shared attributes')
  }

  const entries: Array<{ key: string; value: string | number | boolean }> = await res.json()
  return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]))
}

export async function tbSaveSharedAttributes(
  token: string,
  entityType: TbEntityType,
  entityId: string,
  attributes: Record<string, unknown>
): Promise<void> {
  const res = await fetch(
    `${getTbUrl()}/api/plugins/telemetry/${entityType}/${entityId}/SHARED_SCOPE`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(attributes),
    }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to save shared attributes')
  }
}

export async function tbChangePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${getTbUrl()}/api/auth/changePassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to change password')
  }
}

export async function tbGetTenantDevices(
  token: string,
  pageSize = 10
): Promise<Array<{ id: { id: string }; name: string }>> {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    page: '0',
    sortProperty: 'createdTime',
    sortOrder: 'DESC',
  })

  const res = await fetch(`${getTbUrl()}/api/tenant/devices?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch devices')
  }

  const body = await res.json()
  return body.data ?? []
}
