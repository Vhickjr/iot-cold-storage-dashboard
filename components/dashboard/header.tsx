import { Menu, Bell, User, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
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
        {/* System Status */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-success">Running</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-secondary"
          title="Logout"
        >
          <Power className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
