import { Event } from '@/types'

const D = {
    bg: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#e2e8f0',
    muted: '#94a3b8',
    dim: '#475569',
    accent: '#6366f1',
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
        full: date.toLocaleDateString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
    }
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0)  return { label: 'Finalizado', color: '#475569', bg: 'rgba(71,85,105,0.15)', border: 'rgba(71,85,105,0.3)' }
    if (days === 0) return { label: '¡HOY TOCA!', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' }
    if (days === 1) return { label: 'Mañana',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' }
    return                 { label: `En ${days} días`, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' }
}

export default function EventCard({ event }: { event: Event }) {
    const dateInfo = formatDate(event.date)
    const u = daysUntil(event.date)
    const userColor = (event as any).user?.color || D.accent

    return (
        <div
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-1px]"
            style={{ background: D.surface, border: `1px solid ${D.border}` }}
        >
            <div className="flex p-4 sm:p-5 gap-4 sm:gap-6">

                {/* Bloque de fecha */}
                <div
                    className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[56px] sm:h-[64px] rounded-xl shrink-0"
                    style={{ background: D.bg, border: `1px solid ${D.border}` }}
                >
                    <span className="text-xl sm:text-2xl font-black leading-none" style={{ color: D.text }}>
                        {dateInfo.day}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase" style={{ color: D.dim }}>
                        {dateInfo.month}
                    </span>
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Badge urgencia */}
                        <span
                            className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ color: u.color, background: u.bg, border: `1px solid ${u.border}` }}
                        >
                            {u.label}
                        </span>

                        {/* Badge usuario */}
                        {(event as any).user && (
                            <span
                                className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                                style={{
                                    color: userColor,
                                    background: `${userColor}18`,
                                    border: `1px solid ${userColor}40`,
                                }}
                            >
                                @{(event as any).user.username}
                            </span>
                        )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-black truncate leading-tight" style={{ color: D.text }}>
                        {event.bands?.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm mt-1 font-medium">
                        <span className="truncate" style={{ color: D.muted }}>{event.venue_name}</span>
                        <span className="hidden sm:inline" style={{ color: D.border }}>•</span>
                        <span className="w-full sm:w-auto" style={{ color: D.dim }}>{event.city}</span>
                    </div>
                </div>

                {/* Confirmado (desktop) */}
                <div className="hidden sm:flex flex-col items-end justify-center shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-25" style={{ color: userColor }}>
                        Confirmado
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                className="px-5 py-3 flex justify-between items-center"
                style={{ background: D.bg, borderTop: `1px solid ${D.border}` }}
            >
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: D.dim }}>
                    {dateInfo.full}
                </span>
                <span className="text-[11px] font-bold transition-colors" style={{ color: D.accent }}>
                    Logística →
                </span>
            </div>
        </div>
    )
}