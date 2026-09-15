import { supabase } from '@/lib/supabase/client'
import { expenseFromSupabase, expenseToSupabase } from '@/lib/utils/supabase'
import type { Expense } from '@/types'

/**
 * Fetch all expenses from Supabase
 */
export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(expenseFromSupabase) as Expense[]
  } catch (error) {
    console.error('Error fetching expenses:', error)
    throw error
  }
}

/**
 * Fetch a single expense by ID
 */
export async function getExpense(id: string): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return expenseFromSupabase(data) as Expense
  } catch (error) {
    console.error('Error fetching expense:', error)
    throw error
  }
}

/**
 * Create a new expense
 */
export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  try {
    const expenseData = {
      ...expenseToSupabase(expense),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) throw error

    return expenseFromSupabase(data) as Expense
  } catch (error) {
    console.error('Error creating expense:', error)
    throw error
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  try {
    const updateData = {
      ...expenseToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return expenseFromSupabase(data) as Expense
  } catch (error) {
    console.error('Error updating expense:', error)
    throw error
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw error
  }
}

/**
 * Approve an expense
 */
export async function approveExpense(id: string, approvedBy: string): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ 
        status: 'approved',
        approved_by: approvedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return expenseFromSupabase(data) as Expense
  } catch (error) {
    console.error('Error approving expense:', error)
    throw error
  }
}

/**
 * Reject an expense
 */
export async function rejectExpense(id: string, approvedBy: string): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ 
        status: 'rejected',
        approved_by: approvedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return expenseFromSupabase(data) as Expense
  } catch (error) {
    console.error('Error rejecting expense:', error)
    throw error
  }
}

/**
 * Subscribe to real-time expense changes
 */
export function subscribeToExpenses(callback: (expenses: Expense[]) => void) {
  const channel = supabase
    .channel('expenses-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses'
      },
      async () => {
        // Fetch updated expenses when changes occur
        const expenses = await getExpenses()
        callback(expenses)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from expense changes
 */
export function unsubscribeFromExpenses(channel: any) {
  supabase.removeChannel(channel)
}
