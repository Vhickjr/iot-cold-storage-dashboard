'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSystemAlerts } from '@/hooks/use-alerts'
import { mapDateRangeSelection, type TelemetryHistoryResponse } from '@/lib/telemetry'
import type { AlertHistoryEvent } from '@/hooks/use-alerts'

type ExportType = 'all' | 'temperature' | 'battery' | 'alerts' | 'performance'
type ExportFormat = 'csv' | 'json'

interface ExportRecipe {
  type: ExportType
  dateRange: string
  format: ExportFormat
}

interface ExportLogEntry extends ExportRecipe {
  id: string
  name: string
  sizeBytes: number
  timestamp: number
}

const STORAGE_KEY = 'cold-storage-export-log'
const LOG_LIMIT = 20

const TYPE_LABELS: Record<ExportType, string> = {
  all: 'All Data',
  temperature: 'Temperature Data',
  battery: 'Battery Status',
  alerts: 'Alerts & Events',
  performance: 'Performance Metrics',
}

const RANGE_LABELS: Record<string, string> = {
  week: 'Last 7 Days',
  month: 'Last 30 Days',
  quarter: 'Last 90 Days',
  year: 'Last Year',
}

function readLog(): ExportLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLog(log: ExportLogEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-LOG_LIMIT)))
  } catch {
    // localStorage unavailable — export log just won't persist across reloads
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
}

async function buildExport(
  recipe: ExportRecipe,
  alertHistory: AlertHistoryEvent[]
): Promise<{ blob: Blob; extension: string }> {
  const { type, dateRange, format } = recipe

  if (type === 'alerts') {
    if (format === 'json') {
      return {
        blob: new Blob([JSON.stringify(alertHistory, null, 2)], { type: 'application/json' }),
        extension: 'json',
      }
    }
    const rows = alertHistory.map((e) => [new Date(e.timestamp).toISOString(), e.title, e.event])
    return {
      blob: new Blob([toCsv(['timestamp', 'alert', 'event'], rows)], { type: 'text/csv' }),
      extension: 'csv',
    }
  }

  const range = mapDateRangeSelection(dateRange)
  const res = await fetch(`/api/telemetry/history?range=${range}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch telemetry history for export')
  const history = (await res.json()) as TelemetryHistoryResponse

  const columns: Array<{ key: 'temperature' | 'humidity' | 'battery' | 'solarPower'; label: string }> =
    type === 'temperature'
      ? [{ key: 'temperature', label: 'temperature_c' }]
      : type === 'battery'
        ? [{ key: 'battery', label: 'battery_pct' }]
        : type === 'performance'
          ? [
              { key: 'battery', label: 'battery_pct' },
              { key: 'solarPower', label: 'solar_power_w' },
            ]
          : [
              { key: 'temperature', label: 'temperature_c' },
              { key: 'humidity', label: 'humidity_pct' },
              { key: 'battery', label: 'battery_pct' },
              { key: 'solarPower', label: 'solar_power_w' },
            ]

  if (format === 'json') {
    const data = history.points.map((p) => ({
      timestamp: new Date(p.timestamp).toISOString(),
      ...Object.fromEntries(columns.map((c) => [c.label, p[c.key]])),
    }))
    return { blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), extension: 'json' }
  }

  const headers = ['timestamp', ...columns.map((c) => c.label)]
  const rows = history.points.map((p) => [
    new Date(p.timestamp).toISOString(),
    ...columns.map((c) => p[c.key] ?? ''),
  ])
  return { blob: new Blob([toCsv(headers, rows)], { type: 'text/csv' }), extension: 'csv' }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function DataExport() {
  const { history: alertHistory } = useSystemAlerts()
  const [exportType, setExportType] = useState<ExportType>('all')
  const [dateRange, setDateRange] = useState('month')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [log, setLog] = useState<ExportLogEntry[]>([])

  useEffect(() => {
    setLog(readLog())
  }, [])

  const runExport = async (recipe: ExportRecipe) => {
    setIsExporting(true)
    setStatusMessage(null)
    try {
      const { blob, extension } = await buildExport(recipe, alertHistory)
      const filename = `cold-storage-${recipe.type}-${recipe.dateRange}.${extension}`
      downloadBlob(blob, filename)

      const entry: ExportLogEntry = {
        id: crypto.randomUUID(),
        ...recipe,
        name: `${TYPE_LABELS[recipe.type]} — ${RANGE_LABELS[recipe.dateRange] ?? recipe.dateRange}`,
        sizeBytes: blob.size,
        timestamp: Date.now(),
      }
      setLog((prev) => {
        const next = [...prev, entry].slice(-LOG_LIMIT)
        writeLog(next)
        return next
      })
      setStatusMessage(`Downloaded ${filename}`)
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => runExport({ type: exportType, dateRange, format: exportFormat })

  const totalExports = log.length
  const totalBytes = log.reduce((sum, e) => sum + e.sizeBytes, 0)

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
              onChange={(e) => setExportType(e.target.value as ExportType)}
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
          {exportType !== 'alerts' && (
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
              </select>
            </div>
          )}

          {/* Export Format */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">Format</label>
            <div className="space-y-2">
              {(['csv', 'json'] as const).map((format) => (
                <label key={format} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="rounded"
                  />
                  <span className="text-foreground font-semibold uppercase">{format}</span>
                  <span className="text-xs text-muted-foreground">
                    {format === 'csv' ? '(Spreadsheet)' : '(Data Interchange)'}
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
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting…' : 'Start Export'}
          </Button>

          {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {log.length > 0 ? (
            [...log].reverse().map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.format.toUpperCase()} • {formatBytes(item.sizeBytes)} •{' '}
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => runExport({ type: item.type, dateRange: item.dateRange, format: item.format })}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  title="Download again"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <FileText className="w-5 h-5" />
              No exports yet — run one above.
            </div>
          )}
        </div>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary p-4 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Exports</p>
          <p className="text-2xl font-bold text-foreground">{totalExports}</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Data Size</p>
          <p className="text-2xl font-bold text-foreground">{formatBytes(totalBytes)}</p>
        </div>
      </div>
    </div>
  )
}
