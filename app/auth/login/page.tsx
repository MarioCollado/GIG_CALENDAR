'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { Loader2, Music2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFormAction(formData: FormData) {
        const password = formData.get('password') as string
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }
        setLoading(true)
        setError(null)
        const result = await loginAction(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: '#0f172a' }}
        >
            {/* Glow de fondo */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
            />

            <div
                className="relative w-full max-w-md rounded-2xl p-8 sm:p-10"
                style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <Music2 size={22} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f1f5f9' }}>
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                        Accede a tu agenda de bolos
                    </p>
                </div>

                {/* Form */}
                <form action={handleFormAction} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            disabled={loading}
                            placeholder="tu@email.com"
                            className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-40"
                            style={{
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f1f5f9',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#6366f1')}
                            onBlur={e => (e.target.style.borderColor = '#334155')}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            autoComplete="current-password"
                            disabled={loading}
                            placeholder="········"
                            className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-40"
                            style={{
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f1f5f9',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#6366f1')}
                            onBlur={e => (e.target.style.borderColor = '#334155')}
                        />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg px-4 py-3 text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(99,102,241,0.6)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(99,102,241,0.3)')}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px" style={{ background: '#334155' }} />
                    <span className="text-xs" style={{ color: '#475569' }}>¿No tienes cuenta?</span>
                    <div className="flex-1 h-px" style={{ background: '#334155' }} />
                </div>

                <div className="text-center">
                    <Link
                        href="/auth/signup"
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: '#818cf8' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#a5b4fc')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#818cf8')}
                    >
                        Crear una cuenta nueva →
                    </Link>
                </div>
            </div>
        </main>
    )
}