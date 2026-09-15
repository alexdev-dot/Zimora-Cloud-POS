import { supabase } from '@/lib/supabase/client'
import { supplierFromSupabase, supplierToSupabase } from '@/lib/utils/supabase'
import type { Supplier } from '@/types'

/**
 * Fetch all suppliers from Supabase
 */
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(supplierFromSupabase) as Supplier[]
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw error
  }
}

/**
 * Fetch a single supplier by ID
 */
export async function getSupplier(id: string): Promise<Supplier | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return supplierFromSupabase(data) as Supplier
  } catch (error) {
    console.error('Error fetching supplier:', error)
    throw error
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
  try {
    const supplierData = {
      ...supplierToSupabase(supplier),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single()

    if (error) throw error

    return supplierFromSupabase(data) as Supplier
  } catch (error) {
    console.error('Error creating supplier:', error)
    throw error
  }
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  try {
    const updateData = {
      ...supplierToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return supplierFromSupabase(data) as Supplier
  } catch (error) {
    console.error('Error updating supplier:', error)
    throw error
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting supplier:', error)
    throw error
  }
}

/**
 * Update supplier rating
 */
export async function updateSupplierRating(id: string, rating: number): Promise<Supplier> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ 
        rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return supplierFromSupabase(data) as Supplier
  } catch (error) {
    console.error('Error updating supplier rating:', error)
    throw error
  }
}

/**
 * Subscribe to real-time supplier changes
 */
export function subscribeToSuppliers(callback: (suppliers: Supplier[]) => void) {
  const channel = supabase
    .channel('suppliers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'suppliers'
      },
      async () => {
        // Fetch updated suppliers when changes occur
        const suppliers = await getSuppliers()
        callback(suppliers)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from supplier changes
 */
export function unsubscribeFromSuppliers(channel: any) {
  supabase.removeChannel(channel)
}
