'use client'

import { useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, Save } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        
        const result = await login(formData)
        
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // El redirect ya lo hace la server action
            router.refresh()
        }
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2 uppercase">Entrar</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Tu agenda te espera</p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="email"
                                type="email"
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
                                name="password"
                                type="password"
                                required
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-bold uppercase tracking-tight">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Autenticando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        ¿Aún no tienes cuenta?{' '}
                        <Link href="/auth/signup" className="text-indigo-600 hover:underline">Regístrate gratis</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}