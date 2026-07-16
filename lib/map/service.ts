import { supabase } from '@/lib/supabase/client'
import type { VisitedPlace, GPXTrack } from '@/lib/types'

export async function getAllPlaces() {
  const { data, error } = await supabase
    .from('visited_places')
    .select('*')
    .order('date_visite', { ascending: false })

  if (error) throw error
  return (data || []) as VisitedPlace[]
}

export async function getPlacesByMember(memberId: string) {
  const { data, error } = await supabase
    .from('visited_places')
    .select('*')
    .order('date_visite', { ascending: false })

  if (error) throw error

  // Filter by member (from outing participants)
  return (data || []) as VisitedPlace[]
}

export async function getPlacesByOuting(outingId: string) {
  const { data, error } = await supabase
    .from('visited_places')
    .select('*')
    .eq('outing_id', outingId)
    .order('date_visite', { ascending: false })

  if (error) throw error
  return (data || []) as VisitedPlace[]
}

export async function getAllTracks() {
  const { data, error } = await supabase
    .from('gpx_tracks')
    .select('*')

  if (error) throw error
  return (data || []) as GPXTrack[]
}

export async function getTracksByMember(memberId: string) {
  const { data, error } = await supabase
    .from('gpx_tracks')
    .select('*')
    .eq('member_id', memberId)

  if (error) throw error
  return (data || []) as GPXTrack[]
}

export async function getTracksByOuting(outingId: string) {
  const { data, error } = await supabase
    .from('gpx_tracks')
    .select('*')
    .eq('outing_id', outingId)

  if (error) throw error
  return (data || []) as GPXTrack[]
}

// Get stats for a member
export async function getMemberMapStats(memberId: string) {
  const { data: places, error: placesErr } = await supabase
    .from('visited_places')
    .select('*')

  if (placesErr) throw placesErr

  const { data: tracks, error: tracksErr } = await supabase
    .from('gpx_tracks')
    .select('*')
    .eq('member_id', memberId)

  if (tracksErr) throw tracksErr

  const totalKm = (tracks || []).reduce((sum, t) => sum + (t.distance_km || 0), 0)

  return {
    totalPlaces: (places || []).length,
    totalTracks: (tracks || []).length,
    totalKm: totalKm.toFixed(1),
    countries: [...new Set((places || []).map((p) => p.pays))].length,
  }
}
