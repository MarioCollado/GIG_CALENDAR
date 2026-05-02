import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/EventCard'
import FeedFilter from '@/components/FeedFilter'
import ActivityHeatmap from '@/components/ActivityHeatmap'

async function getEvents(view: string, userId?: string): Promise<any[]> {
    const supabase = await createClient()

    let query = supabase
        .from('events')
        .select(`
            id,
            title,
            date,
            venue_name,
            city,
            country,
            lat,
            lng,
            bands ( name, slug, image_url ),
            user:profiles!user_id ( username, color )
        `)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(50)

    // Aplicar filtro si es necesario
    if (view === 'mine' && userId) {
        query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
        console.error('--- ERROR EN SUPABASE ---', error)
        return []
    }

    if (!data) return []

    return (data as any[]).map(event => ({
        ...event,
        bands: Array.isArray(event.bands) ? event.bands[0] : event.bands,
        user: event.user || { username: 'Invitado', color: '#94a3b8' }
    }))
}

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const params = await searchParams
    const view = params.view || 'all'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const events = await getEvents(view, user?.id)

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

            <header className="mb-10 sm:mb-12 relative">
                {/* <ActivityHeatmap events={events} /> */}

                <div className="flex items-end justify-between mb-8 relative z-10">
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl sm:text-6xl font-black leading-none" style={{ color: '#818cf8' }}>
                            {events.length}
                        </span>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#475569' }}>
                            {view === 'mine' ? 'tus bolos' : 'próximos bolos'}
                        </span>
                    </div>
                </div>

                <div className="relative z-10">
                    <FeedFilter isLoggedIn={!!user} />
                </div>
            </header>

            <section className="space-y-6">
                {events.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs sm:text-sm">No hay bolos programados</p>
                        {view === 'mine' && (
                            <p className="text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase mt-2">Añade alguno en tu panel de gestión</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 sm:gap-8 relative">
                        {/* Línea de tiempo visual */}
                        <div className="absolute left-7 sm:left-8 top-0 bottom-0 w-px bg-slate-100 -z-10 hidden sm:block"></div>

                        {events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}