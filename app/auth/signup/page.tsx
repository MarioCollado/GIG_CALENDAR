'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2, Save } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    
    const supabase = createClient()
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // En producción aquí se esperaría confirmación de email
            setTimeout(() => router.push('/auth/login'), 3000)
        }
    }

    if (success) {
        return (
            <main className="min-h-[80vh] flex items-center justify-center p-4 text-center">
                <div className="w-full max-w-md space-y-4 bg-white p-12 rounded-3xl border border-slate-100 shadow-xl">
                    <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">¡Cuenta creada!</h1>
                    <p className="text-slate-500 text-sm">Revisa tu email para confirmar tu cuenta. Redirigiendo al login...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">REGÍSTRATE</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Crea tu espacio de músico</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nombre de Usuario</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                placeholder="paco_lucia"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-tight">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Crear Cuenta</>}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/auth/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
