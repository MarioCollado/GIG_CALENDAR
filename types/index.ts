export type Band = {
  id: string
  name: string
  slug: string
  genre: string | null
  image_url: string | null
}

export type Event = {
  id: string
  title: string | null
  date: string
  venue_name: string
  city: string
  country: string
  lat: number | null
  lng: number | null
  bands: Pick<Band, 'name' | 'slug' | 'image_url'>
}