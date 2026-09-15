/**
 * Utility functions for converting between camelCase (TypeScript) and snake_case (Supabase/PostgreSQL)
 */

// Convert camelCase to snake_case
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// Convert snake_case to camelCase
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Convert object keys from camelCase to snake_case
export function camelToSnakeKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[camelToSnake(key)] = obj[key]
    }
  }
  return result
}

// Convert object keys from snake_case to camelCase
export function snakeToCamelKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[snakeToCamel(key)] = obj[key]
    }
  }
  return result
}

// Convert array of objects from camelCase to snake_case
export function camelToSnakeArray<T extends Record<string, any>>(arr: T[]): Record<string, any>[] {
  return arr.map(camelToSnakeKeys)
}

// Convert array of objects from snake_case to camelCase
export function snakeToCamelArray<T extends Record<string, any>>(arr: T[]): Record<string, any>[] {
  return arr.map(snakeToCamelKeys)
}

// Convert Product from Supabase format to TypeScript format
export function productFromSupabase(data: any): any {
  if (!data) return null
  return snakeToCamelKeys(data)
}

// Convert Product from TypeScript format to Supabase format
export function productToSupabase(data: any): any {
  if (!data) return null
  return camelToSnakeKeys(data)
}

// Convert Sale from Supabase format to TypeScript format
export function saleFromSupabase(data: any): any {
  if (!data) return null
  const converted = snakeToCamelKeys(data)
  // Parse JSON fields if they exist
  if (converted.items && typeof converted.items === 'string') {
    try {
      converted.items = JSON.parse(converted.items)
    } catch (e) {
      console.error('Failed to parse items JSON:', e)
    }
  }
  return converted
}

// Convert Sale from TypeScript format to Supabase format
export function saleToSupabase(data: any): any {
  if (!data) return null
  const converted = camelToSnakeKeys(data)
  // Stringify JSON fields
  if (converted.items && typeof converted.items === 'object') {
    converted.items = JSON.stringify(converted.items)
  }
  return converted
}

// Convert InventoryTransaction from Supabase format to TypeScript format
export function inventoryTransactionFromSupabase(data: any): any {
  if (!data) return null
  return snakeToCamelKeys(data)
}

// Convert InventoryTransaction from TypeScript format to Supabase format
export function inventoryTransactionToSupabase(data: any): any {
  if (!data) return null
  return camelToSnakeKeys(data)
}

// Convert Customer from Supabase format to TypeScript format
export function customerFromSupabase(data: any): any {
  if (!data) return null
  return snakeToCamelKeys(data)
}

// Convert Customer from TypeScript format to Supabase format
export function customerToSupabase(data: any): any {
  if (!data) return null
  return camelToSnakeKeys(data)
}

// Convert Employee from Supabase format to TypeScript format
export function employeeFromSupabase(data: any): any {
  if (!data) return null
  const converted = snakeToCamelKeys(data)
  // Parse JSON fields if they exist
  if (converted.permissions && typeof converted.permissions === 'string') {
    try {
      converted.permissions = JSON.parse(converted.permissions)
    } catch (e) {
      console.error('Failed to parse permissions JSON:', e)
    }
  }
  return converted
}

// Convert Employee from TypeScript format to Supabase format
export function employeeToSupabase(data: any): any {
  if (!data) return null
  const converted = camelToSnakeKeys(data)
  // Stringify JSON fields
  if (converted.permissions && typeof converted.permissions === 'object') {
    converted.permissions = JSON.stringify(converted.permissions)
  }
  return converted
}

// Convert Supplier from Supabase format to TypeScript format
export function supplierFromSupabase(data: any): any {
  if (!data) return null
  return snakeToCamelKeys(data)
}

// Convert Supplier from TypeScript format to Supabase format
export function supplierToSupabase(data: any): any {
  if (!data) return null
  return camelToSnakeKeys(data)
}

// Convert Expense from Supabase format to TypeScript format
export function expenseFromSupabase(data: any): any {
  if (!data) return null
  return snakeToCamelKeys(data)
}

// Convert Expense from TypeScript format to Supabase format
export function expenseToSupabase(data: any): any {
  if (!data) return null
  return camelToSnakeKeys(data)
}

// Convert PurchaseOrder from Supabase format to TypeScript format
export function purchaseOrderFromSupabase(data: any): any {
  if (!data) return null
  const converted = snakeToCamelKeys(data)
  // Parse JSON fields if they exist
  if (converted.items && typeof converted.items === 'string') {
    try {
      converted.items = JSON.parse(converted.items)
    } catch (e) {
      console.error('Failed to parse items JSON:', e)
    }
  }
  return converted
}

// Convert PurchaseOrder from TypeScript format to Supabase format
export function purchaseOrderToSupabase(data: any): any {
  if (!data) return null
  const converted = camelToSnakeKeys(data)
  // Stringify JSON fields
  if (converted.items && typeof converted.items === 'object') {
    converted.items = JSON.stringify(converted.items)
  }
  return converted
}

// Convert Setting from Supabase format to TypeScript format
export function settingFromSupabase(data: any): any {
  if (!data) return null
  const converted = snakeToCamelKeys(data)
  // Parse JSON value if it's a string
  if (converted.value && typeof converted.value === 'string') {
    try {
      converted.value = JSON.parse(converted.value)
    } catch (e) {
      console.error('Failed to parse value JSON:', e)
    }
  }
  return converted
}

// Convert Setting from TypeScript format to Supabase format
export function settingToSupabase(data: any): any {
  if (!data) return null
  const converted = camelToSnakeKeys(data)
  // Stringify JSON value
  if (converted.value && typeof converted.value !== 'string') {
    converted.value = JSON.stringify(converted.value)
  }
  return converted
}