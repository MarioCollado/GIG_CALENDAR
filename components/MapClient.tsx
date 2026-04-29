// components/MapClient.tsx
'use client'

import dynamic from 'next/dynamic'

const ConcertMap = dynamic(
    () => import('@/components/ConcertMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
                Cargando mapa de conciertos...
            </div>
        ),
    }
)

export default function MapClient(props: any) {
    return <ConcertMap {...props} />
}