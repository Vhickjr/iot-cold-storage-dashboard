'use client'

import { Thermometer, Droplets, Battery, AlertTriangle, Loader2 } from 'lucide-react'
import { useTelemetryLatest } from '@/hooks/use-telemetry'

interface StatusIndicatorProps {
  value: number | string
  unit: string
  label: string
  icon: React.ReactNode
  status: 'good' | 'warning' | 'critical'
}

function StatusCard({ value, unit, label, icon, status }: StatusIndicatorProps) {
  const statusColors = {
    good: 'border-success bg-success/10 text-success',
    warning: 'border-warning bg-warning/10 text-warning',
    critical: 'border-error bg-error/10 text-error',
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
      <div className={`p-3 rounded-lg border ${statusColors[status]}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
        </div>
        <p className={`text-xs mt-2 ${status === 'good' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-error'}`}>
          Status: {status === 'good' ? 'Normal' : status === 'warning' ? 'Warning' : 'Critical'}
        </p>
      </div>
    </div>
  )
}

function formatValue(value: number | null, digits = 1): string {
  return value === null ? '—' : value.toFixed(digits)
}

export default function SystemOverview() {
  const { data, error, loading, refresh } = useTelemetryLatest()

  const temperature = data?.temperature ?? null
  const humidity = data?.humidity ?? null
  const battery = data?.battery ?? null
  const systemStatus = data?.systemStatus ?? (temperature !== null ? 'running' : null)

  const tempStatus =
    temperature === null ? 'warning' : temperature < 6 && temperature >= 2 ? 'good' : 'critical'
  const humidityStatus =
    humidity === null ? 'warning' : humidity > 80 ? 'warning' : humidity < 35 ? 'warning' : 'good'
  const batteryStatus =
    battery === null ? 'warning' : battery > 50 ? 'good' : battery > 20 ? 'warning' : 'critical'
  const systemStatusLabel =
    systemStatus === null
      ? '—'
      : systemStatus.toLowerCase() === 'running'
        ? 'Running'
        : systemStatus

  const hasReadings =
    temperature !== null || humidity !== null || battery !== null || data?.solarPower !== null

  const statusMessage = error
    ? `Telemetry unavailable: ${error}`
    : data?.source === 'thingsboard' && !hasReadings
      ? 'Connected to ThingsBoard — waiting for device telemetry (all values are empty)'
      : data?.source === 'thingsboard'
        ? 'Live data from ThingsBoard'
        : 'Simulated telemetry (dev mode)'

  return (
    <div className="space-y-4">
      {(loading || error || data) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{statusMessage}</span>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={refresh}
              className="text-primary hover:underline"
            >
              Refresh
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          value={formatValue(temperature)}
          unit="°C"
          label="Current Temperature"
          icon={<Thermometer className="w-6 h-6" />}
          status={tempStatus}
        />

        <StatusCard
          value={humidity === null ? '—' : Math.round(humidity).toString()}
          unit="%"
          label="Humidity Level"
          icon={<Droplets className="w-6 h-6" />}
          status={humidityStatus}
        />

        <StatusCard
          value={battery === null ? '—' : Math.round(battery).toString()}
          unit="%"
          label="Battery Level"
          icon={<Battery className="w-6 h-6" />}
          status={batteryStatus}
        />

        <StatusCard
          value={systemStatusLabel}
          unit=""
          label="System Status"
          icon={<AlertTriangle className="w-6 h-6" />}
          status={systemStatus?.toLowerCase() === 'running' ? 'good' : 'warning'}
        />
      </div>
    </div>
  )
}
