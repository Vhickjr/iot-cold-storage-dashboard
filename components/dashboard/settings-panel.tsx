'use client'

import { useEffect, useState } from 'react'
import { Key, Bell, RefreshCw, Server, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/hooks/use-preferences'

interface ConnectionInfo {
  thingsboardUrl: string | null
  deviceId: string | null
  entityType: string
}

const REFRESH_OPTIONS = [
  { label: '10 seconds', value: 10000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
]

export default function SettingsPanel() {
  const { preferences, setPreference } = usePreferences()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  const [connection, setConnection] = useState<ConnectionInfo | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings/connection', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to load connection info')
        return res.json()
      })
      .then(setConnection)
      .catch((err) => setConnectionError(err instanceof Error ? err.message : 'Failed to load connection info'))
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Failed to change password')

      setPasswordStatus({ type: 'success', message: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to change password' })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          {passwordStatus && (
            <p className={`text-sm ${passwordStatus.type === 'success' ? 'text-success' : 'text-destructive'}`}>
              {passwordStatus.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={changingPassword}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {changingPassword ? 'Changing…' : 'Change Password'}
          </Button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifyEmail}
              onChange={(e) => setPreference('notifyEmail', e.target.checked)}
              className="rounded"
            />
            <span className="text-foreground">Enable Email Notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifySms}
              onChange={(e) => setPreference('notifySms', e.target.checked)}
              className="rounded"
            />
            <span className="text-foreground">Enable SMS Alerts</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifyCriticalOnly}
              onChange={(e) => setPreference('notifyCriticalOnly', e.target.checked)}
              className="rounded"
            />
            <span className="text-foreground">Show Critical Alerts Only</span>
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          "Critical Only" filters the Active Alerts list on the Alerts page. Email/SMS delivery
          requires a configured notification channel and is not connected in this deployment —
          your preference is saved for when it is.
        </p>
      </div>

      {/* Refresh Interval */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Telemetry Refresh Interval
        </h3>
        <select
          value={preferences.telemetryRefreshIntervalMs}
          onChange={(e) => setPreference('telemetryRefreshIntervalMs', Number(e.target.value))}
          className="w-full max-w-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
        >
          {REFRESH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-3">
          Controls how often live telemetry and alerts poll ThingsBoard across the dashboard.
        </p>
      </div>

      {/* Connection Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Connection Info
        </h3>
        {connectionError ? (
          <p className="text-sm text-destructive">{connectionError}</p>
        ) : connection ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ThingsBoard URL</span>
              <span className="text-foreground font-mono">{connection.thingsboardUrl ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device ID</span>
              <span className="text-foreground font-mono">{connection.deviceId ?? 'auto-selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entity Type</span>
              <span className="text-foreground font-mono">{connection.entityType}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        )}
      </div>
    </div>
  )
}
