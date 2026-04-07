'use client'

import { User, Shield, Key, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserRole {
  id: string
  name: string
  permissions: string[]
  icon: React.ReactNode
}

const userRoles: UserRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    permissions: ['Full system access', 'User management', 'System configuration', 'Data export'],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'operator',
    name: 'Operator',
    permissions: ['Monitor system', 'Control operations', 'View alerts', 'Generate reports'],
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: ['View dashboards', 'View reports', 'View alerts (read-only)'],
    icon: <User className="w-5 h-5" />,
  },
]

export default function UserSection() {
  const currentUser = {
    name: 'Admin User',
    email: 'admin@coldstorage.local',
    role: 'Administrator',
    lastLogin: '2024-04-07 14:32 UTC',
    loginAttempts: 0,
  }

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
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="text-foreground font-semibold">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          <div className="bg-secondary p-3 rounded-lg space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">User Role</p>
              <p className="text-foreground font-semibold">{currentUser.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p className="text-foreground font-semibold text-sm">{currentUser.lastLogin}</p>
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
          {userRoles.map((role) => (
            <div
              key={role.id}
              className={`border rounded-lg p-4 ${
                role.name === currentUser.role ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-primary">{role.icon}</div>
                  <h4 className="font-semibold text-foreground">{role.name}</h4>
                </div>
                {role.name === currentUser.role && (
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
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Security
        </h3>
        <div className="space-y-3">
          <Button className="w-full justify-start bg-secondary text-foreground hover:bg-secondary/90">
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button className="w-full justify-start bg-secondary text-foreground hover:bg-secondary/90">
            <Shield className="w-4 h-4 mr-2" />
            Two-Factor Authentication
          </Button>
          <div className="mt-4 p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">Failed Login Attempts</p>
            <p className="text-foreground font-semibold mt-1">{currentUser.loginAttempts}</p>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Session</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session Status</span>
            <span className="text-success font-semibold">Active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session Duration</span>
            <span className="text-foreground font-semibold">23 minutes</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Terms & Support */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>© 2024 Cold Storage Control System. All rights reserved.</p>
        <div className="flex justify-center gap-3">
          <button className="text-primary hover:underline">Terms of Service</button>
          <button className="text-primary hover:underline">Privacy Policy</button>
          <button className="text-primary hover:underline">Support</button>
        </div>
      </div>
    </div>
  )
}
