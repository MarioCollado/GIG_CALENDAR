'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData): Promise<{ error?: string; success?: string } | void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && data.session) {
    redirect('/admin')
  } else {
    return { success: 'Revisa tu email para confirmar la cuenta antes de entrar.' }
  }
}