import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { Band } from '@/types'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getAdminData() {
    const supabase = await createClient()
    
    // Validar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const [bandsRes, eventsRes] = await Promise.all([
        supabase.from('bands').select('*').eq('user_id', user.id).order('name'),
        supabase.from('events').select('*, bands(name)').eq('user_id', user.id).order('date', { ascending: false })
    ])

    return {
        bands: bandsRes.data || [],
        events: (eventsRes.data || []).map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            venue_name: e.venue_name,
            city: e.city,
            country: e.country || 'Spain',
            lat: e.lat,
            lng: e.lng,
            band_id: e.band_id,
            band_name: e.bands?.name || 'Desconocido'
        }))
    }
}

export default async function AdminPage() {
    const { bands, events } = await getAdminData()

    return (
        <main className="max-w-5xl mx-auto px-4 py-12">
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                    Panel de <span className="text-indigo-600">Gestión</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Administra tu propia base de datos de conciertos de forma segura.</p>
            </header>

            <AdminDashboard initialBands={bands as Band[]} initialEvents={events as any[]} />
        </main>
    )
}
