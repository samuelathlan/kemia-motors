import { supabase } from '@/lib/supabase/client'
import type { OutingDay, Anecdote, VisitedPlace } from '@/lib/types'

export async function getOutingDays(outingId: string): Promise<OutingDay[]> {
  const { data, error } = await supabase
    .from('outing_days')
    .select('*')
    .eq('outing_id', outingId)
    .order('numero_jour', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createOutingDay(
  outingId: string,
  day: Omit<OutingDay, 'id' | 'created_at' | 'updated_at'>
): Promise<OutingDay> {
  const { data, error } = await supabase
    .from('outing_days')
    .insert([{ ...day, outing_id: outingId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOutingDay(
  dayId: string,
  updates: Partial<OutingDay>
): Promise<OutingDay> {
  const { data, error } = await supabase
    .from('outing_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOutingDay(dayId: string): Promise<void> {
  const { error } = await supabase
    .from('outing_days')
    .delete()
    .eq('id', dayId)

  if (error) throw error
}

// Anecdotes
export async function getAnecdotesForDay(dayId: string): Promise<Anecdote[]> {
  const { data, error } = await supabase
    .from('anecdotes')
    .select('*')
    .eq('outing_day_id', dayId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createAnecdote(
  anecdote: Omit<Anecdote, 'id' | 'created_at' | 'updated_at'>
): Promise<Anecdote> {
  const { data, error } = await supabase
    .from('anecdotes')
    .insert([anecdote])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPlacesForDay(dayId: string): Promise<VisitedPlace[]> {
  const { data, error } = await supabase
    .from('visited_places')
    .select('*')
    .eq('outing_day_id', dayId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllPlacesForOuting(outingId: string): Promise<VisitedPlace[]> {
  const { data, error } = await supabase
    .from('visited_places')
    .select('*')
    .eq('outing_id', outingId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}
