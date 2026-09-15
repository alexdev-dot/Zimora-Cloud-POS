import { supabase } from '@/lib/supabase/client'
import { inventoryTransactionFromSupabase, inventoryTransactionToSupabase } from '@/lib/utils/supabase'
import { updateStock } from './products'
import type { InventoryTransaction } from '@/types'

/**
 * Fetch all inventory transactions from Supabase
 */
export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(inventoryTransactionFromSupabase) as InventoryTransaction[]
  } catch (error) {
    console.error('Error fetching inventory transactions:', error)
    throw error
  }
}

/**
 * Create a new inventory transaction
 */
export async function createInventoryTransaction(transaction: Omit<InventoryTransaction, 'id'>): Promise<InventoryTransaction> {
  try {
    const transactionData = {
      ...inventoryTransactionToSupabase(transaction),
      date: transaction.date || new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) throw error

    return inventoryTransactionFromSupabase(data) as InventoryTransaction
  } catch (error) {
    console.error('Error creating inventory transaction:', error)
    throw error
  }
}

/**
 * Apply stock change with transaction logging
 * This is the main function for stock operations (sales, purchases, adjustments, etc.)
 */
export async function applyStockChange(
  productId: string,
  qty: number,
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return',
  reference: string,
  createdBy: string,
  note?: string
): Promise<void> {
  try {
    // Get current product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError) throw productError

    const previousStock = product.stock
    const newStock = Math.max(0, previousStock + qty)

    // Update product stock
    await updateStock(productId, newStock)

    // Create inventory transaction
    await createInventoryTransaction({
      productId,
      productName: product.name,
      sku: product.sku,
      type,
      qty,
      previousStock,
      newStock,
      createdBy,
      reference,
      note,
      date: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error applying stock change:', error)
    throw error
  }
}

/**
 * Subscribe to real-time inventory transaction changes
 */
export function subscribeToInventoryTransactions(callback: (transactions: InventoryTransaction[]) => void) {
  const channel = supabase
    .channel('inventory-transactions-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory_transactions'
      },
      async () => {
        // Fetch updated transactions when changes occur
        const transactions = await getInventoryTransactions()
        callback(transactions)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from inventory transaction changes
 */
export function unsubscribeFromInventoryTransactions(channel: any) {
  supabase.removeChannel(channel)
}