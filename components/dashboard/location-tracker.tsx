'use client'

import dynamic from 'next/dynamic'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, Navigation } from 'lucide-react'
import { useTelemetryLatest } from '@/hooks/use-telemetry'

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
})

export default function LocationTracker() {
  const { data, loading, error } = useTelemetryLatest()

  const hasFix = data?.latitude != null && data?.longitude != null

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground mb-4">Device Location</h3>
        <div className="w-full h-96 bg-secondary rounded-lg overflow-hidden relative border border-border">
          {hasFix ? (
            <LocationMap
              latitude={data!.latitude as number}
              longitude={data!.longitude as number}
              label="Cold Storage Unit"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              {loading ? 'Loading location…' : error ? `Error: ${error}` : 'No GPS fix yet'}
            </div>
          )}
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coordinates */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Coordinates
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>
              <p className="text-foreground font-mono font-semibold">
                {hasFix ? `${data!.latitude!.toFixed(4)}°` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="text-foreground font-mono font-semibold">
                {hasFix ? `${data!.longitude!.toFixed(4)}°` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Source</p>
              <p className="text-foreground font-semibold capitalize">{data?.source ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Location Info
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-foreground font-semibold capitalize">{data?.systemStatus ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-foreground font-semibold">
                {data?.timestamp
                  ? formatDistanceToNow(data.timestamp, { addSuffix: true })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GPS Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${hasFix ? 'bg-success' : 'bg-muted-foreground'}`}
                ></div>
                <span className="text-foreground font-semibold">
                  {hasFix ? 'Active' : 'No Fix'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
