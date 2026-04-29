'use client'

import { useState } from 'react'
import { signup } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2, Rocket } from 'lucide-react'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(null)

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            setSuccess(result.success)
            setLoading(false)
        } else {
            // El redirect lo hace la server action si entra directo
            router.refresh()
        }
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2 uppercase">Registro</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Crea tu perfil de músico</p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nickname / Usuario</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="username"
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                placeholder="paco_drums"
                            />
                        </div>
                    </div>

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
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-bold uppercase tracking-tight">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 text-[10px] font-bold uppercase tracking-tight text-center">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creando perfil...
                            </>
                        ) : (
                            <>
                                <Rocket size={18} />
                                ¡Empezar Ahora!
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/auth/login" className="text-indigo-600 hover:underline">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
