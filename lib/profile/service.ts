import { supabase } from '@/lib/supabase/client'
import type { EmergencyInfo } from '@/lib/types'

export async function getEmergencyInfo(memberId: string) {
  const { data, error } = await supabase
    .from('member_emergency_info')
    .select('*')
    .eq('member_id', memberId)
    .single()

  if (error?.code === 'PGRST116') {
    // Not found
    return null
  }

  if (error) throw error
  return data as EmergencyInfo
}

export async function upsertEmergencyInfo(
  memberId: string,
  info: Partial<Omit<EmergencyInfo, 'id' | 'member_id'>>
) {
  const { data, error } = await supabase
    .from('member_emergency_info')
    .upsert(
      {
        member_id: memberId,
        ...info,
      },
      { onConflict: 'member_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as EmergencyInfo
}
