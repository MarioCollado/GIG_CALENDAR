'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Traducciones de errores de Supabase al español
const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Debes confirmar tu email antes de entrar. Revisa tu bandeja de entrada.',
  'Too many requests': 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
  'User already registered': 'Este email ya tiene una cuenta registrada.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
}

function translateError(msg: string): string {
  return AUTH_ERRORS[msg] ?? msg
}

export async function loginAction(formData: FormData): Promise<{ error: string } | never> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  // Validación básica en servidor
  if (!email || !password) {
    return { error: 'Completa todos los campos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: translateError(error.message) }
  }

  // redirect() lanza un error interno de Next.js (NEXT_REDIRECT)
  // NUNCA envuelvas esto en try/catch — debe propagarse para funcionar
  redirect('/admin')
}