'use client'

import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'

const historicalData = [
  { date: 'Mon', avgTemp: 4.1, maxTemp: 5.2, minTemp: 2.8, uptime: 99.5 },
  { date: 'Tue', avgTemp: 3.9, maxTemp: 5.0, minTemp: 2.5, uptime: 99.8 },
  { date: 'Wed', avgTemp: 4.3, maxTemp: 5.5, minTemp: 3.0, uptime: 99.2 },
  { date: 'Thu', avgTemp: 4.0, maxTemp: 5.1, minTemp: 2.7, uptime: 99.9 },
  { date: 'Fri', avgTemp: 4.2, maxTemp: 5.3, minTemp: 3.1, uptime: 99.6 },
  { date: 'Sat', avgTemp: 4.1, maxTemp: 5.2, minTemp: 2.9, uptime: 99.7 },
  { date: 'Sun', avgTemp: 3.8, maxTemp: 4.9, minTemp: 2.6, uptime: 99.9 },
]

const batteryUsageData = [
  { date: 'Mon', charge: 85, discharge: 15 },
  { date: 'Tue', charge: 88, discharge: 12 },
  { date: 'Wed', charge: 82, discharge: 18 },
  { date: 'Thu', charge: 90, discharge: 10 },
  { date: 'Fri', charge: 86, discharge: 14 },
  { date: 'Sat', charge: 87, discharge: 13 },
  { date: 'Sun', charge: 91, discharge: 9 },
]

export default function HistoricalAnalysis() {
  const [dateRange, setDateRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('temperature')

  return (
    <div className="space-y-6">
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
            <LineChart data={historicalData}>
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
              <p className="text-2xl font-bold text-foreground">4.1°C</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Temperature Variance</p>
              <p className="text-2xl font-bold text-foreground">0.15°C</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Out of Range Events</p>
              <p className="text-2xl font-bold text-warning">2</p>
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
              <Bar dataKey="charge" stackId="a" fill="#10b981" name="Solar Charge (%)" />
              <Bar dataKey="discharge" stackId="a" fill="#f59e0b" name="System Discharge (%)" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Daily Charge</p>
              <p className="text-2xl font-bold text-foreground">86.7%</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Daily Discharge</p>
              <p className="text-2xl font-bold text-foreground">13.3%</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Battery Health</p>
              <p className="text-2xl font-bold text-success">Excellent</p>
            </div>
          </div>
        </div>
      )}

      {/* System Uptime */}
      {selectedMetric === 'uptime' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Uptime</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[98, 100]} />
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
                name="Uptime (%)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Uptime</p>
              <p className="text-2xl font-bold text-foreground">99.66%</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Downtime This Week</p>
              <p className="text-2xl font-bold text-foreground">4.8 min</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">MTBF</p>
              <p className="text-2xl font-bold text-success">156 days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
