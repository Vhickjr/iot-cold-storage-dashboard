'use client'

import { Menu, Bell, Power, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useTelemetryLatest } from '@/hooks/use-telemetry'
import { useSystemAlerts } from '@/hooks/use-alerts'

interface HeaderProps {
  onMenuClick: () => void
  onNotificationsClick: () => void
}

function statusDisplay(systemStatus: string | null | undefined) {
  if (!systemStatus) return { label: 'Unknown', dotClass: 'bg-muted-foreground', textClass: 'text-muted-foreground' }
  if (systemStatus.toLowerCase() === 'running') {
    return { label: 'Running', dotClass: 'bg-success', textClass: 'text-success' }
  }
  return { label: systemStatus, dotClass: 'bg-warning', textClass: 'text-warning' }
}

export default function Header({ onMenuClick, onNotificationsClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { data } = useTelemetryLatest()
  const { unreadCount } = useSystemAlerts()

  const status = statusDisplay(data?.systemStatus)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-foreground hover:bg-secondary"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cold Storage Control</h1>
          <p className="text-sm text-muted-foreground">Solar Powered IoT Monitoring System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">AI Enabled</span>
        </div>

        {/* System Status */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground">System Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.dotClass}`}></div>
            <span className={`text-sm ${status.textClass}`}>{status.label}</span>
          </div>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationsClick}
          title={unreadCount > 0 ? `${unreadCount} active alert${unreadCount === 1 ? '' : 's'}` : 'No active alerts'}
          className="text-foreground hover:bg-secondary relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></span>
          )}
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{user?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-secondary"
          title="Logout"
          onClick={logout}
        >
          <Power className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
