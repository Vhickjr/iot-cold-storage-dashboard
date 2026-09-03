'use client'

import { User, Shield, Key, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { tbRoleLabel } from '@/lib/thingsboard'

interface UserRole {
  id: string
  name: string
  permissions: string[]
  icon: React.ReactNode
}

const userRoles: UserRole[] = [
  {
    id: 'TENANT_ADMIN',
    name: 'Administrator',
    permissions: ['Full system access', 'User management', 'System configuration', 'Data export'],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'CUSTOMER_USER',
    name: 'Operator',
    permissions: ['Monitor system', 'Control operations', 'View alerts', 'Generate reports'],
    icon: <User className="w-5 h-5" />,
  },
]

interface UserSectionProps {
  onOpenSettings?: () => void
}

export default function UserSection({ onOpenSettings }: UserSectionProps) {
  const { user, logout } = useAuth()

  const roleLabel = user ? tbRoleLabel(user.authority) : '—'
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <div className="space-y-6">
      {/* Current User Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Current User
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {initials}
            </div>
            <div>
              <p className="text-foreground font-semibold">{user?.name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className="bg-secondary p-3 rounded-lg space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">User Role</p>
              <p className="text-foreground font-semibold">{roleLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Authority</p>
              <p className="text-foreground font-semibold text-sm">{user?.authority ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles & Permissions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Available Roles
        </h3>
        <div className="space-y-3">
          {userRoles.map((role) => {
            const isCurrentRole =
              user?.authority === role.id ||
              (user?.authority === 'SYS_ADMIN' && role.id === 'TENANT_ADMIN')
            return (
              <div
                key={role.id}
                className={`border rounded-lg p-4 ${
                  isCurrentRole ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-primary">{role.icon}</div>
                    <h4 className="font-semibold text-foreground">{role.name}</h4>
                  </div>
                  {isCurrentRole && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  {role.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Security
        </h3>
        <div className="space-y-3">
          <Button
            onClick={onOpenSettings}
            className="w-full justify-start bg-secondary text-foreground hover:bg-secondary/90"
          >
            <Key className="w-4 h-4 mr-2" />
            Manage Account & Security
          </Button>
        </div>
      </div>

      {/* Session */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Session</h3>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-muted-foreground">Session Status</span>
          <span className="text-success font-semibold">Active</span>
        </div>
        <Button
          variant="outline"
          className="w-full border-border text-foreground hover:bg-secondary"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Cold Storage Control System. All rights reserved.</p>
      </div>
    </div>
  )
}
