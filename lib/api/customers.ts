import { supabase } from '@/lib/supabase/client'
import { customerFromSupabase, customerToSupabase } from '@/lib/utils/supabase'
import type { Customer } from '@/types'

/**
 * Fetch all customers from Supabase
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(customerFromSupabase) as Customer[]
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

/**
 * Fetch a single customer by ID
 */
export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return customerFromSupabase(data) as Customer
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw error
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  try {
    const customerData = {
      ...customerToSupabase(customer),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) throw error

    return customerFromSupabase(data) as Customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  try {
    const updateData = {
      ...customerToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return customerFromSupabase(data) as Customer
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}

/**
 * Update customer loyalty points
 */
export async function updateLoyaltyPoints(customerId: string, points: number): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        loyalty_points: points,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error

    return customerFromSupabase(data) as Customer
  } catch (error) {
    console.error('Error updating loyalty points:', error)
    throw error
  }
}

/**
 * Subscribe to real-time customer changes
 */
export function subscribeToCustomers(callback: (customers: Customer[]) => void) {
  const channel = supabase
    .channel('customers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'customers'
      },
      async () => {
        // Fetch updated customers when changes occur
        const customers = await getCustomers()
        callback(customers)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from customer changes
 */
export function unsubscribeFromCustomers(channel: any) {
  supabase.removeChannel(channel)
}
