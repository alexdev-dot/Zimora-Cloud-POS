import { supabase } from '@/lib/supabase/client'
import { saleFromSupabase, saleToSupabase } from '@/lib/utils/supabase'
import type { Sale } from '@/types'

/**
 * Fetch all sales from Supabase
 */
export async function getSales(): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(saleFromSupabase) as Sale[]
  } catch (error) {
    console.error('Error fetching sales:', error)
    throw error
  }
}

/**
 * Fetch a single sale by ID
 */
export async function getSale(id: string): Promise<Sale | null> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return saleFromSupabase(data) as Sale
  } catch (error) {
    console.error('Error fetching sale:', error)
    throw error
  }
}

/**
 * Create a new sale
 */
export async function createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> {
  try {
    const saleData = {
      ...saleToSupabase(sale),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single()

    if (error) throw error

    return saleFromSupabase(data) as Sale
  } catch (error) {
    console.error('Error creating sale:', error)
    throw error
  }
}

/**
 * Update an existing sale
 */
export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
  try {
    const updateData = {
      ...saleToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return saleFromSupabase(data) as Sale
  } catch (error) {
    console.error('Error updating sale:', error)
    throw error
  }
}

/**
 * Delete a sale
 */
export async function deleteSale(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting sale:', error)
    throw error
  }
}

/**
 * Subscribe to real-time sales changes
 */
export function subscribeToSales(callback: (sales: Sale[]) => void) {
  const channel = supabase
    .channel('sales-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sales'
      },
      async () => {
        // Fetch updated sales when changes occur
        const sales = await getSales()
        callback(sales)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from sales changes
 */
export function unsubscribeFromSales(channel: any) {
  supabase.removeChannel(channel)
}