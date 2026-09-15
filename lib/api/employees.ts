import { supabase } from '@/lib/supabase/client'
import { employeeFromSupabase, employeeToSupabase } from '@/lib/utils/supabase'
import type { Employee } from '@/types'

/**
 * Fetch all employees from Supabase
 */
export async function getEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(employeeFromSupabase) as Employee[]
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw error
  }
}

/**
 * Fetch a single employee by ID
 */
export async function getEmployee(id: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return employeeFromSupabase(data) as Employee
  } catch (error) {
    console.error('Error fetching employee:', error)
    throw error
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  try {
    const employeeData = {
      ...employeeToSupabase(employee),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) throw error

    return employeeFromSupabase(data) as Employee
  } catch (error) {
    console.error('Error creating employee:', error)
    throw error
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  try {
    const updateData = {
      ...employeeToSupabase(updates),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return employeeFromSupabase(data) as Employee
  } catch (error) {
    console.error('Error updating employee:', error)
    throw error
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting employee:', error)
    throw error
  }
}

/**
 * Update employee status
 */
export async function updateEmployeeStatus(id: string, status: 'active' | 'inactive' | 'on_leave' | 'terminated'): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return employeeFromSupabase(data) as Employee
  } catch (error) {
    console.error('Error updating employee status:', error)
    throw error
  }
}

/**
 * Subscribe to real-time employee changes
 */
export function subscribeToEmployees(callback: (employees: Employee[]) => void) {
  const channel = supabase
    .channel('employees-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employees'
      },
      async () => {
        // Fetch updated employees when changes occur
        const employees = await getEmployees()
        callback(employees)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from employee changes
 */
export function unsubscribeFromEmployees(channel: any) {
  supabase.removeChannel(channel)
}
