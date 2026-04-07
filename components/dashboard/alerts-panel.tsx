'use client'

import { AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info' | 'resolved'
  timestamp: string
  status: 'active' | 'resolved'
}

const alerts: Alert[] = [
  {
    id: '1',
    title: 'High Temperature Detected',
    description: 'Temperature has exceeded optimal range. Current: 7.2°C',
    severity: 'critical',
    timestamp: '2 minutes ago',
    status: 'active',
  },
  {
    id: '2',
    title: 'Battery Low Warning',
    description: 'Battery level below 30%. Current: 28%',
    severity: 'warning',
    timestamp: '1 hour ago',
    status: 'active',
  },
  {
    id: '3',
    title: 'Door Left Open',
    description: 'Cold storage unit door has been open for 5 minutes',
    severity: 'critical',
    timestamp: '5 minutes ago',
    status: 'resolved',
  },
  {
    id: '4',
    title: 'System Maintenance Complete',
    description: 'Scheduled maintenance has been successfully completed',
    severity: 'info',
    timestamp: '3 hours ago',
    status: 'resolved',
  },
]

function AlertIcon({ severity }: { severity: 'critical' | 'warning' | 'info' | 'resolved' }) {
  const iconProps = { className: 'w-5 h-5' }

  switch (severity) {
    case 'critical':
      return <AlertTriangle {...iconProps} className="text-error" />
    case 'warning':
      return <AlertCircle {...iconProps} className="text-warning" />
    case 'resolved':
      return <CheckCircle {...iconProps} className="text-success" />
    case 'info':
      return <Clock {...iconProps} className="text-info" />
    default:
      return null
  }
}

export default function AlertsPanel() {
  const activeAlerts = alerts.filter((a) => a.status === 'active')
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved')

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Active Alerts ({activeAlerts.length})
        </h3>
        <div className="space-y-3">
          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card border rounded-lg p-4 ${
                  alert.severity === 'critical'
                    ? 'border-error'
                    : alert.severity === 'warning'
                      ? 'border-warning'
                      : 'border-info'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {alert.timestamp}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-secondary"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
              <p className="text-foreground font-semibold">All Systems Normal</p>
              <p className="text-sm text-muted-foreground">No active alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolved Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Resolved ({resolvedAlerts.length})
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {resolvedAlerts.map((alert) => (
            <div key={alert.id} className="bg-card border border-border rounded-lg p-3 opacity-75">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-secondary border border-border rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-3">Alert Preferences</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-foreground">Enable Email Notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-foreground">Enable SMS Alerts</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-foreground">Critical Only</span>
          </label>
        </div>
      </div>
    </div>
  )
}
