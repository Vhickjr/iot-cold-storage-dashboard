'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Zap, Thermometer, AlertTriangle, CheckCircle, Brain, Droplets, Sun, Loader2 } from 'lucide-react'
import { useTelemetryHistory, useTelemetryLatest } from '@/hooks/use-telemetry'
import { computeStats, zScore, linearRegression, extrapolate, type Point } from '@/lib/analytics'
import { TEMP_HIGH, TEMP_LOW, BATTERY_LOW } from '@/lib/thresholds'
import type { TelemetryHistoryPoint } from '@/lib/telemetry'

type MetricKey = 'temperature' | 'humidity' | 'battery' | 'solarPower'

const METRIC_META: Record<MetricKey, { label: string; unit: string; icon: React.ReactNode; range: [number, number] }> = {
  temperature: { label: 'Temperature', unit: '°C', icon: <Thermometer className="w-4 h-4" />, range: [-5, 15] },
  battery: { label: 'Battery Level', unit: '%', icon: <Zap className="w-4 h-4" />, range: [0, 100] },
  solarPower: { label: 'Solar Power Generation', unit: 'W', icon: <Sun className="w-4 h-4" />, range: [0, 500] },
  humidity: { label: 'Humidity', unit: '%', icon: <Droplets className="w-4 h-4" />, range: [0, 100] },
}

interface AnomalyAlert {
  id: string
  metric: MetricKey
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  confidence: number
}

interface RecommendedAction {
  id: string
  priority: 'high' | 'medium' | 'low'
  action: string
  impact: string
}

interface Forecast {
  metric: MetricKey
  current: number
  predicted24h: number
  predicted48h: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

function toPoints(history: TelemetryHistoryPoint[], key: MetricKey): Point[] {
  const first = history[0]?.timestamp ?? 0
  return history
    .filter((p) => p[key] != null)
    .map((p) => ({ x: (p.timestamp - first) / (60 * 60 * 1000), y: p[key] as number }))
}

function buildAnomalies(history: TelemetryHistoryPoint[], latest: Record<MetricKey, number | null>): AnomalyAlert[] {
  const anomalies: AnomalyAlert[] = []

  for (const key of Object.keys(METRIC_META) as MetricKey[]) {
    const values = history.map((p) => p[key]).filter((v): v is number => v != null)
    const current = latest[key]
    if (values.length < 8 || current == null) continue

    const stats = computeStats(values)
    const z = zScore(current, stats)

    if (Math.abs(z) > 2) {
      anomalies.push({
        id: `zscore-${key}`,
        metric: key,
        severity: Math.abs(z) > 3 ? 'critical' : 'warning',
        title: `Unusual ${METRIC_META[key].label} Reading`,
        description: `Current ${METRIC_META[key].label.toLowerCase()} (${current.toFixed(1)}${METRIC_META[key].unit}) is ${Math.abs(z).toFixed(1)} standard deviations from the recent average (${stats.mean.toFixed(1)}${METRIC_META[key].unit}).`,
        confidence: Math.min(0.99, 0.5 + Math.abs(z) / 10),
      })
    }

    // Rate-of-change check over the most recent quarter of the window
    const recentSlice = values.slice(-Math.max(4, Math.floor(values.length / 4)))
    if (recentSlice.length >= 4) {
      const delta = recentSlice[recentSlice.length - 1] - recentSlice[0]
      const rateThreshold = key === 'temperature' ? 1.5 : key === 'battery' ? 15 : key === 'humidity' ? 15 : 150
      if (Math.abs(delta) > rateThreshold) {
        anomalies.push({
          id: `rate-${key}`,
          metric: key,
          severity: 'warning',
          title: `Rapid ${METRIC_META[key].label} Change Detected`,
          description: `${METRIC_META[key].label} moved by ${delta.toFixed(1)}${METRIC_META[key].unit} over the recent readings — faster than the typical pattern for this metric.`,
          confidence: 0.75,
        })
      }
    }
  }

  return anomalies
}

function buildForecasts(history: TelemetryHistoryPoint[], latest: Record<MetricKey, number | null>): Forecast[] {
  return (Object.keys(METRIC_META) as MetricKey[]).flatMap((key) => {
    const points = toPoints(history, key)
    const current = latest[key]
    if (points.length < 4 || current == null) return []

    const regression = linearRegression(points)
    const lastX = points[points.length - 1].x
    const [rangeMin, rangeMax] = METRIC_META[key].range
    const clamp = (v: number) => Math.max(rangeMin, Math.min(rangeMax, v))
    // A straight-line fit extrapolated 24-48h out can overshoot wildly for
    // cyclical metrics like solar power (day/night swings) — clamp to the
    // metric's physically realistic range so the number stays meaningful.
    const predicted24h = clamp(extrapolate(regression, lastX + 24))
    const predicted48h = clamp(extrapolate(regression, lastX + 48))

    const trend = regression.slope > 0.02 ? 'up' : regression.slope < -0.02 ? 'down' : 'stable'

    return [
      {
        metric: key,
        current,
        predicted24h,
        predicted48h,
        trend,
        confidence: regression.rSquared,
      },
    ]
  })
}

function buildRecommendations(anomalies: AnomalyAlert[], latest: Record<MetricKey, number | null>): RecommendedAction[] {
  const recs: RecommendedAction[] = []

  if (latest.temperature != null && latest.temperature >= TEMP_HIGH) {
    recs.push({
      id: 'temp-maintenance',
      priority: 'high',
      action: 'Inspect Refrigeration System and Door Seals',
      impact: 'Temperature is at or above the optimal upper threshold — check compressor performance and door seal integrity to bring it back into range.',
    })
  }

  if (latest.battery != null && latest.battery < BATTERY_LOW) {
    recs.push({
      id: 'battery-charging',
      priority: latest.battery < BATTERY_LOW / 2 ? 'high' : 'medium',
      action: 'Review Solar Charging Performance',
      impact: 'Battery level is below the warning threshold — check panel exposure and charge controller for reduced charging efficiency.',
    })
  }

  if (anomalies.some((a) => a.id.startsWith('zscore-humidity') || a.id.startsWith('rate-humidity'))) {
    recs.push({
      id: 'humidity-sensor',
      priority: 'medium',
      action: 'Calibrate Humidity Sensor',
      impact: 'Humidity readings are deviating from the recent baseline, which can indicate sensor drift or a door/seal issue.',
    })
  }

  if (recs.length === 0) {
    recs.push({
      id: 'nominal',
      priority: 'low',
      action: 'No Action Needed',
      impact: 'All monitored metrics are within their normal operating ranges based on recent telemetry.',
    })
  }

  return recs
}

export default function AIInsights() {
  const { data: history, loading: historyLoading, error: historyError } = useTelemetryHistory('7d')
  const { data: snapshot, loading: snapshotLoading } = useTelemetryLatest()

  const points = history?.points ?? []
  const latest: Record<MetricKey, number | null> = {
    temperature: snapshot?.temperature ?? null,
    humidity: snapshot?.humidity ?? null,
    battery: snapshot?.battery ?? null,
    solarPower: snapshot?.solarPower ?? null,
  }

  const loading = historyLoading || snapshotLoading

  const anomalies = points.length ? buildAnomalies(points, latest) : []
  const forecasts = points.length ? buildForecasts(points, latest) : []
  const recommendations = points.length ? buildRecommendations(anomalies, latest) : []

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-error/10 text-error border-error/30'
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30'
      default:
        return 'bg-info/10 text-info border-info/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error border-error/40'
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/40'
      default:
        return 'bg-info/20 text-info border-info/40'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-warning" />
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-info rotate-180" />
    return <div className="w-4 h-4 text-muted-foreground">—</div>
  }

