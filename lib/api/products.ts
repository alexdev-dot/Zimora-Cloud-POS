import { supabase } from '@/lib/supabase/client'
import { productFromSupabase, productToSupabase } from '@/lib/utils/supabase'
import type { Product } from '@/types'

/**
 * Fetch all products from Supabase
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(productFromSupabase) as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return productFromSupabase(data) as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const productData = {
      ...productToSupabase(product),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error

    return productFromSupabase(data) as Product
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const updateData = {
      ...productToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return productFromSupabase(data) as Product
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Update product stock
 */
export async function updateStock(productId: string, newStock: number): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error

    return productFromSupabase(data) as Product
  } catch (error) {
    console.error('Error updating stock:', error)
    throw error
  }
}

/**
 * Subscribe to real-time product changes
 */
export function subscribeToProducts(callback: (products: Product[]) => void) {
  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      async () => {
        // Fetch updated products when changes occur
        const products = await getProducts()
        callback(products)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from product changes
 */
export function unsubscribeFromProducts(channel: any) {
  supabase.removeChannel(channel)
}