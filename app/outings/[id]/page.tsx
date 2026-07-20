'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { getRSVP, upsertRSVP } from '@/lib/outings/service'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Outing, VisitedPlace, OutingRSVP, OutingDay, GPXTrack, MediaLink, Anecdote, Member } from '@/lib/types'

type DayView = {
  day: OutingDay | null
  tracks: GPXTrack[]
  media: MediaLink[]
  anecdotes: Anecdote[]
  places: VisitedPlace[]
}

function fmtDur(min: number): string {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`
}

export default function OutingDetailPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const [outing, setOuting] = useState<Outing | null>(null)
  const [blocks, setBlocks] = useState<DayView[]>([])
  const [participants, setParticipants] = useState<Member[]>([])
  const [rsvp, setRsvp] = useState<OutingRSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data: outingData, error: oErr } = await supabase.from('outings').select('*').eq('id', id).single()
    if (oErr) throw oErr
    setOuting(outingData)

    const [{ data: days }, { data: tracks }, { data: media }, { data: places }, { data: parts }] = await Promise.all([
      supabase.from('outing_days').select('*').eq('outing_id', id).order('numero_jour', { ascending: true }),
      supabase.from('gpx_tracks').select('*').eq('outing_id', id),
      supabase.from('media_links').select('*').eq('outing_id', id).eq('plateforme', 'instagram'),
      supabase.from('visited_places').select('*').eq('outing_id', id),
      supabase.from('outing_participants').select('member_id, members(*)').eq('outing_id', id),
    ])

    const dayList = (days || []) as OutingDay[]
    const dayIds = dayList.map((d) => d.id)
    const { data: anec } = await supabase
      .from('anecdotes')
      .select('*')
      .or(`outing_id.eq.${id}${dayIds.length ? `,outing_day_id.in.(${dayIds.join(',')})` : ''}`)
    const anecList = (anec || []) as Anecdote[]
    const allTracks = (tracks || []) as GPXTrack[]
    const allMedia = (media || []) as MediaLink[]
    const allPlaces = (places || []) as VisitedPlace[]

    const newBlocks: DayView[] = dayList.map((d) => ({
      day: d,
      tracks: allTracks.filter((t) => t.outing_day_id === d.id),
      media: allMedia.filter((m) => m.outing_day_id === d.id),
      anecdotes: anecList.filter((a) => a.outing_day_id === d.id),
      places: allPlaces.filter((p) => p.outing_day_id === d.id),
    }))
    newBlocks.push({
      day: null,
      tracks: allTracks.filter((t) => !t.outing_day_id),
      media: allMedia.filter((m) => !m.outing_day_id),
      anecdotes: anecList.filter((a) => a.outing_id === id && !a.outing_day_id),
      places: allPlaces.filter((p) => !p.outing_day_id),
    })
    setBlocks(newBlocks)

    const partRows = (parts || []) as unknown as { members: Member | Member[] | null }[]
    setParticipants(
      partRows.map((p) => (Array.isArray(p.members) ? p.members[0] : p.members)).filter((m): m is Member => !!m)
    )

    if (user) {
      const userRsvp = await getRSVP(id, user.id)
      setRsvp(userRsvp)
    }
  }, [id, user])

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [load])

  const handleRSVP = async (status: 'oui' | 'non' | 'peut_etre') => {
    if (!user) return
    try {
      const newRsvp = await upsertRSVP(id, user.id, status)
      setRsvp(newRsvp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du RSVP')
    }
  }

  if (loading) return <div className="min-h-screen p-4 bg-slate-950">Chargement...</div>
  if (!outing) return <div className="min-h-screen p-4 bg-slate-950">Sortie non trouvée</div>

  const allTracks = blocks.flatMap((b) => b.tracks)
  const totalKm = Math.round(allTracks.reduce((s, t) => s + (t.distance_km || 0), 0))
  const totalMin = allTracks.reduce((s, t) => s + (t.duree_minutes || 0), 0)
  const totalIg = blocks.reduce((s, b) => s + b.media.length, 0)
  const totalAnec = blocks.reduce((s, b) => s + b.anecdotes.length, 0)
  const totalPlaces = blocks.reduce((s, b) => s + b.places.length, 0)
  const nbDays = blocks.filter((b) => b.day).length

  const stats = [
    { label: 'Jours', value: nbDays || '—' },
    { label: 'Distance', value: totalKm ? `${totalKm} km` : '—' },
    { label: 'Temps', value: fmtDur(totalMin) || '—' },
    { label: 'Participants', value: participants.length },
    { label: 'Lieux', value: totalPlaces },
    { label: 'Posts Insta', value: totalIg },
    { label: 'Anecdotes', value: totalAnec },
  ]

  const nonEmptyBlocks = blocks.filter(
    (b) => b.day || b.tracks.length || b.media.length || b.anecdotes.length || b.places.length
  )

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>{outing.titre}</h1>
        {outing.description && <p className="text-slate-400 mb-6">{outing.description}</p>}

        {error && <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6 text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 text-center">
              <p className="text-lg font-bold" style={{ color: '#D9622B' }}>{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Participants</p>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <span key={p.id} className="px-3 py-1 rounded-full bg-slate-800 text-sm text-slate-200">{p.nom_affiche}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="mb-6 p-4 rounded-lg bg-slate-900 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Dates</p>
          <p className="font-semibold">
            {new Date(outing.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {outing.date_fin && outing.date_fin !== outing.date_debut && (
              <> {' → '}{new Date(outing.date_fin).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</>
            )}
          </p>
        </div>

        {/* RSVP */}
        <div className="mb-8 p-4 rounded-lg bg-slate-900 border border-slate-700">
          <p className="text-sm text-slate-400 mb-3">Ta présence :</p>
          <div className="grid grid-cols-3 gap-2">
            {(['oui', 'non', 'peut_etre'] as const).map((status) => (
              <button key={status} onClick={() => handleRSVP(status)}
                className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${rsvp?.statut === status ? 'bg-orange-600 text-white' : 'bg-slate-800 border border-slate-700 hover:border-orange-600'}`}>
                {status === 'oui' ? '✅ Oui' : status === 'non' ? '❌ Non' : '❓ Peut-être'}
              </button>
            ))}
          </div>
        </div>

        {/* Day by day */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#D9622B' }}>Le voyage</h2>
          <Link
            href={`/outings/${id}/itinerary`}
            className="text-sm font-semibold px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#D9622B' }}
          >
            🛰️ Ajouter GPX, notes, anecdotes
          </Link>
        </div>
        <div className="space-y-4">
          {nonEmptyBlocks.length === 0 && <p className="text-slate-500 text-sm">Le détail du voyage sera bientôt disponible.</p>}
          {nonEmptyBlocks.map((b) => {
            const key = b.day?.id || 'global'
            const label = b.day
              ? `Jour ${b.day.numero_jour}${b.day.titre_du_jour ? ` — ${b.day.titre_du_jour}` : ''}`
              : '🌍 Sur toute la sortie'
            const dateStr = b.day?.date ? new Date(b.day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : null
            const dayKm = Math.round(b.tracks.reduce((s, t) => s + (t.distance_km || 0), 0))
            const dayMin = b.tracks.reduce((s, t) => s + (t.duree_minutes || 0), 0)

            return (
              <div key={key} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-bold" style={{ color: '#E8D5B0' }}>{label}</h3>
                  {dateStr && <span className="text-xs text-slate-500">{dateStr}</span>}
                </div>

                {b.tracks.length > 0 && (
                  <p className="text-sm text-slate-300 mb-2">🛰️ {dayKm} km{dayMin ? ` · ${fmtDur(dayMin)}` : ''}</p>
                )}

                {b.day?.notes_du_jour && <p className="text-sm text-slate-400 mb-2">{b.day.notes_du_jour}</p>}

                {b.places.length > 0 && (
                  <div className="mb-2">
                    {b.places.map((p) => (
                      <p key={p.id} className="text-sm text-slate-300">📍 {p.nom}{p.region ? ` — ${p.region}` : ''}</p>
                    ))}
                  </div>
                )}

                {b.anecdotes.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {b.anecdotes.map((a) => (
                      <p key={a.id} className="text-sm text-slate-300">💬 {a.texte}</p>
                    ))}
                  </div>
                )}

                {b.media.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {b.media.map((m) => (
                      <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-orange-400 hover:bg-slate-700">📷 Voir sur Instagram</a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Link href="/overview" className="block mt-8 text-center text-orange-400 hover:underline text-sm">
          👁️ Voir la vue d&apos;ensemble du club
        </Link>
      </div>
    </div>
  )
}
