import { supabase } from '@/lib/supabase/client'
import type { Motorcycle, MotorcyclePhoto } from '@/lib/types'

export async function getMotorcycles() {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('*, motorcycle_photos(*)')
    .order('annee', { ascending: false })

  if (error) throw error
  return (data || []) as (Motorcycle & { motorcycle_photos: MotorcyclePhoto[] })[]
}

export async function getMotorcyclesByMember(memberId: string) {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('*, motorcycle_photos(*)')
    .eq('member_id', memberId)
    .order('annee', { ascending: false })

  if (error) throw error
  return (data || []) as (Motorcycle & { motorcycle_photos: MotorcyclePhoto[] })[]
}

export async function getMotorcycleById(id: string) {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('*, motorcycle_photos(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Motorcycle & { motorcycle_photos: MotorcyclePhoto[] }
}

export async function createMotorcycle(
  memberId: string,
  motorcycle: Omit<Motorcycle, 'id'>
) {
  const { data, error } = await supabase
    .from('motorcycles')
    .insert({ ...motorcycle, member_id: memberId })
    .select()
    .single()

  if (error) throw error
  return data as Motorcycle
}

export async function updateMotorcycle(id: string, updates: Partial<Motorcycle>) {
  const { data, error } = await supabase
    .from('motorcycles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Motorcycle
}

export async function uploadMotorcyclePhoto(
  motorcycleId: string,
  file: File
): Promise<string> {
  const fileName = `${motorcycleId}/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('motorcycle-photos')
    .upload(fileName, file)

  if (error) throw error

  // Save reference in database
  const { error: dbError } = await supabase
    .from('motorcycle_photos')
    .insert({
      motorcycle_id: motorcycleId,
      storage_path: data.path,
    })

  if (dbError) throw dbError

  return data.path
}

export async function deleteMotorcyclePhoto(
  motorcycleId: string,
  photoId: string,
  storagePath: string
) {
  // Delete from storage
  await supabase.storage
    .from('motorcycle-photos')
    .remove([storagePath])

  // Delete from database
  const { error } = await supabase
    .from('motorcycle_photos')
    .delete()
    .eq('id', photoId)

  if (error) throw error
}

export async function deleteMotorcycle(id: string) {
  const { error } = await supabase.from('motorcycles').delete().eq('id', id)
  if (error) throw error
}

export function getPhotoURL(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('SUPABASE_URL not set')

  return `${supabaseUrl}/storage/v1/object/public/motorcycle-photos/${storagePath}`
}
