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

    // Sincronización inicial + listener de cambios reales
    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }
        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                setUser(session?.user ?? null)
                setLoading(false)
            }
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setLoading(false)
                router.push('/auth/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    // Verificación silenciosa al cambiar de ruta (sin spinner)
    useEffect(() => {
        const checkSessionSilently = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.id !== user?.id) {
                setUser(session?.user ?? null)
            }
        }
        checkSessionSilently()
    }, [pathname, user?.id, supabase])

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
            {/* Top Navbar - Dark */}
            <nav
                className="sticky top-0 z-[100] backdrop-blur-md border-b"
                style={{
                    background: 'rgba(15,23,42,0.85)',
                    borderColor: '#1e293b',
                }}
            >
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex-none">
                        <Link href="/" className="font-bold text-base tracking-tight" style={{ color: '#f1f5f9' }}>
                            MIS<span style={{ color: '#818cf8' }}>BOLOS.</span>
                        </Link>
                    </div>

                    {/* Menú PC */}
                    <div className="hidden md:flex flex-1 justify-center items-center px-4">
                        <div
                            className="flex gap-1 items-center p-1 rounded-xl"
                            style={{ background: '#1e293b', border: '1px solid #334155' }}
                        >
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center justify-center rounded-lg transition-all duration-200 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap"
                                        style={{
                                            background: isActive ? '#6366f1' : 'transparent',
                                            color: isActive ? '#fff' : '#94a3b8',
                                            boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                                        }}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Botón Usuario */}
                    <div className="flex-none flex items-center gap-2 min-w-[60px] justify-end">
                        {loading ? (
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: '#1e293b', border: '1px solid #334155' }}
                            >
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#818cf8' }} />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-[10px] font-bold uppercase truncate max-w-[120px]" style={{ color: '#f1f5f9' }}>
                                        {user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[8px] font-semibold uppercase" style={{ color: '#818cf8' }}>En línea</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-xl transition-all duration-200"
                                    style={{ color: '#64748b' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#64748b')}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg text-white transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 0 16px rgba(99,102,241,0.3)',
                                }}
                                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 24px rgba(99,102,241,0.6)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 16px rgba(99,102,241,0.3)')}
                            >
                                <LogIn size={14} />
                                <span className="hidden sm:inline">Entrar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Bottom Nav Móvil - Dark */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t pb-safe"
                style={{
                    background: 'rgba(15,23,42,0.95)',
                    borderColor: '#1e293b',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className="grid grid-cols-3 h-16">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center gap-1 transition-all duration-200"
                                style={{ color: isActive ? '#818cf8' : '#475569' }}
                            >
                                <Icon size={20} style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{link.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}