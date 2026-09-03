'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTelemetryHistory } from '@/hooks/use-telemetry'
import { mapDateRangeSelection } from '@/lib/telemetry'

function average(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function variance(values: number[]): number {
  if (values.length < 2) return 0
  const mean = average(values)
  return average(values.map((value) => (value - mean) ** 2))
}

export default function HistoricalAnalysis() {
  const [dateRange, setDateRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('temperature')
  const historyRange = mapDateRangeSelection(dateRange)
  const { data, error, loading, refresh } = useTelemetryHistory(historyRange)

  const dailyData = data?.daily ?? []

  const temperatureStats = useMemo(() => {
    const temps = dailyData.map((day) => day.avgTemp).filter((value) => value > 0)
    const outOfRange = dailyData.reduce((count, day) => {
      return count + (day.maxTemp > 6 || day.minTemp < 2 ? 1 : 0)
    }, 0)

    return {
      average: average(temps),
      variance: variance(temps),
      outOfRange,
    }
  }, [dailyData])

  const batteryStats = useMemo(() => {
    const batteries = dailyData.map((day) => day.avgBattery).filter((value) => value > 0)
    const avgBattery = average(batteries)
    const dischargeEstimate = Math.max(0, 100 - avgBattery)

    return {
      avgCharge: avgBattery,
      avgDischarge: dischargeEstimate,
      health: avgBattery >= 70 ? 'Excellent' : avgBattery >= 50 ? 'Good' : 'Fair',
    }
  }, [dailyData])

  const batteryUsageData = dailyData.map((day) => ({
    date: day.date,
    charge: day.avgBattery,
    discharge: Math.max(0, 100 - day.avgBattery),
  }))

  const uptimeData = dailyData.map((day) => ({
    date: day.date,
    uptime: day.avgBattery > 15 ? 99.5 + Math.min(day.avgBattery / 100, 0.4) : 95,
  }))

  if (loading && !dailyData.length) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading historical telemetry…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data?.source === 'thingsboard'
            ? 'Historical data from ThingsBoard'
            : 'Simulated historical telemetry (dev mode)'}
        </span>
        <button type="button" onClick={refresh} className="text-primary hover:underline">
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="temperature">Temperature Trends</option>
              <option value="battery">Battery Usage</option>
              <option value="uptime">System Uptime</option>
            </select>
          </div>
        </div>
      </div>

      {/* Temperature Trends */}
      {selectedMetric === 'temperature' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Temperature Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
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
                dataKey="avgTemp"
                stroke="#3b82f6"
                name="Average"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="maxTemp"
                stroke="#f59e0b"
                name="Maximum"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                stroke="#10b981"
                name="Minimum"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Temperature</p>
              <p className="text-2xl font-bold text-foreground">
                {temperatureStats.average.toFixed(1)}°C
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Temperature Variance</p>
              <p className="text-2xl font-bold text-foreground">
                {temperatureStats.variance.toFixed(2)}°C
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Out of Range Days</p>
              <p className="text-2xl font-bold text-warning">{temperatureStats.outOfRange}</p>
            </div>
          </div>
        </div>
      )}

      {/* Battery Usage */}
      {selectedMetric === 'battery' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Battery Usage Analysis</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={batteryUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
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
              <Bar dataKey="charge" stackId="a" fill="#10b981" name="Avg Battery Level (%)" />
              <Bar dataKey="discharge" stackId="a" fill="#f59e0b" name="Estimated Discharge (%)" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Battery Level</p>
              <p className="text-2xl font-bold text-foreground">
                {batteryStats.avgCharge.toFixed(1)}%
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Discharge</p>
              <p className="text-2xl font-bold text-foreground">
                {batteryStats.avgDischarge.toFixed(1)}%
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Battery Health</p>
              <p className="text-2xl font-bold text-success">{batteryStats.health}</p>
            </div>
          </div>
        </div>
      )}

      {/* System Uptime */}
      {selectedMetric === 'uptime' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Uptime Estimate</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[90, 100]} />
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
                dataKey="uptime"
                stroke="#10b981"
                name="Estimated Uptime (%)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Uptime</p>
              <p className="text-2xl font-bold text-foreground">
                {average(uptimeData.map((day) => day.uptime)).toFixed(2)}%
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Days Tracked</p>
              <p className="text-2xl font-bold text-foreground">{dailyData.length}</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Data Source</p>
              <p className="text-2xl font-bold text-success">
                {data?.source === 'thingsboard' ? 'ThingsBoard' : 'Simulated'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
