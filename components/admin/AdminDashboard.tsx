'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Band, Event } from '@/types'
import { Pencil, Trash2, Plus, Calendar, Music, MapPin, X, Save, Loader2, Search, Tag } from 'lucide-react'
import { saveRecord, deleteRecord } from '@/app/admin/actions'

// ---------- TYPES ----------
type EventWithBand = Event & { band_name: string }

interface AdminDashboardProps {
    initialBands: Band[]
    initialEvents: EventWithBand[]
}

// ---------- MAIN COMPONENT ----------
export default function AdminDashboard({ initialBands, initialEvents }: AdminDashboardProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'events' | 'bands'>('events')
    const [isPending, startTransition] = useTransition()
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Band | Event | null>(null)
    const [formType, setFormType] = useState<'band' | 'event'>('event')

    const generateSlug = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, '').replace(/ +/g, '-')

    const handleDelete = (table: 'bands' | 'events', id: string) => {
        const cleanId = id.trim()
        if (!confirm(`¿Estás seguro de eliminar este registro?`)) return

        startTransition(async () => {
            const result = await deleteRecord(table, cleanId)
            if (result.success) {
                router.refresh()
            } else {
                alert(`Error: ${result.error}`)
            }
        })
    }

    const openForm = (type: 'band' | 'event', item: Band | Event | null = null) => {
        setFormType(type)
        setEditingItem(item)
        setIsPanelOpen(true)
    }

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const rawData = Object.fromEntries(formData.entries()) as Record<string, any>

        const table = formType === 'band' ? 'bands' : 'events'
        const cleanData: any = { ...rawData }
        if (formType === 'band') cleanData.slug = generateSlug(cleanData.name)

        delete cleanData.id

        startTransition(async () => {
            try {
                const result = await saveRecord(table, cleanData, editingItem?.id)
                if (result.success) {
                    setIsPanelOpen(false)
                    router.refresh()
                }
            } catch (error: any) {
                alert('Error al guardar: ' + error.message)
            }
        })
    }

    return (
        <div className="relative">
            {isPending && (
                <div className="fixed inset-0 z-[2000] bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            )}

            <div className="space-y-6">
                <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit border border-slate-200">
                    <button onClick={() => setActiveTab('events')} className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'events' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>
                        <Calendar size={14} /> Eventos
                    </button>
                    <button onClick={() => setActiveTab('bands')} className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'bands' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>
                        <Music size={14} /> Bandas
                    </button>
                </div>

                {activeTab === 'events' ? (
                    <EventsTable
                        events={initialEvents}
                        onEdit={(e: any) => openForm('event', e)}
                        onDelete={(id: string) => handleDelete('events', id)}
                        onAdd={() => openForm('event')}
                    />
                ) : (
                    <BandsTable
                        bands={initialBands}
                        onEdit={(b: any) => openForm('band', b)}
                        onDelete={(id: string) => handleDelete('bands', id)}
                        onAdd={() => openForm('band')}
                    />
                )}
            </div>

            {/* PANEL LATERAL */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-[1000] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                {editingItem ? 'Editar' : 'Añadir'} {formType === 'band' ? 'Banda' : 'Evento'}
                            </h2>
                            <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                            {formType === 'band' ? (
                                <BandFormFields item={editingItem as Band | null} />
                            ) : (
                                <EventFormFields item={editingItem as Event | null} bands={initialBands} />
                            )}

                            <div className="pt-8">
                                <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- TABLAS ---

function EventsTable({ events, onEdit, onDelete, onAdd }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex flex-col text-left">
                    <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Agenda de Bolos</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{events.length} registros</p>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 bg-indigo-600 text-white text-[10px] font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-700 uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all">
                    <Plus size={14} /> <span className="hidden sm:inline">Nuevo Bolo</span><span className="sm:hidden">Nuevo</span>
                </button>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="block sm:hidden divide-y divide-slate-100">
                {events.map((event: any) => (
                    <div key={event.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{event.band_name}</span>
                                    <span className="text-[8px] font-mono text-slate-300 bg-slate-50 px-1 rounded">#{event.id?.slice(-4)}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{event.venue_name}</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(event)} className="p-2 text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
                                <button onClick={() => onDelete(event.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600 font-medium">{new Date(event.date).toLocaleDateString('es-ES')}</span>
                            <span className="text-slate-400 font-bold uppercase">{event.city}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vista Escritorio (Table) */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-50">
                        {events.map((event: any) => (
                            <tr key={event.id} className="hover:bg-indigo-50/30 group transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{event.band_name}</span>
                                        <span className="text-[8px] font-mono text-slate-300 bg-slate-50 px-1 rounded uppercase">#{event.id?.slice(-4)}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{event.venue_name}</span>
                                    {event.title && <span className="block text-[9px] text-indigo-500 font-bold uppercase mt-1 italic">"{event.title}"</span>}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm text-slate-600 font-medium">{new Date(event.date).toLocaleDateString('es-ES')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{event.city}</div>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => onEdit(event)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Pencil size={15} /></button>
                                        <button onClick={() => onDelete(event.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function BandsTable({ bands, onEdit, onDelete, onAdd }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex flex-col text-left">
                    <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Mis Proyectos</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{bands.length} bandas</p>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 bg-indigo-600 text-white text-[10px] font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-700 uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all">
                    <Plus size={14} /> <span className="hidden sm:inline">Añadir Banda</span><span className="sm:hidden">Añadir</span>
                </button>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="block sm:hidden divide-y divide-slate-100">
                {bands.map((band: any) => (
                    <div key={band.id} className="p-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{band.name}</span>
                                <span className="text-[8px] font-mono text-slate-300 bg-slate-50 px-1 rounded">#{band.id?.slice(-4)}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{band.genre || 'Sin Género'}</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => onEdit(band)} className="p-2 text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
                            <button onClick={() => onDelete(band.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vista Escritorio (Table) */}
            <div className="hidden sm:block">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-50">
                        {bands.map((band: any) => (
                            <tr key={band.id} className="hover:bg-indigo-50/30 group transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 block">{band.name}</span>
                                        <span className="text-[8px] font-mono text-slate-300 bg-slate-50 px-1 rounded uppercase">#{band.id?.slice(-4)}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{band.genre || 'Sin Género'}</span>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => onEdit(band)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Pencil size={15} /></button>
                                        <button onClick={() => onDelete(band.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// --- FORMULARIOS ---

function BandFormFields({ item }: { item: Band | null }) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nombre de la Banda</label>
                <input name="name" defaultValue={item?.name} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-700" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Género Musical</label>
                <input name="genre" defaultValue={item?.genre ?? ''} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-700" />
            </div>
        </div>
    )
}

function EventFormFields({ item, bands }: { item: Event | null, bands: Band[] }) {
    const [lat, setLat] = useState<string>(item?.lat?.toString() || '')
    const [lng, setLng] = useState<string>(item?.lng?.toString() || '')
    const [searching, setSearching] = useState(false)

    const findCoordinates = async () => {
        const venue = (document.getElementsByName('venue_name')[0] as HTMLInputElement).value
        const city = (document.getElementsByName('city')[0] as HTMLInputElement).value
        if (!venue || !city) return
        setSearching(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(venue + ', ' + city + ', Spain')}`)
            const data = await res.json()
            if (data?.[0]) {
                setLat(data[0].lat)
                setLng(data[0].lon)
            }
        } catch (e) { }
        setSearching(false)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                    <Tag size={12} className="text-indigo-600" /> Título de la Gira / Nombre Bolo
                </label>
                <input name="title" defaultValue={item?.title || ''} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold text-indigo-600" placeholder="Ej: Gira '24: El Retorno" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Banda</label>
                <select name="band_id" defaultValue={(item as any)?.band_id || ''} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 appearance-none">
                    <option value="">Selecciona una banda...</option>
                    {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Fecha</label>
                <input name="date" type="datetime-local" defaultValue={item?.date ? new Date(item.date).toISOString().slice(0, 16) : ''} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Recinto</label>
                    <input name="venue_name" defaultValue={item?.venue_name} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-700" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ciudad</label>
                    <input name="city" defaultValue={item?.city} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-700" />
                </div>
            </div>
            <button type="button" onClick={findCoordinates} disabled={searching} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-600 transition-all">
                {searching ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />} Autolocalizar
            </button>
            <div className="grid grid-cols-2 gap-4 opacity-40">
                <input name="lat" type="hidden" value={lat} />
                <input name="lng" type="hidden" value={lng} />
                <div className="text-[10px] font-mono">LAT: {lat || '...'}</div>
                <div className="text-[10px] font-mono">LNG: {lng || '...'}</div>
            </div>
        </div>
    )
}