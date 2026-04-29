'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Botón para centrar mapa en ubicación actual
function LocationButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 13)
          setLocating(false)
        },
        () => {
          alert('No se pudo obtener tu ubicación')
          setLocating(false)
        }
      )
    } else {
      alert('Geolocalización no soportada')
      setLocating(false)
    }
  }

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="absolute bottom-10 right-10 z-[1000] bg-white text-slate-900 font-bold px-6 py-3 rounded-full shadow-2xl hover:bg-slate-50 transition-all border border-slate-200"
    >
      {locating ? '📍 Localizando...' : '📍 Mi ubicación'}
    </button>
  )
}

interface Concert {
  id: string
  title: string | null
  date: string
  venue_name: string
  city: string
  lat: number
  lng: number
  ticket_url: string | null
  band_name: string
  band_genre: string | null
  user_color?: string
}

export default function ConcertMap({ initialConcerts }: { initialConcerts: Concert[] }) {
  // LOG PARA DEPURACIÓN
  console.log('Conciertos recibidos en el mapa:', initialConcerts)

  const [concerts] = useState(initialConcerts)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (!concerts.length) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 italic p-10 text-center">
        No se han encontrado conciertos con coordenadas válidas.<br />
        Revisa la consola (F12) para ver los datos.
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-slate-200">
      <MapContainer
        center={[40.416775, -3.703790]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {/* Usamos CircleMarker (SVG nativo) para asegurar visibilidad */}
        {concerts.map((concert) => (
          <CircleMarker
            key={concert.id}
            center={[concert.lat, concert.lng]}
            radius={10}
            pathOptions={{
              fillColor: concert.user_color || '#6366f1',
              color: 'white',
              weight: 2,
              fillOpacity: 1
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold" style={{ color: concert.user_color }}>{concert.band_name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{concert.venue_name}</p>
                <p className="text-xs mt-1">📅 {formatDate(concert.date)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <LocationButton />
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute top-6 left-6 z-[1000] bg-white/90 p-4 shadow-xl border border-slate-200">
        <span className="text-sm font-bold text-slate-700">{concerts.length} Eventos localizados</span>
      </div>
    </div>
  )
}
