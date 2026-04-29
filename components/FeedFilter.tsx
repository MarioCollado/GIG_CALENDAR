'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Globe, User, Loader2 } from 'lucide-react'
import { useTransition } from 'react'

export default function FeedFilter({ isLoggedIn }: { isLoggedIn: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    
    const currentFilter = searchParams.get('view') || 'all'

    const setFilter = (view: 'all' | 'mine') => {
        const params = new URLSearchParams(searchParams)
        params.set('view', view)
        
        startTransition(() => {
            router.push(`/?${params.toString()}`)
        })
    }

    if (!isLoggedIn) return null

    return (
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200 mb-8 relative">
            {isPending && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-indigo-600" size={16} />
                </div>
            )}
            
            <button 
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    currentFilter === 'all' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                <Globe size={14} /> Social
            </button>
            
            <button 
                onClick={() => setFilter('mine')}
                className={`flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    currentFilter === 'mine' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                <User size={14} /> Mis Bolos
            </button>
        </div>
    )
}
