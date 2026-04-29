'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LogIn, Calendar, Map, LayoutDashboard, Loader2 } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // 1. Efecto para cambios de RUTA (Captura la redirección post-login)
    useEffect(() => {
        const handleRouteChange = async () => {
            // Si venimos de login o estamos entrando a admin, forzamos verificación visual
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            
            // Delay para que la transición sea suave y profesional
            setTimeout(() => setLoading(false), 600)
        }

        handleRouteChange()
    }, [pathname, supabase])

    // 2. Efecto para cambios de AUTH en tiempo real (Captura el logout y eventos manuales)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AUTH EVENT]', event)
            
            if (event === 'SIGNED_OUT') {
                setLoading(true)
                setUser(null)
                setTimeout(() => {
                    setLoading(false)
                    router.push('/auth/login')
                    router.refresh()
                }, 600)
            }

            if (event === 'SIGNED_IN') {
                setUser(session?.user ?? null)
                setLoading(false)
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
    }

    const navLinks = [
        { name: 'Agenda', href: '/', icon: Calendar },
        { name: 'Mapa', href: '/mapa', icon: Map },
        { name: 'Gestión', href: '/admin', icon: LayoutDashboard },
    ]

    return (
        <>
            <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    
                    {/* Logo */}
                    <div className="flex-none">
                        <Link href="/" className="font-black text-xl tracking-tighter text-slate-900">
                            MIS<span className="text-indigo-600">BOLOS.</span>
                        </Link>
                    </div>
                    
                    {/* Menú PC */}
                    <div className="hidden md:flex flex-1 justify-center items-center px-4">
                        <div className="flex gap-1 items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link 
                                        key={link.href}
                                        href={link.href} 
                                        className={`flex items-center justify-center rounded-lg transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        } px-5 py-2`}
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                            {link.name}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Botón Usuario / Spinner Dinámico */}
                    <div className="flex-none flex items-center gap-2 min-w-[80px] justify-end">
                        {loading ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Sincronizando</span>
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">
                                        {user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[8px] font-bold text-indigo-500 uppercase">Perfil Activo</span>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link 
                                href="/auth/login"
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg animate-in fade-in duration-500"
                            >
                                <LogIn size={14} />
                                <span className="hidden sm:inline">Entrar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Nav Móvil */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe">
                <div className="grid grid-cols-3 h-16">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        const Icon = link.icon
                        return (
                            <Link 
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                                    isActive ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'scale-110' : ''} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{link.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}