'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import { parseGPX } from '@/lib/gpx/parse'
import type { Outing, OutingDay, GPXTrack, MediaLink } from '@/lib/types'
import Link from 'next/link'

type DayBlock = {
  day: OutingDay | null // null = outing-level (single-day / no specific day)
  tracks: GPXTrack[]
  media: MediaLink[]
}

export default function AdminItineraryPage() {
  const { id } = useParams() as { id: string }
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [outing, setOuting] = useState<Outing | null>(null)
  const [blocks, setBlocks] = useState<DayBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [igInput, setIgInput] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    // Outing
    const { data: outingData, error: oErr } = await supabase
      .from('outings')
      .select('*')
      .eq('id', id)
      .single()
    if (oErr) throw oErr
    setOuting(outingData)

    // Days
    const { data: days } = await supabase
      .from('outing_days')
      .select('*')
      .eq('outing_id', id)
      .order('numero_jour', { ascending: true })

    // Tracks + media for this outing
    const { data: tracks } = await supabase.from('gpx_tracks').select('*').eq('outing_id', id)
    const { data: media } = await supabase
      .from('media_links')
      .select('*')
      .eq('outing_id', id)
      .eq('plateforme', 'instagram')

    const dayList = days || []
    const newBlocks: DayBlock[] = []

    // One block per day
    for (const d of dayList) {
      newBlocks.push({
        day: d,
        tracks: (tracks || []).filter((t) => t.outing_day_id === d.id),
        media: (media || []).filter((m) => m.outing_day_id === d.id),
      })
    }

    // Outing-level block (items not tied to a specific day)
    newBlocks.push({
      day: null,
      tracks: (tracks || []).filter((t) => !t.outing_day_id),
      media: (media || []).filter((m) => !m.outing_day_id),
    })

    setBlocks(newBlocks)
  }, [id])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    const run = async () => {
      try {
        const { data: m } = await supabase.from('members').select('role').eq('id', user.id).single()
        if (!m || (m.role !== 'admin' && m.role !== 'super_admin')) {
          router.push('/dashboard')
          return
        }
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user, authLoading, router, load])

  const generateDays = async () => {
    if (!outing) return
    setBusy('gen')
    setError('')
    try {
      const start = new Date(outing.date_debut)
      const end = outing.date_fin ? new Date(outing.date_fin) : start
      const rows = []
      let n = 1
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        rows.push({
          outing_id: id,
          date: new Date(d).toISOString(),
          numero_jour: n,
          titre_du_jour: `Jour ${n}`,
        })
        n++
      }
      const { error: insErr } = await supabase.from('outing_days').insert(rows)
      if (insErr) throw insErr
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur génération jours')
    } finally {
      setBusy(null)
    }
  }

  const uploadGPX = async (file: File, day: OutingDay | null) => {
    if (!user) return
    const key = day?.id || 'outing'
    setBusy(`gpx-${key}`)
    setError('')
    try {
      const text = await file.text()
      const stats = parseGPX(text)

      // Upload file to storage
      const path = `${id}/${day?.id || 'general'}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('gpx').upload(path, file, {
        contentType: 'application/gpx+xml',
        upsert: false,
      })
      if (upErr) throw upErr

      const { error: insErr } = await supabase.from('gpx_tracks').insert({
        outing_id: id,
        outing_day_id: day?.id || null,
        member_id: user.id,
        fichier_gpx_url: path,
        distance_km: stats.distanceKm,
        duree: stats.duree,
        duree_minutes: stats.dureeMinutes,
      })
      if (insErr) throw insErr
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload GPX')
    } finally {
      setBusy(null)
    }
  }

  const addInstagram = async (day: OutingDay | null) => {
    if (!user) return
    const key = day?.id || 'outing'
    const url = (igInput[key] || '').trim()
    if (!url) return
    if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
      setError('Le lien doit être une URL instagram.com')
      return
    }
    setBusy(`ig-${key}`)
    setError('')
    try {
      const { error: insErr } = await supabase.from('media_links').insert({
        outing_id: id,
        outing_day_id: day?.id || null,
        member_id: user.id,
        url,
        plateforme: 'instagram',
      })
      if (insErr) throw insErr
      setIgInput((p) => ({ ...p, [key]: '' }))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur ajout lien')
    } finally {
      setBusy(null)
    }
  }

  const deleteTrack = async (track: GPXTrack) => {
    setBusy(`del-t-${track.id}`)
    try {
      if (track.fichier_gpx_url) {
        await supabase.storage.from('gpx').remove([track.fichier_gpx_url])
      }
      await supabase.from('gpx_tracks').delete().eq('id', track.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    } finally {
      setBusy(null)
    }
  }

  const deleteMedia = async (m: MediaLink) => {
    setBusy(`del-m-${m.id}`)
    try {
      await supabase.from('media_links').delete().eq('id', m.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!outing) return <div className="min-h-screen flex items-center justify-center">Sortie introuvable</div>

  const hasDays = blocks.some((b) => b.day)

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/outings" className="text-orange-400 hover:underline text-sm">
            ← Retour aux sorties
          </Link>
          <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
            Itinéraire — {outing.titre}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ajoute les traces GPX et liens Instagram, jour par jour.</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!hasDays && outing.type === 'roadtrip_multi_jours' && (
          <button
            onClick={generateDays}
            disabled={busy === 'gen'}
            className="w-full mb-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: '#2F4A38' }}
          >
            {busy === 'gen' ? 'Génération...' : '📅 Générer les jours à partir des dates'}
          </button>
        )}

        <div className="space-y-4">
          {blocks.map((block) => {
            const key = block.day?.id || 'outing'
            const label = block.day
              ? `Jour ${block.day.numero_jour}${block.day.titre_du_jour ? ` — ${block.day.titre_du_jour}` : ''}`
              : 'Général (toute la sortie)'
            const dateStr = block.day?.date
              ? new Date(block.day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              : null

            // Hide the empty "Général" block when days exist and it has nothing
            if (!block.day && hasDays && block.tracks.length === 0 && block.media.length === 0) return null

            return (
              <div key={key} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-bold" style={{ color: '#E8D5B0' }}>{label}</h3>
                  {dateStr && <span className="text-xs text-slate-500">{dateStr}</span>}
                </div>

                {/* GPX tracks */}
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Traces GPX</p>
                  {block.tracks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-300">
                        🛰️ {t.distance_km} km{t.duree && t.duree !== '00:00' ? ` · ${t.duree}` : ''}
                      </span>
                      <button
                        onClick={() => deleteTrack(t)}
                        disabled={busy === `del-t-${t.id}`}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                  <label className="mt-2 inline-block cursor-pointer text-sm text-orange-400 hover:underline">
                    {busy === `gpx-${key}` ? 'Import...' : '+ Ajouter un GPX'}
                    <input
                      type="file"
                      accept=".gpx"
                      className="hidden"
                      disabled={busy === `gpx-${key}`}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) uploadGPX(f, block.day)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                {/* Instagram links */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Liens Instagram</p>
                  {block.media.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm py-1">
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-orange-400 truncate max-w-[70%]">
                        📷 {m.url}
                      </a>
                      <button
                        onClick={() => deleteMedia(m)}
                        disabled={busy === `del-m-${m.id}`}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={igInput[key] || ''}
                      onChange={(e) => setIgInput((p) => ({ ...p, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-600"
                    />
                    <button
                      onClick={() => addInstagram(block.day)}
                      disabled={busy === `ig-${key}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: '#D9622B' }}
                    >
                      {busy === `ig-${key}` ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
