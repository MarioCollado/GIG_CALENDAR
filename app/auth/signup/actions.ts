'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const AUTH_ERRORS: Record<string, string> = {
  'User already registered': 'Este email ya tiene una cuenta registrada.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'El formato del email no es válido.',
  'Too many requests': 'Demasiados intentos. Espera unos minutos.',
}

function translateError(msg: string): string {
  return AUTH_ERRORS[msg] ?? msg
}

export async function signup(formData: FormData): Promise<{ error?: string; success?: string } | void> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const username = (formData.get('username') as string).trim()

  // Validación en servidor
  if (!email || !password || !username) {
    return { error: 'Completa todos los campos.' }
  }
  if (username.length < 3) {
    return { error: 'El nombre de usuario debe tener al menos 3 caracteres.' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  if (data.user && data.session) {
    // Registro exitoso sin necesidad de confirmar email
    redirect('/admin')
  }

  // Supabase requiere confirmación de email
  return { success: 'Revisa tu bandeja de entrada y confirma tu cuenta para poder entrar.' }
}