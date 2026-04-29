'use client'

import { useEffect, useState } from 'use-client' // Corrigiendo un posible error de importación previo si existiera, aunque Next.js prefiere el string arriba.
import { useEffect as useReactEffect, useState as useReactState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User as UserIcon, LogIn, Calendar, Map, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useReactState<any>(null)

    useReactEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navLinks = [
        { name: 'Agenda', href: '/', icon: Calendar },
        { name: 'Mapa', href: '/mapa', icon: Map },
        { name: 'Gestión', href: '/admin', icon: LayoutDashboard },
    ]

    return (
        <>
            {/* --- TOP NAVBAR --- */}
            <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    
                    {/* Logo */}
                    <div className="flex-none">
                        <Link href="/" className="font-black text-xl tracking-tighter text-slate-900 whitespace-nowrap">
                            MIS<span className="text-indigo-600">BOLOS.</span>
                        </Link>
                    </div>
                    
                    {/* Menú - SOLO VISIBLE EN PC (md:flex) */}
                    <div className="hidden md:flex flex-1 justify-center items-center px-4">
                        <div className="flex gap-1 items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link 
                                        key={link.href}
                                        href={link.href} 
                                        className={`flex items-center justify-center rounded-lg transition-all ${
                                            isActive 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
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

                    {/* Botón Usuario */}
                    <div className="flex-none flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px]">
                                    {user.user_metadata?.username || 'User'}
                                </span>
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
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg"
                            >
                                <LogIn size={14} /> <span className="hidden sm:inline">Entrar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- BOTTOM NAVBAR (Solo Móvil) --- */}
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
