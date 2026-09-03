'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const deviceIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:-8px;background:#3b82f6;opacity:0.25;border-radius:9999px;"></div>
      <div style="position:absolute;inset:0;background:#3b82f6;border:2px solid white;border-radius:9999px;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

interface LocationMapProps {
  latitude: number
  longitude: number
  label?: string
}

export default function LocationMap({ latitude, longitude, label }: LocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', background: '#1e293b' }}
    >
      <TileLayer
        className="map-tiles-dark"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={deviceIcon}>
        {label && <Popup>{label}</Popup>}
      </Marker>
      <Recenter lat={latitude} lng={longitude} />
    </MapContainer>
  )
}