  const barWidth = (value: number, metric: MetricKey) => {
    const [min, max] = METRIC_META[metric].range
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">AI-Powered Insights</h2>
      </div>

      {loading && !points.length ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Analyzing telemetry history…
        </div>
      ) : historyError && !points.length ? (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          {historyError}
        </div>
      ) : (
        <>
          {/* Anomaly Detection Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Anomaly Detection
              </CardTitle>
              <CardDescription>
                Statistical analysis (z-score deviation and rate-of-change) of the last 7 days of telemetry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalies.length > 0 ? (
                anomalies.map((anomaly) => (
                  <div key={anomaly.id} className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{METRIC_META[anomaly.metric].icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{anomaly.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {(anomaly.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{anomaly.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No anomalies detected — System operating normally
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forecast Predictions Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Forecast Predictions
              </CardTitle>
              <CardDescription>
                48-hour linear trend projection from the last 7 days of telemetry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecasts.map((forecast) => (
                  <div key={forecast.metric} className="p-4 rounded-lg bg-secondary/20 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-foreground">
                        {METRIC_META[forecast.metric].label} ({METRIC_META[forecast.metric].unit})
                      </h4>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(forecast.trend)}
                        <span className="text-xs text-muted-foreground">
                          R² {forecast.confidence.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Current</span>
                        <span className="font-mono font-semibold text-sm text-foreground">
                          {forecast.current.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-info"
                          style={{ width: `${barWidth(forecast.current, forecast.metric)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">24h Forecast</span>
                        <span className="font-mono font-semibold text-sm text-primary">
                          {forecast.predicted24h.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${barWidth(forecast.predicted24h, forecast.metric)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">48h Forecast</span>
                        <span className="font-mono font-semibold text-sm text-muted-foreground">
                          {forecast.predicted48h.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-muted-foreground opacity-50"
                          style={{ width: `${barWidth(forecast.predicted48h, forecast.metric)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Recommended Actions
              </CardTitle>
              <CardDescription>Rule-based recommendations derived from current telemetry and detected anomalies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{rec.action}</h4>
                      <p className="text-xs text-foreground">{rec.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
