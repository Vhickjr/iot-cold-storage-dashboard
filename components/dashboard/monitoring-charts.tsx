'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useTelemetryHistory } from '@/hooks/use-telemetry'
import { getStoredRefreshIntervalMs } from '@/hooks/use-preferences'
import {
  TEMP_HIGH,
  TEMP_LOW,
  BATTERY_LOW,
  BATTERY_CRITICAL,
  HUMIDITY_HIGH,
  HUMIDITY_LOW,
} from '@/lib/thresholds'

export default function MonitoringCharts() {
  const { data, error, loading, refresh } = useTelemetryHistory('24h')
  const chartData = data?.points ?? []
  const latest = chartData[chartData.length - 1]
  const showForecast = data?.source === 'mock'

  useEffect(() => {
    const interval = setInterval(refresh, getStoredRefreshIntervalMs())
    return () => clearInterval(interval)
  }, [refresh])

  if (loading && !chartData.length) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading telemetry from ThingsBoard…
      </div>
    )
  }

  if (error && !chartData.length) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data?.source === 'thingsboard'
            ? 'Last 24 hours from ThingsBoard'
            : 'Simulated 24-hour telemetry (dev mode)'}
        </span>
        <button type="button" onClick={refresh} className="text-primary hover:underline">
          Refresh
        </button>
      </div>

      {/* Temperature Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Temperature Trend{showForecast ? ' (with simulated forecast)' : ''}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e8ecf1',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              name="Temperature (°C)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            <ReferenceLine y={TEMP_HIGH} stroke="#f59e0b" strokeDasharray="3 3" name={`Upper Threshold (${TEMP_HIGH}°C)`} />
            <ReferenceLine y={TEMP_LOW} stroke="#10b981" strokeDasharray="3 3" name={`Lower Threshold (${TEMP_LOW}°C)`} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Optimal Range</p>
            <p className="text-foreground font-semibold">2°C - 6°C</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="text-foreground font-semibold">
              {latest?.temperature != null ? `${latest.temperature.toFixed(1)}°C` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Humidity Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Humidity Levels</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e8ecf1',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              name="Humidity (%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            <ReferenceLine y={HUMIDITY_HIGH} stroke="#f59e0b" strokeDasharray="3 3" name={`Max Threshold (${HUMIDITY_HIGH}%)`} />
            <ReferenceLine y={HUMIDITY_LOW} stroke="#10b981" strokeDasharray="3 3" name={`Min Threshold (${HUMIDITY_LOW}%)`} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Battery & Solar Power Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Battery Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e8ecf1',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="battery"
                stroke="#f59e0b"
                name="Battery (%)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <ReferenceLine y={BATTERY_LOW} stroke="#f59e0b" strokeDasharray="3 3" name={`Low Threshold (${BATTERY_LOW}%)`} />
              <ReferenceLine y={BATTERY_CRITICAL} stroke="#ef4444" strokeDasharray="3 3" name={`Critical Level (${BATTERY_CRITICAL}%)`} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Solar Power Output</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e8ecf1',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="solarPower"
                stroke="#8b5cf6"
                name="Solar Power (W)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
