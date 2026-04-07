'use client'

import { MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LocationTracker() {
  const location = {
    latitude: 40.7128,
    longitude: -74.006,
    address: '123 Cold Storage Avenue, New York, NY 10001',
    lastUpdated: '2 minutes ago',
    status: 'Active',
  }

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground mb-4">Device Location</h3>
        <div className="w-full h-96 bg-secondary rounded-lg flex items-center justify-center relative border border-border">
          {/* Simple SVG map representation */}
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Background */}
            <rect width="400" height="300" fill="#1e293b" />
            
            {/* Grid */}
            <g stroke="#334155" strokeWidth="1" opacity="0.3">
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
              ))}
            </g>

            {/* Location marker */}
            <g>
              <circle cx="200" cy="150" r="20" fill="#3b82f6" opacity="0.3" />
              <circle cx="200" cy="150" r="12" fill="#3b82f6" opacity="0.6" />
              <circle cx="200" cy="150" r="6" fill="#3b82f6" />
              <path
                d="M 200 155 L 195 165 L 205 165 Z"
                fill="#3b82f6"
              />
            </g>

            {/* Text info */}
            <text x="200" y="40" textAnchor="middle" fill="#e8ecf1" fontSize="14" fontWeight="bold">
              Cold Storage Unit Location
            </text>
          </svg>
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
              <p className="text-foreground font-mono font-semibold">{location.latitude}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="text-foreground font-mono font-semibold">{location.longitude}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precision</p>
              <p className="text-foreground font-semibold">±5 meters</p>
            </div>
          </div>
        </div>

        {/* Address & Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Location Info
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-foreground font-semibold">{location.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-foreground font-semibold">{location.lastUpdated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GPS Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-foreground font-semibold">{location.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route & Distance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distance from Home Base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Direct Distance</p>
            <p className="text-3xl font-bold text-primary">2.3 km</p>
            <p className="text-xs text-muted-foreground mt-1">Straight line</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Travel Distance</p>
            <p className="text-3xl font-bold text-primary">3.1 km</p>
            <p className="text-xs text-muted-foreground mt-1">By road</p>
          </div>
        </div>
        <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          Get Directions
        </Button>
      </div>

      {/* Geofence Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Geofence Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-foreground font-semibold">Authorized Service Area</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-success text-sm font-semibold">Within Bounds</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-foreground font-semibold">Alert Zone</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-success text-sm font-semibold">Safe Distance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
