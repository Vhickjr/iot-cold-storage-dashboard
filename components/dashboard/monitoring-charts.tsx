'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: string
  temperature: number
  humidity: number
  battery: number
  solarPower: number
}

export default function MonitoringCharts() {
  const [chartData, setChartData] = useState<DataPoint[]>([
    { time: '00:00', temperature: 4, humidity: 60, battery: 85, solarPower: 0 },
    { time: '04:00', temperature: 3, humidity: 55, battery: 82, solarPower: 0 },
    { time: '08:00', temperature: 4.5, humidity: 62, battery: 88, solarPower: 150 },
    { time: '12:00', temperature: 5, humidity: 70, battery: 95, solarPower: 450 },
    { time: '16:00', temperature: 4.8, humidity: 68, battery: 92, solarPower: 250 },
    { time: '20:00', temperature: 3.5, humidity: 58, battery: 88, solarPower: 50 },
    { time: '23:59', temperature: 3.2, humidity: 54, battery: 85, solarPower: 0 },
  ])

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev]
        const lastItem = newData[newData.length - 1]

        const newItem: DataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          temperature: Math.max(2, Math.min(8, lastItem.temperature + (Math.random() - 0.5) * 0.5)),
          humidity: Math.max(30, Math.min(95, lastItem.humidity + (Math.random() - 0.5) * 3)),
          battery: Math.max(0, Math.min(100, lastItem.battery + (Math.random() - 0.5) * 2)),
          solarPower: Math.max(0, Math.min(500, lastItem.solarPower + (Math.random() - 0.5) * 50)),
        }

        newData.shift()
        newData.push(newItem)
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Temperature Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Temperature Trend</h3>
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
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Optimal Range</p>
            <p className="text-foreground font-semibold">2°C - 6°C</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="text-foreground font-semibold">{chartData[chartData.length - 1].temperature.toFixed(1)}°C</p>
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Battery & Solar Power Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Battery Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="battery"
                stroke="#f59e0b"
                fill="#f59e0b"
                name="Battery (%)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Solar Power Output</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="solarPower"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                name="Solar Power (W)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
