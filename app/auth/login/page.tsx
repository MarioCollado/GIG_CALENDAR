'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleFormAction(formData: FormData) {
        setLoading(true)
        setError(null)
        
        console.log('--- INICIANDO LOGIN POR SERVIDOR ---')
        
        try {
            const result = await loginAction(formData)
            
            if (result?.error) {
                console.error('--- ERROR EN LOGIN ---', result.error)
                setError(result.error)
                setLoading(false)
            } else {
                console.log('--- LOGIN EXITOSO, REDIRIGIENDO... ---')
                // El redirect lo hace la server action, pero forzamos refresh para asegurar sesión
                router.refresh()
            }
        } catch (err) {
            // redirect() lanza un error interno en Next.js, es normal si no entra en el bloque error
            console.log('--- PROCESO FINALIZADO (Posible redirección en curso) ---')
        }
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50/50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 text-white mb-6 shadow-xl shadow-indigo-200">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2 uppercase">Bienvenido</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Accede a tu agenda de bolos</p>
                </div>

                <form action={handleFormAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium placeholder:text-slate-300"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-tight animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black uppercase tracking-[0.15em] py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Verificando...
                            </>
                        ) : (
                            <>
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        ¿Nuevo por aquí?{' '}
                        <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 transition-colors border-b-2 border-indigo-100 hover:border-indigo-600 pb-0.5 ml-1">
                            Crea una cuenta
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}