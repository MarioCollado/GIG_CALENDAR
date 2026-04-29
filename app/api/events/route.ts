import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events?band=radiohead&from=2026-01-01
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const band = searchParams.get('band')     // slug de banda
  const from = searchParams.get('from')     // fecha ISO opcional

  let query = supabase
    .from('events')
    .select(`
      id, title, date, venue_name, city, country, lat, lng, ticket_url, notes,
      bands ( name, slug, image_url )
    `)
    .gte('date', from ?? new Date().toISOString())
    .order('date', { ascending: true })
    .limit(50)

  if (band) {
    // filtra por slug de banda via join
    query = query.eq('bands.slug', band)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/events
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('events')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}