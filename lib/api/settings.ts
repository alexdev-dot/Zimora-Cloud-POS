import { supabase } from '@/lib/supabase/client'
import { settingFromSupabase, settingToSupabase } from '@/lib/utils/supabase'
import type { Setting } from '@/types'

/**
 * Fetch all settings from Supabase
 */
export async function getSettings(): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw error

    return (data || []).map(settingFromSupabase) as Setting[]
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw error
  }
}

/**
 * Fetch a single setting by key
 */
export async function getSetting(key: string): Promise<Setting | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) throw error

    return settingFromSupabase(data) as Setting
  } catch (error) {
    console.error('Error fetching setting:', error)
    throw error
  }
}

/**
 * Fetch settings by category
 */
export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true })

    if (error) throw error

    return (data || []).map(settingFromSupabase) as Setting[]
  } catch (error) {
    console.error('Error fetching settings by category:', error)
    throw error
  }
}

/**
 * Create a new setting
 */
export async function createSetting(setting: Omit<Setting, 'id' | 'updatedAt'>): Promise<Setting> {
  try {
    const settingData = {
      ...settingToSupabase(setting),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('settings')
      .insert(settingData)
      .select()
      .single()

    if (error) throw error

    return settingFromSupabase(data) as Setting
  } catch (error) {
    console.error('Error creating setting:', error)
    throw error
  }
}

/**
 * Update an existing setting
 */
export async function updateSetting(key: string, value: any): Promise<Setting> {
  try {
    const updateData = {
      value: typeof value === 'string' ? value : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('key', key)
      .select()
      .single()

    if (error) throw error

    return settingFromSupabase(data) as Setting
  } catch (error) {
    console.error('Error updating setting:', error)
    throw error
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting setting:', error)
    throw error
  }
}

/**
 * Get setting value as a specific type
 */
export async function getSettingValue<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const setting = await getSetting(key)
    if (!setting) return defaultValue
    return setting.value as T
  } catch (error) {
    console.error('Error getting setting value:', error)
    return defaultValue
  }
}

/**
 * Update or create a setting (upsert)
 */
export async function upsertSetting(key: string, value: any, category: string = 'general', description?: string): Promise<Setting> {
  try {
    // Try to update first
    try {
      return await updateSetting(key, value)
    } catch (updateError) {
      // If update fails, create new setting
      return await createSetting({
        key,
        value,
        category,
        description,
      })
    }
  } catch (error) {
    console.error('Error upserting setting:', error)
    throw error
  }
}

/**
 * Subscribe to real-time setting changes
 */
export function subscribeToSettings(callback: (settings: Setting[]) => void) {
  const channel = supabase
    .channel('settings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'settings'
      },
      async () => {
        // Fetch updated settings when changes occur
        const settings = await getSettings()
        callback(settings)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from setting changes
 */
export function unsubscribeFromSettings(channel: any) {
  supabase.removeChannel(channel)
}
