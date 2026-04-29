import { supabase } from '@/lib/supabase'
import MapClient from '@/components/MapClient'

interface Concert {
  id: string
  title: string | null
  date: string
  venue_name: string
  city: string
  lat: number
  lng: number
  ticket_url: string | null
  notes?: string | null
  band_name: string
  band_genre: string | null
}

async function getConcerts(): Promise<any[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      date,
      venue_name,
      city,
      lat,
      lng,
      ticket_url,
      bands (name, genre),
      user:profiles!user_id (color)
    `)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching concerts:', error)
    return []
  }

  return (data as any[]).map((event: any) => {
    const band = Array.isArray(event.bands) ? event.bands[0] : event.bands
    return {
      ...event,
      band_name: band?.name || 'Artista Desconocido',
      band_genre: band?.genre || null,
      user_color: event.user?.color || '#94a3b8'
    }
  })
}

export default async function MapaPage() {
  const concerts = await getConcerts()
  
  return (
    <main className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <MapClient initialConcerts={concerts} />
    </main>
  )
}
