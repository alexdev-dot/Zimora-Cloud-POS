import { supabase } from '@/lib/supabase/client'
import { purchaseOrderFromSupabase, purchaseOrderToSupabase } from '@/lib/utils/supabase'
import type { PurchaseOrder } from '@/types'

/**
 * Fetch all purchase orders from Supabase
 */
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(purchaseOrderFromSupabase) as PurchaseOrder[]
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    throw error
  }
}

/**
 * Fetch a single purchase order by ID
 */
export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return purchaseOrderFromSupabase(data) as PurchaseOrder
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    throw error
  }
}

/**
 * Create a new purchase order
 */
export async function createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
  try {
    const purchaseOrderData = {
      ...purchaseOrderToSupabase(purchaseOrder),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(purchaseOrderData)
      .select()
      .single()

    if (error) throw error

    return purchaseOrderFromSupabase(data) as PurchaseOrder
  } catch (error) {
    console.error('Error creating purchase order:', error)
    throw error
  }
}

/**
 * Update an existing purchase order
 */
export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  try {
    const updateData = {
      ...purchaseOrderToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return purchaseOrderFromSupabase(data) as PurchaseOrder
  } catch (error) {
    console.error('Error updating purchase order:', error)
    throw error
  }
}

/**
 * Delete a purchase order
 */
export async function deletePurchaseOrder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    throw error
  }
}

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(id: string, status: 'pending' | 'ordered' | 'received' | 'cancelled'): Promise<PurchaseOrder> {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return purchaseOrderFromSupabase(data) as PurchaseOrder
  } catch (error) {
    console.error('Error updating purchase order status:', error)
    throw error
  }
}

/**
 * Subscribe to real-time purchase order changes
 */
export function subscribeToPurchaseOrders(callback: (purchaseOrders: PurchaseOrder[]) => void) {
  const channel = supabase
    .channel('purchase-orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'purchase_orders'
      },
      async () => {
        // Fetch updated purchase orders when changes occur
        const purchaseOrders = await getPurchaseOrders()
        callback(purchaseOrders)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from purchase order changes
 */
export function unsubscribeFromPurchaseOrders(channel: any) {
  supabase.removeChannel(channel)
}
