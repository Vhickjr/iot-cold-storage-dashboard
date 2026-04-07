'use client'

import { useState } from 'react'
import { Download, FileText, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportItem {
  id: string
  name: string
  format: string
  size: string
  date: string
  status: 'completed' | 'processing' | 'queued'
}

const recentExports: ExportItem[] = [
  {
    id: '1',
    name: 'Cold Storage Data - March 2024',
    format: 'CSV',
    size: '2.4 MB',
    date: '2 hours ago',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Temperature Report - Q1 2024',
    format: 'PDF',
    size: '1.8 MB',
    date: '1 day ago',
    status: 'completed',
  },
  {
    id: '3',
    name: 'System Performance Summary',
    format: 'Excel',
    size: '450 KB',
    date: '3 days ago',
    status: 'completed',
  },
]

export default function DataExport() {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      alert(`Export started: ${exportType} data in ${exportFormat.toUpperCase()} format`)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">New Export</h3>
        <div className="space-y-4">
          {/* Export Type */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Data Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="all">All Data</option>
              <option value="temperature">Temperature Data</option>
              <option value="battery">Battery Status</option>
              <option value="alerts">Alerts & Events</option>
              <option value="performance">Performance Metrics</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">Format</label>
            <div className="space-y-2">
              {['csv', 'json', 'xlsx', 'pdf'].map((format) => (
                <label key={format} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="rounded"
                  />
                  <span className="text-foreground font-semibold uppercase">{format}</span>
                  <span className="text-xs text-muted-foreground">
                    {format === 'csv' && '(Spreadsheet)'}
                    {format === 'json' && '(Data Interchange)'}
                    {format === 'xlsx' && '(Excel)'}
                    {format === 'pdf' && '(Report)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Start Export'}
          </Button>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {recentExports.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.format} • {item.size} • {item.date}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary p-4 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Exports</p>
          <p className="text-2xl font-bold text-foreground">24</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Data Size</p>
          <p className="text-2xl font-bold text-foreground">12.4 GB</p>
        </div>
      </div>
    </div>
  )
}
