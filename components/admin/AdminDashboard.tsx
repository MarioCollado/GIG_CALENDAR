'use client'

import { useState, useTransition, useRef, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Band, Event } from '@/types'
import { Pencil, Trash2, Plus, Calendar, Music, X, Save, Loader2, Search, Tag } from 'lucide-react'
import { saveRecord, deleteRecord } from '@/app/admin/actions'

const D = {
    bg:      '#0f172a',
    surface: '#1e293b',
    border:  '#334155',
    text:    '#e2e8f0',
    muted:   '#94a3b8',
    dim:     '#475569',
    accent:  '#6366f1',
    danger:  '#f87171',
}

type EventWithBand = Event & { band_name: string }
interface AdminDashboardProps {
    initialBands: Band[]
    initialEvents: EventWithBand[]
}

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
        if (!confirm('¿Eliminar este registro?')) return
        startTransition(async () => {
            const r = await deleteRecord(table, id.trim())
            if (r.success) router.refresh()
            else alert(`Error: ${r.error}`)
        })
    }

    const openForm = (type: 'band' | 'event', item: Band | Event | null = null) => {
        setFormType(type); setEditingItem(item); setIsPanelOpen(true)
    }

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const rawData = Object.fromEntries(formData.entries()) as Record<string, any>
        const table = formType === 'band' ? 'bands' : 'events'
        
        const cleanData: any = { ...rawData }
        if (formType === 'band') {
            cleanData.slug = generateSlug(cleanData.name)
        } else {
            // Convertir coordenadas a números o null
            cleanData.lat = cleanData.lat ? parseFloat(cleanData.lat) : null
            cleanData.lng = cleanData.lng ? parseFloat(cleanData.lng) : null
            if (isNaN(cleanData.lat)) cleanData.lat = null
            if (isNaN(cleanData.lng)) cleanData.lng = null
        }

        delete cleanData.id
        startTransition(async () => {
            try {
                const r = await saveRecord(table, cleanData, editingItem?.id)
                if (r.success) { 
                    setIsPanelOpen(false)
                    setEditingItem(null)
                    router.refresh() 
                }
            } catch (err: any) { 
                alert('Error al guardar: ' + err.message) 
            }
        })
    }

    const tabs = [
        { id: 'events' as const, label: 'Eventos', icon: <Calendar size={14} /> },
        { id: 'bands'  as const, label: 'Bandas',  icon: <Music size={14} /> },
    ]

    return (
        <div className="relative">
            {/* Overlay de carga */}
            {isPending && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center"
                    style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: D.accent }} />
                </div>
            )}

            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex p-1 rounded-xl w-fit" style={{ background: D.surface, border: `1px solid ${D.border}` }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200"
                            style={{
                                background: activeTab === tab.id ? D.accent : 'transparent',
                                color: activeTab === tab.id ? '#fff' : D.dim,
                                boxShadow: activeTab === tab.id ? `0 0 16px rgba(99,102,241,0.35)` : 'none',
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'events'
                    ? <DataTable title="Agenda de Bolos" count={initialEvents.length} addLabel="Nuevo Bolo" onAdd={() => openForm('event')}
                        rows={initialEvents.map(ev => ({
                            id: ev.id,
                            primary: ev.band_name,
                            secondary: ev.venue_name,
                            extra: ev.title ? `"${ev.title}"` : undefined,
                            meta: new Date(ev.date).toLocaleDateString('es-ES'),
                            metaSub: ev.city,
                            onEdit: () => openForm('event', ev),
                            onDelete: () => handleDelete('events', ev.id),
                        }))} />
                    : <DataTable title="Mis Proyectos" count={initialBands.length} addLabel="Añadir Banda" onAdd={() => openForm('band')}
                        rows={initialBands.map(b => ({
                            id: b.id,
                            primary: b.name,
                            secondary: b.genre || 'Sin Género',
                            onEdit: () => openForm('band', b),
                            onDelete: () => handleDelete('bands', b.id),
                        }))} />
                }
            </div>

            {/* Panel lateral */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-[1000] overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setIsPanelOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md flex flex-col animate-in slide-in-from-right duration-300"
                        style={{ background: D.surface, borderLeft: `1px solid ${D.border}` }}>
                        <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${D.border}` }}>
                            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: D.text }}>
                                {editingItem ? 'Editar' : 'Añadir'} {formType === 'band' ? 'Banda' : 'Evento'}
                            </h2>
                            <button onClick={() => setIsPanelOpen(false)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: D.dim }}
                                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = D.text)}
                                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = D.dim)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                            {formType === 'band'
                                ? <BandFormFields key={editingItem?.id || 'new-band'} item={editingItem as Band | null} />
                                : <EventFormFields key={editingItem?.id || 'new-event'} item={editingItem as Event | null} bands={initialBands} />}
                            <button type="submit" disabled={isPending}
                                className="w-full flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${D.accent}, #8b5cf6)`, boxShadow: `0 0 20px rgba(99,102,241,0.3)` }}>
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- TABLA GENÉRICA ---
function DataTable({ title, count, addLabel, onAdd, rows }: {
    title: string; count: number; addLabel: string; onAdd: () => void
    rows: { id: string; primary: string; secondary: string; extra?: string; meta?: string; metaSub?: string; onEdit: () => void; onDelete: () => void }[]
}) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: D.surface, border: `1px solid ${D.border}` }}>
            <div className="p-4 sm:p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${D.border}` }}>
                <div>
                    <h2 className="font-bold uppercase text-xs tracking-widest" style={{ color: D.muted }}>{title}</h2>
                    <p className="text-[10px] font-bold uppercase mt-0.5" style={{ color: D.dim }}>{count} registros</p>
                </div>
                <button onClick={onAdd}
                    className="flex items-center gap-2 text-white text-[10px] font-black px-4 py-2.5 rounded-lg uppercase tracking-widest transition-all"
                    style={{ background: `linear-gradient(135deg, ${D.accent}, #8b5cf6)`, boxShadow: `0 0 12px rgba(99,102,241,0.25)` }}>
                    <Plus size={14} /> {addLabel}
                </button>
            </div>

            {rows.length === 0 ? (
                <div className="py-12 text-center text-sm font-bold uppercase tracking-widest" style={{ color: D.dim }}>
                    Sin registros
                </div>
            ) : (
                <table className="w-full text-left">
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id} style={{ borderBottom: `1px solid ${D.border}` }}
                                onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(99,102,241,0.06)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold" style={{ color: D.text }}>{row.primary}</span>
                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: D.dim, background: D.bg }}>
                                            #{row.id?.slice(-4)}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: D.dim }}>{row.secondary}</span>
                                    {row.extra && <span className="block text-[9px] font-bold uppercase mt-0.5 italic" style={{ color: D.accent }}>{row.extra}</span>}
                                </td>
                                {row.meta && (
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <div className="text-sm font-medium" style={{ color: D.muted }}>{row.meta}</div>
                                        {row.metaSub && <div className="text-[10px] font-bold uppercase" style={{ color: D.dim }}>{row.metaSub}</div>}
                                    </td>
                                )}
                                <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <IconBtn onClick={row.onEdit} hoverColor={D.accent}><Pencil size={15} /></IconBtn>
                                        <IconBtn onClick={row.onDelete} hoverColor={D.danger}><Trash2 size={15} /></IconBtn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

