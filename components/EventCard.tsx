import { Event } from '@/types'

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
        full: date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: 'Finalizado', color: 'text-slate-400 bg-slate-100' }
    if (days === 0) return { label: '¡HOY TOCA!', color: 'text-rose-600 bg-rose-50 border-rose-100' }
    if (days === 1) return { label: 'Mañana', color: 'text-amber-600 bg-amber-50 border-amber-100' }
    return { label: `En ${days} días`, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
}

export default function EventCard({ event }: { event: Event }) {
    const dateInfo = formatDate(event.date)
    const urgency = daysUntil(event.date)

    return (
        <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex p-4 sm:p-5 gap-4 sm:gap-6">
                
                {/* Fecha */}
                <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[56px] sm:h-[64px] bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 shrink-0">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{dateInfo.day}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase">{dateInfo.month}</span>
                </div>

                {/* Info del Bolo */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full border ${urgency.color} uppercase tracking-wider`}>
                            {urgency.label}
                        </span>
                        {(event as any).user && (
                            <span 
                                className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border"
                                style={{ 
                                    color: (event as any).user.color, 
                                    borderColor: `${(event as any).user.color}30`,
                                    backgroundColor: `${(event as any).user.color}10`
                                }}
                            >
                                @{(event as any).user.username}
                            </span>
                        )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate leading-tight">
                        {event.bands?.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        <span className="text-slate-900 truncate">{event.venue_name}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="w-full sm:w-auto">{event.city}</span>
                    </div>
                </div>

                {/* Status/Check (Logística) - Oculto en móvil muy pequeño */}
                <div className="hidden sm:flex flex-col items-end justify-center shrink-0">
                    <div 
                        className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30"
                        style={{ color: (event as any).user?.color || '#cbd5e1' }}
                    >
                        Confirmado
                    </div>
                </div>
            </div>

            <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {dateInfo.full}
                </span >
                <div className="flex gap-4">
                    <span className="text-[11px] font-bold text-indigo-500 cursor-pointer hover:text-indigo-700">Logística →</span>
                </div>
            </div>
        </div>
    )
}