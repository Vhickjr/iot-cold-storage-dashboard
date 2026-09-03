'use client'

import { useState } from 'react'
import Header from '@/components/dashboard/header'
import Sidebar from '@/components/dashboard/sidebar'
import SystemOverview from '@/components/dashboard/system-overview'
import MonitoringCharts from '@/components/dashboard/monitoring-charts'
import AlertsPanel from '@/components/dashboard/alerts-panel'
import ControlPanel from '@/components/dashboard/control-panel'
import AIInsights from '@/components/dashboard/ai-insights'
import HistoricalAnalysis from '@/components/dashboard/historical-analysis'
import LocationTracker from '@/components/dashboard/location-tracker'
import DataExport from '@/components/dashboard/data-export'
import UserSection from '@/components/dashboard/user-section'
import SettingsPanel from '@/components/dashboard/settings-panel'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNotificationsClick={() => setActiveTab('alerts')}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* System Overview Section */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">System Overview</h2>
                <SystemOverview />
              </div>
            )}

            {/* Real-Time Monitoring Section */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Real-Time Monitoring</h2>
                  <MonitoringCharts />
                </div>
                <div>
                  <AIInsights />
                </div>
              </div>
            )}

            {/* AI Insights Section (standalone) */}
            {activeTab === 'ai' && (
              <div>
                <AIInsights />
              </div>
            )}

            {/* Control Panel Section */}
            {activeTab === 'control' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Control Panel</h2>
                  <ControlPanel />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Alerts & Notifications</h2>
                  <AlertsPanel />
                </div>
              </div>
            )}

            {/* Alerts Section (standalone) */}
            {activeTab === 'alerts' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Alerts & Notifications</h2>
                <AlertsPanel />
              </div>
            )}

            {/* Historical Analysis Section */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Historical Data Analysis</h2>
                <HistoricalAnalysis />
              </div>
            )}

            {/* Location Tracking Section */}
            {activeTab === 'location' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Location Tracking</h2>
                <LocationTracker />
              </div>
            )}

            {/* Data Export Section */}
            {activeTab === 'export' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Data Export</h2>
                  <DataExport />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">User & Security</h2>
                  <UserSection onOpenSettings={() => setActiveTab('settings')} />
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Settings</h2>
                <SettingsPanel />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
