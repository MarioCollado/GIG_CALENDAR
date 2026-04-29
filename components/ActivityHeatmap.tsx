'use client'

import { useMemo } from 'react'

interface ActivityHeatmapProps {
    events: any[]
}

export default function ActivityHeatmap({ events }: ActivityHeatmapProps) {
    const days = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const result = []
        for (let i = 0; i < 112; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            
            const dateStr = date.toISOString().split('T')[0]
            const dayEvents = events.filter(e => e.date.split('T')[0] === dateStr)
            
            result.push({
                date,
                count: dayEvents.length,
                color: dayEvents.length > 0 ? (dayEvents[0].user?.color || '#6366f1') : null
            })
        }
        return result
    }, [events])

    const weeks = useMemo(() => {
        const weeksArr = []
        for (let i = 0; i < days.length; i += 7) {
            weeksArr.push(days.slice(i, i + 7))
        }
        return weeksArr
    }, [days])

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
            {/* Grid con posicionamiento responsivo */}
            <div className="flex gap-1.5 h-full items-center justify-center translate-x-10 md:translate-x-48 -translate-y-12 md:translate-y-0 rotate-3 scale-125 md:scale-150 transition-all duration-1000">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5">
                        {week.map((day, dayIndex) => (
                            <div 
                                key={dayIndex}
                                className={`w-3 h-3 rounded-[3px] transition-all duration-700 ${
                                    day.count === 0 
                                        ? 'bg-slate-200/50' 
                                        : 'shadow-sm'
                                }`}
                                style={day.count > 0 ? { 
                                    backgroundColor: day.color,
                                    opacity: Math.min(0.3 + (day.count * 0.4), 1),
                                    boxShadow: `0 0 15px ${day.color}60`
                                } : {}}
                            />
                        ))}
                    </div>
                ))}
            </div>
            
            {/* Recuperar los degradados de fundido para el look difuminado */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-slate-50" />
            
            {/* Máscara radial de legibilidad centralizada y sutil */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(248,250,252,0.6)_0%,rgba(248,250,252,0)_60%)] hidden md:block" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(248,250,252,0.6)_0%,rgba(248,250,252,0)_70%)] md:hidden" />
        </div>
    )
}
