import { supabase } from '@/lib/supabase/client'
import type { Outing, OutingRSVP, VisitedPlace } from '@/lib/types'

export async function getOutings() {
  const { data, error } = await supabase
    .from('outings')
    .select('*')
    .order('date_debut', { ascending: false })

  if (error) throw error
  return (data || []) as Outing[]
}

export async function getOutingById(id: string) {
  const { data, error } = await supabase
    .from('outings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Outing
}

export async function getOutingDetails(id: string) {
  // Fetch outing with all related data
  const outing = await getOutingById(id)

  // Fetch visited places for this outing
  const { data: places, error: placesErr } = await supabase
    .from('visited_places')
    .select('*')
    .eq('outing_id', id)

  if (placesErr) throw placesErr

  // Fetch GPX tracks
  const { data: tracks, error: tracksErr } = await supabase
    .from('gpx_tracks')
    .select('*')
    .eq('outing_id', id)

  if (tracksErr) throw tracksErr

  // Fetch participants
  const { data: participants, error: participantsErr } = await supabase
    .from('outing_participants')
    .select('*, members(pseudo, nom_affiche)')
    .eq('outing_id', id)

  if (participantsErr) throw participantsErr

  // Fetch RSVPs
  const { data: rsvps, error: rsvpsErr } = await supabase
    .from('outing_rsvps')
    .select('*')
    .eq('outing_id', id)

  if (rsvpsErr) throw rsvpsErr

  return {
    outing,
    places: (places || []) as VisitedPlace[],
    tracks,
    participants,
    rsvps,
  }
}

export async function getRSVP(outingId: string, memberId: string) {
  const { data, error } = await supabase
    .from('outing_rsvps')
    .select('*')
    .eq('outing_id', outingId)
    .eq('member_id', memberId)
    .single()

  if (error?.code === 'PGRST116') {
    // Not found - create new
    return null
  }

  if (error) throw error
  return data as OutingRSVP
}

export async function upsertRSVP(
  outingId: string,
  memberId: string,
  status: 'oui' | 'non' | 'peut_etre'
) {
  const { data, error } = await supabase
    .from('outing_rsvps')
    .upsert(
      {
        outing_id: outingId,
        member_id: memberId,
        statut: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'outing_id,member_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as OutingRSVP
}
