'use client'

import { useEffect, useState } from 'react'
import { Thermometer, Droplets, Battery, AlertTriangle } from 'lucide-react'

interface StatusIndicatorProps {
  value: number
  unit: string
  label: string
  icon: React.ReactNode
  status: 'good' | 'warning' | 'critical'
  min?: number
  max?: number
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
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>
        <p className={`text-xs mt-2 ${status === 'good' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-error'}`}>
          Status: {status === 'good' ? 'Normal' : status === 'warning' ? 'Warning' : 'Critical'}
        </p>
      </div>
    </div>
  )
}

export default function SystemOverview() {
  const [systemData, setSystemData] = useState({
    temperature: 4.2,
    humidity: 65,
    battery: 78,
    status: 'running' as const,
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemData((prev) => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        humidity: Math.max(30, Math.min(95, prev.humidity + (Math.random() - 0.5) * 2)),
        battery: Math.max(0, Math.min(100, prev.battery + (Math.random() - 0.5) * 1)),
        status: 'running',
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        value={Math.round(systemData.temperature * 10) / 10}
        unit="°C"
        label="Current Temperature"
        icon={<Thermometer className="w-6 h-6" />}
        status={systemData.temperature < 6 ? 'good' : 'critical'}
      />

      <StatusCard
        value={Math.round(systemData.humidity)}
        unit="%"
        label="Humidity Level"
        icon={<Droplets className="w-6 h-6" />}
        status={systemData.humidity > 80 ? 'warning' : 'good'}
      />

      <StatusCard
        value={Math.round(systemData.battery)}
        unit="%"
        label="Battery Level"
        icon={<Battery className="w-6 h-6" />}
        status={systemData.battery > 50 ? 'good' : systemData.battery > 20 ? 'warning' : 'critical'}
      />

      <StatusCard
        value={1}
        unit=""
        label="System Status"
        icon={<AlertTriangle className="w-6 h-6" />}
        status="good"
      />
    </div>
  )
}
