import { getTbEntityType, tbGetSharedAttributes, tbSaveSharedAttributes } from '@/lib/thingsboard'
import { isDevAuthBypassEnabled, isDevToken } from '@/lib/dev-auth'
import { resolveDeviceId } from '@/lib/telemetry-service'

export interface DeviceControlState {
  systemOn: boolean
  compressorOn: boolean
  temperatureSetpoint: number
  controlMode: 'automatic' | 'manual'
  lastEmergencyStopAt: number | null
}

const DEFAULT_STATE: DeviceControlState = {
  systemOn: true,
  compressorOn: true,
  temperatureSetpoint: 4,
  controlMode: 'automatic',
  lastEmergencyStopAt: null,
}

// Mock mode has no real ThingsBoard device to persist to, so we keep an
// in-memory copy for the life of the dev server process (resets on restart).
let mockState: DeviceControlState = { ...DEFAULT_STATE }

function shouldUseMockControl(token: string): boolean {
  return isDevAuthBypassEnabled() && isDevToken(token)
}

function coerceState(attrs: Record<string, unknown>): DeviceControlState {
  return {
    systemOn: typeof attrs.systemOn === 'boolean' ? attrs.systemOn : DEFAULT_STATE.systemOn,
    compressorOn:
      typeof attrs.compressorOn === 'boolean' ? attrs.compressorOn : DEFAULT_STATE.compressorOn,
    temperatureSetpoint:
      typeof attrs.temperatureSetpoint === 'number'
        ? attrs.temperatureSetpoint
        : DEFAULT_STATE.temperatureSetpoint,
    controlMode: attrs.controlMode === 'manual' ? 'manual' : 'automatic',
    lastEmergencyStopAt:
      typeof attrs.lastEmergencyStopAt === 'number' ? attrs.lastEmergencyStopAt : null,
  }
}

export async function fetchDeviceControlState(token: string): Promise<DeviceControlState> {
  if (shouldUseMockControl(token)) {
    return { ...mockState }
  }

  const entityId = await resolveDeviceId(token)
  const entityType = getTbEntityType()
  const attrs = await tbGetSharedAttributes(token, entityType, entityId, [
    'systemOn',
    'compressorOn',
    'temperatureSetpoint',
    'controlMode',
    'lastEmergencyStopAt',
  ])

  return coerceState(attrs)
}

export async function saveDeviceControlState(
  token: string,
  patch: Partial<DeviceControlState>
): Promise<DeviceControlState> {
  if (shouldUseMockControl(token)) {
    mockState = { ...mockState, ...patch }
    return { ...mockState }
  }

  const entityId = await resolveDeviceId(token)
  const entityType = getTbEntityType()
  await tbSaveSharedAttributes(token, entityType, entityId, patch)

  return fetchDeviceControlState(token)
}

export async function triggerEmergencyStop(token: string): Promise<DeviceControlState> {
  return saveDeviceControlState(token, {
    systemOn: false,
    lastEmergencyStopAt: Date.now(),
  })
}
