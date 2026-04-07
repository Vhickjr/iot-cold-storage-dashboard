'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  time: string
  temperature: number
  temperatureForecast?: number
  humidity: number
  humidityForecast?: number
  battery: number
  batteryForecast?: number
  solarPower: number
  solarPowerForecast?: number
  isForecast?: boolean
}

export default function MonitoringCharts() {
  const [chartData, setChartData] = useState<DataPoint[]>([
    { time: '00:00', temperature: 4, humidity: 60, battery: 85, solarPower: 0, temperatureForecast: 4, humidityForecast: 60, batteryForecast: 85, solarPowerForecast: 0 },
    { time: '04:00', temperature: 3, humidity: 55, battery: 82, solarPower: 0, temperatureForecast: 3, humidityForecast: 55, batteryForecast: 82, solarPowerForecast: 0 },
    { time: '08:00', temperature: 4.5, humidity: 62, battery: 88, solarPower: 150, temperatureForecast: 4.5, humidityForecast: 62, batteryForecast: 88, solarPowerForecast: 150 },
    { time: '12:00', temperature: 5, humidity: 70, battery: 95, solarPower: 450, temperatureForecast: 5.2, humidityForecast: 72, batteryForecast: 94, solarPowerForecast: 420 },
    { time: '16:00', temperature: 4.8, humidity: 68, battery: 92, solarPower: 250, temperatureForecast: 5.1, humidityForecast: 71, batteryForecast: 93, solarPowerForecast: 280 },
    { time: '20:00', temperature: 3.5, humidity: 58, battery: 88, solarPower: 50, temperatureForecast: 4.2, humidityForecast: 65, batteryForecast: 89, solarPowerForecast: 40 },
    { time: '23:59', temperature: 3.2, humidity: 54, battery: 85, solarPower: 0, temperatureForecast: 4.8, humidityForecast: 68, batteryForecast: 84, solarPowerForecast: 0, isForecast: true },
  ])

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev]
        const lastItem = newData[newData.length - 1]

        const newTemp = Math.max(2, Math.min(8, lastItem.temperature + (Math.random() - 0.5) * 0.5))
        const newHumidity = Math.max(30, Math.min(95, lastItem.humidity + (Math.random() - 0.5) * 3))
        const newBattery = Math.max(0, Math.min(100, lastItem.battery + (Math.random() - 0.5) * 2))
        const newSolar = Math.max(0, Math.min(500, lastItem.solarPower + (Math.random() - 0.5) * 50))

        const newItem: DataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          temperature: newTemp,
          temperatureForecast: newTemp + (Math.random() - 0.5) * 0.8,
          humidity: newHumidity,
          humidityForecast: newHumidity + (Math.random() - 0.5) * 4,
          battery: newBattery,
          batteryForecast: newBattery + (Math.random() - 0.5) * 3,
          solarPower: newSolar,
          solarPowerForecast: newSolar + (Math.random() - 0.5) * 60,
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Temperature Trend (with AI Forecast)</h3>
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
              name="Actual Temperature (°C)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="temperatureForecast"
              stroke="#3b82f6"
              name="Forecast Temperature (°C)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="3 3" name="Upper Threshold (6°C)" />
            <ReferenceLine y={2} stroke="#10b981" strokeDasharray="3 3" name="Lower Threshold (2°C)" />
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
          <div>
            <p className="text-muted-foreground">Forecast</p>
            <p className="text-primary font-semibold">{(chartData[chartData.length - 1].temperatureForecast || 0).toFixed(1)}°C</p>
          </div>
        </div>
      </div>

      {/* Humidity Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Humidity Levels (with AI Forecast)</h3>
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
              name="Actual Humidity (%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="humidityForecast"
              stroke="#10b981"
              name="Forecast Humidity (%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="3 3" name="Max Threshold (75%)" />
            <ReferenceLine y={40} stroke="#10b981" strokeDasharray="3 3" name="Min Threshold (40%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Battery & Solar Power Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Battery Status (with AI Forecast)</h3>
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
                name="Actual Battery (%)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="batteryForecast"
                stroke="#f59e0b"
                name="Forecast Battery (%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" name="Critical Level (20%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Solar Power Output (with AI Forecast)</h3>
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
                name="Actual Solar Power (W)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="solarPowerForecast"
                stroke="#8b5cf6"
                name="Forecast Solar Power (W)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
