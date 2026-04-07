'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Zap, Thermometer, AlertTriangle, CheckCircle, Brain } from 'lucide-react'

interface AnomalyAlert {
  id: string
  type: 'temperature' | 'battery' | 'sensor' | 'consumption'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  confidence: number
  timestamp: Date
}

interface RecommendedAction {
  id: string
  priority: 'high' | 'medium' | 'low'
  action: string
  impact: string
  estimatedBenefit: string
}

interface Forecast {
  metric: string
  current: number
  predicted24h: number
  predicted48h: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

export default function AIInsights() {
  const anomalies: AnomalyAlert[] = [
    {
      id: '1',
      type: 'temperature',
      severity: 'warning',
      title: 'Gradual Temperature Rise Detected',
      description: 'Temperature has risen 2.3°C in the last 2 hours, which is faster than normal. Possible refrigeration efficiency degradation.',
      confidence: 0.92,
      timestamp: new Date(Date.now() - 30 * 60000),
    },
    {
      id: '2',
      type: 'battery',
      severity: 'warning',
      title: 'Unusual Battery Discharge Pattern',
      description: 'Battery discharge rate is 15% higher than historical average. May indicate increased compressor load.',
      confidence: 0.87,
      timestamp: new Date(Date.now() - 45 * 60000),
    },
    {
      id: '3',
      type: 'sensor',
      severity: 'info',
      title: 'Sensor Drift Detected',
      description: 'Humidity sensor readings show minor calibration drift. Recommended: Perform calibration check within 48 hours.',
      confidence: 0.78,
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
    },
  ]

  const recommendations: RecommendedAction[] = [
    {
      id: '1',
      priority: 'high',
      action: 'Schedule Refrigeration System Maintenance',
      impact: 'Prevent potential system failure and improve efficiency by 8-12%',
      estimatedBenefit: 'Extend system lifespan by 2-3 years, reduce energy costs by $500-800 annually',
    },
    {
      id: '2',
      priority: 'high',
      action: 'Check Door Seals and Insulation',
      impact: 'Reduce heat infiltration and stabilize temperature control',
      estimatedBenefit: 'Lower energy consumption by 5-10%, improve product preservation quality',
    },
    {
      id: '3',
      priority: 'medium',
      action: 'Calibrate Environmental Sensors',
      impact: 'Ensure accurate monitoring and prevent false alarms',
      estimatedBenefit: 'Improve monitoring accuracy to ±0.5°C, reduce alert false positives',
    },
    {
      id: '4',
      priority: 'medium',
      action: 'Optimize Solar Charging Schedule',
      impact: 'Maximize battery charging during peak sunlight hours',
      estimatedBenefit: 'Increase battery reserve by 15-20%, improve nighttime reliability',
    },
  ]

  const forecasts: Forecast[] = [
    {
      metric: 'Temperature (°C)',
      current: 4.2,
      predicted24h: 5.1,
      predicted48h: 5.8,
      trend: 'up',
      confidence: 0.89,
    },
    {
      metric: 'Battery Level (%)',
      current: 68,
      predicted24h: 72,
      predicted48h: 65,
      trend: 'stable',
      confidence: 0.91,
    },
    {
      metric: 'Power Consumption (kWh)',
      current: 3.2,
      predicted24h: 3.5,
      predicted48h: 3.3,
      trend: 'up',
      confidence: 0.85,
    },
    {
      metric: 'Humidity (%)',
      current: 45,
      predicted24h: 48,
      predicted48h: 50,
      trend: 'up',
      confidence: 0.82,
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-error/10 text-error border-error/30'
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30'
      case 'info':
        return 'bg-info/10 text-info border-info/30'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error border-error/40'
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/40'
      case 'low':
        return 'bg-info/20 text-info border-info/40'
      default:
        return 'bg-muted/20 text-muted-foreground'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-warning" />
    } else if (trend === 'down') {
      return <TrendingUp className="w-4 h-4 text-info rotate-180" />
    }
    return <div className="w-4 h-4 text-muted-foreground">—</div>
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />
      case 'battery':
        return <Zap className="w-4 h-4" />
      case 'sensor':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">AI-Powered Insights</h2>
      </div>

      {/* Anomaly Detection Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Anomaly Detection
          </CardTitle>
          <CardDescription>
            Machine learning algorithms detect unusual patterns and potential issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {anomalies.length > 0 ? (
            anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(anomaly.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{anomaly.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {(anomaly.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{anomaly.description}</p>
                    <p className="text-xs opacity-75 mt-2">
                      Detected {Math.round((Date.now() - anomaly.timestamp.getTime()) / 60000)} minutes ago
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No anomalies detected - System operating normally
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
            48-hour predictions based on historical patterns and current trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecasts.map((forecast) => (
              <div key={forecast.metric} className="p-4 rounded-lg bg-secondary/20 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-foreground">{forecast.metric}</h4>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecast.trend)}
                    <span className="text-xs text-muted-foreground">
                      {(forecast.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Current</span>
                    <span className="font-mono font-semibold text-sm text-foreground">
                      {forecast.current}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-info"
                      style={{ width: `${(forecast.current / 100) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">24h Forecast</span>
                    <span className="font-mono font-semibold text-sm text-primary">
                      {forecast.predicted24h}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(forecast.predicted24h / 100) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">48h Forecast</span>
                    <span className="font-mono font-semibold text-sm text-muted-foreground">
                      {forecast.predicted48h}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-muted-foreground opacity-50"
                      style={{ width: `${(forecast.predicted48h / 100) * 100}%` }}
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
          <CardDescription>
            AI-generated maintenance and optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1 text-xs">
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{rec.action}</h4>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="text-foreground">{rec.impact}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Estimated Benefit: </span>
                      <span className="text-foreground">{rec.estimatedBenefit}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
