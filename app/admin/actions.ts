'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Guarda o actualiza un registro vinculándolo automáticamente al usuario autenticado.
 */
export async function saveRecord(table: 'bands' | 'events', data: any, id?: string) {
    const supabase = await createClient()
    
    // Obtener usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('No autorizado')

    // Limpiar datos y forzar el user_id
    const { band_name, ...cleanData } = data
    const recordData = {
        ...cleanData,
        user_id: user.id
    }
    
    let result;
    if (id) {
        // El RLS se encargará de que solo se actualice si user_id coincide
        result = await supabase.from(table).update(recordData).eq('id', id).select()
    } else {
        result = await supabase.from(table).insert(recordData).select()
    }

    if (result.error) {
        console.error('[SAVE] Error:', result.error.message)
        throw new Error(result.error.message)
    }
    
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}

/**
 * Borra un registro validando la propiedad mediante RLS.
 */
export async function deleteRecord(table: 'bands' | 'events', id: string) {
    const supabase = await createClient()
    const cleanId = id.trim()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('No autorizado')

    const result = await supabase
        .from(table)
        .delete()
        .eq('id', cleanId)
    
    if (result.error) {
        console.error('[DELETE] Error:', result.error.message)
        return { success: false, error: result.error.message }
    }
    
    revalidatePath('/admin')
    revalidatePath('/')
    
    return { success: true }
}