function IconBtn({ onClick, children, hoverColor }: { onClick: () => void; children: React.ReactNode; hoverColor: string }) {
    return (
        <button onClick={onClick} className="p-2.5 rounded-lg transition-all duration-200"
            style={{ color: D.dim }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = hoverColor)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = D.dim)}>
            {children}
        </button>
    )
}

// --- INPUTS REUTILIZABLES ---
const DarkInput = forwardRef<HTMLInputElement, any>(({ name, defaultValue, required, placeholder, type = 'text', style: extra = {}, ...props }, ref) => {
    return (
        <input 
            ref={ref}
            name={name} 
            type={type} 
            defaultValue={defaultValue} 
            required={required} 
            placeholder={placeholder}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
            style={{ background: D.bg, border: `1px solid ${D.border}`, color: D.text, ...extra }}
            onFocus={e => (e.target.style.borderColor = D.accent)}
            onBlur={e => (e.target.style.borderColor = D.border)}
            {...props}
        />
    )
})
DarkInput.displayName = 'DarkInput'

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: D.dim }}>{children}</label>
}

// --- FORMULARIO BANDA ---
function BandFormFields({ item }: { item: Band | null }) {
    return (
        <div className="space-y-6">
            <div className="space-y-2"><FieldLabel>Nombre de la Banda</FieldLabel>
                <DarkInput name="name" defaultValue={item?.name} required /></div>
            <div className="space-y-2"><FieldLabel>Género Musical</FieldLabel>
                <DarkInput name="genre" defaultValue={item?.genre ?? ''} /></div>
        </div>
    )
}

