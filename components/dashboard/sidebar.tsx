import { LayoutDashboard, Activity, Zap, AlertCircle, TrendingUp, MapPin, Download, Settings, ChevronLeft, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  open: boolean
  onToggle: (open: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

const menuItems = [
  { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Real-Time Monitoring', icon: Activity },
  { id: 'ai', label: 'AI Insights', icon: Brain },
  { id: 'control', label: 'Control Panel', icon: Zap },
  { id: 'alerts', label: 'Alerts', icon: AlertCircle },
  { id: 'history', label: 'Historical Data', icon: TrendingUp },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'export', label: 'Export & User', icon: Download },
]

export default function Sidebar({ open, onToggle, activeTab, setActiveTab }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground">ColdStorage</h2>
            <p className="text-xs text-muted-foreground">v1.0 Pro</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(false)}
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  onToggle(false)
                }}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Button>
            )
          })}
        </nav>

        {/* Settings Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Button>
          <p className="text-xs text-muted-foreground p-2">Last Updated: Now</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => onToggle(false)}
        ></div>
      )}
    </>
  )
}
