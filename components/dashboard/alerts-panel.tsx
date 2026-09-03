'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSystemAlerts } from '@/hooks/use-alerts'
import { usePreferences } from '@/hooks/use-preferences'

function AlertIcon({ severity }: { severity: 'critical' | 'warning' }) {
  return severity === 'critical' ? (
    <AlertTriangle className="w-5 h-5 text-error" />
  ) : (
    <AlertCircle className="w-5 h-5 text-warning" />
  )
}

export default function AlertsPanel() {
  const { active, history, acknowledge } = useSystemAlerts()
  const { preferences } = usePreferences()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const visibleActive = preferences.notifyCriticalOnly
    ? active.filter((a) => a.severity === 'critical')
    : active

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Active Alerts ({visibleActive.length})
        </h3>
        <div className="space-y-3">
          {visibleActive.length > 0 ? (
            visibleActive.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card border rounded-lg p-4 ${
                  alert.severity === 'critical' ? 'border-error' : 'border-warning'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                    </div>
                    {expandedId === alert.id && (
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => acknowledge(alert.id)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                        className="border-border text-foreground hover:bg-secondary"
                      >
                        Details
                        <ChevronDown
                          className={`w-3.5 h-3.5 ml-1 transition-transform ${
                            expandedId === alert.id ? 'rotate-180' : ''
                          }`}
                        />
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

      {/* Alert History */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.length > 0 ? (
            history.map((event, idx) => (
              <div
                key={`${event.id}-${event.timestamp}-${idx}`}
                className="bg-card border border-border rounded-lg p-3 opacity-75"
              >
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {event.event === 'cleared' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm">
                      {event.title} {event.event === 'cleared' ? '— resolved' : '— started'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-2">No alert history yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