// --- FORMULARIO EVENTO ---
function EventFormFields({ item, bands }: { item: Event | null; bands: Band[] }) {
    const [lat, setLat] = useState(item?.lat?.toString() || '')
    const [lng, setLng] = useState(item?.lng?.toString() || '')
    const [searching, setSearching] = useState(false)
    
    const venueRef = useRef<HTMLInputElement>(null)
    const cityRef = useRef<HTMLInputElement>(null)

    const findCoordinates = async () => {
        const venue = venueRef.current?.value
        const city = cityRef.current?.value
        
        if (!venue || !city) {
            alert('Por favor, introduce el recinto y la ciudad')
            return
        }

        setSearching(true)
        try {
            const query = `${venue}, ${city}, Spain`
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            const data = await res.json()
            
            if (data && data.length > 0) {
                setLat(data[0].lat)
                setLng(data[0].lon)
            } else {
                alert('No se encontraron coordenadas para esta ubicación. Prueba a ser más específico.')
            }
        } catch (error) {
            console.error('Error in findCoordinates:', error)
            alert('Error al buscar la ubicación. Revisa tu conexión.')
        } finally {
            setSearching(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5" style={{ color: D.dim }}>
                    <Tag size={11} style={{ color: D.accent }} /> Título de Gira / Bolo
                </label>
                <DarkInput name="title" defaultValue={item?.title || ''} placeholder="Ej: Gira '25"
                    style={{ color: '#818cf8', fontWeight: 700 }} />
            </div>

            <div className="space-y-2">
                <FieldLabel>Banda</FieldLabel>
                <select name="band_id" defaultValue={(item as any)?.band_id || ''} required
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 appearance-none"
                    style={{ background: D.bg, border: `1px solid ${D.border}`, color: D.text }}
                    onFocus={e => (e.target.style.borderColor = D.accent)}
                    onBlur={e => (e.target.style.borderColor = D.border)}>
                    <option value="" style={{ background: D.surface }}>Selecciona una banda...</option>
                    {bands.map(b => <option key={b.id} value={b.id} style={{ background: D.surface }}>{b.name}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <FieldLabel>Fecha</FieldLabel>
                <DarkInput name="date" type="datetime-local"
                    defaultValue={item?.date ? new Date(item.date).toISOString().slice(0, 16) : ''} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <FieldLabel>Recinto</FieldLabel>
                    <DarkInput 
                        ref={venueRef}
                        name="venue_name" 
                        defaultValue={item?.venue_name} 
                        required 
                        placeholder="Nombre de la sala"
                    />
                </div>
                <div className="space-y-2">
                    <FieldLabel>Ciudad</FieldLabel>
                    <DarkInput 
                        ref={cityRef}
                        name="city" 
                        defaultValue={item?.city} 
                        required 
                        placeholder="Ciudad"
                    />
                </div>
            </div>

            <button type="button" onClick={findCoordinates} disabled={searching}
                className="w-full flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl transition-all disabled:opacity-50"
                style={{ background: D.bg, border: `1px solid ${D.border}` }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = D.accent)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = D.border)}>
                {searching ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />} Autolocalizar
            </button>

            <input name="lat" type="hidden" value={lat} />
            <input name="lng" type="hidden" value={lng} />
            <div className="flex gap-6 text-[10px] font-mono" style={{ color: D.dim, opacity: 0.4 }}>
                <span>LAT: {lat || '—'}</span><span>LNG: {lng || '—'}</span>
            </div>
        </div>
    )
}