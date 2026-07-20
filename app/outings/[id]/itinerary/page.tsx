'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import { parseGPX } from '@/lib/gpx/parse'
import type { Outing, OutingDay, GPXTrack, MediaLink, Anecdote, Member } from '@/lib/types'
import Link from 'next/link'

type DayBlock = {
  day: OutingDay | null // null = trip-level (whole outing)
  tracks: GPXTrack[]
  media: MediaLink[]
  anecdotes: Anecdote[]
}

function fmtDur(min: number): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`
}

export default function OutingItineraryPage() {
  const { id } = useParams() as { id: string }
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [outing, setOuting] = useState<Outing | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [blocks, setBlocks] = useState<DayBlock[]>([])
  const [participants, setParticipants] = useState<Member[]>([])
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [placesCount, setPlacesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [igInput, setIgInput] = useState<Record<string, string>>({})
  const [anecInput, setAnecInput] = useState<Record<string, string>>({})
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})
  const [addMemberId, setAddMemberId] = useState('')
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null)
  const [exportingPDF, setExportingPDF] = useState(false)

  const isAdmin = member?.role === 'admin' || member?.role === 'super_admin'

  const load = useCallback(async () => {
    const { data: outingData, error: oErr } = await supabase.from('outings').select('*').eq('id', id).single()
    if (oErr) throw oErr
    setOuting(outingData)

    const [{ data: days }, { data: tracks }, { data: media }, { data: parts }, { data: members }, { data: places }] =
      await Promise.all([
        supabase.from('outing_days').select('*').eq('outing_id', id).order('numero_jour', { ascending: true }),
        supabase.from('gpx_tracks').select('*').eq('outing_id', id),
        supabase.from('media_links').select('*').eq('outing_id', id).eq('plateforme', 'instagram'),
        supabase.from('outing_participants').select('member_id, members(*)').eq('outing_id', id),
        supabase.from('members').select('*').order('nom_affiche', { ascending: true }),
        supabase.from('visited_places').select('*').eq('outing_id', id),
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

    const newBlocks: DayBlock[] = dayList.map((d) => ({
      day: d,
      tracks: allTracks.filter((t) => t.outing_day_id === d.id),
      media: allMedia.filter((m) => m.outing_day_id === d.id),
      anecdotes: anecList.filter((a) => a.outing_day_id === d.id),
    }))
    newBlocks.push({
      day: null,
      tracks: allTracks.filter((t) => !t.outing_day_id),
      media: allMedia.filter((m) => !m.outing_day_id),
      anecdotes: anecList.filter((a) => a.outing_id === id && !a.outing_day_id),
    })
    setBlocks(newBlocks)

    const partRows = (parts || []) as unknown as { members: Member | Member[] | null }[]
    setParticipants(
      partRows.map((p) => (Array.isArray(p.members) ? p.members[0] : p.members)).filter((m): m is Member => !!m)
    )
    setAllMembers((members || []) as Member[])
    setPlacesCount(((places || []) as unknown[]).length)
  }, [id])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    const run = async () => {
      try {
        const { data: m } = await supabase.from('members').select('*').eq('id', user.id).single()
        setMember(m)
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
        rows.push({ outing_id: id, date: new Date(d).toISOString(), numero_jour: n, titre_du_jour: `Jour ${n}` })
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
      const path = `${id}/${day?.id || 'general'}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('gpx').upload(path, file, {
        contentType: 'application/gpx+xml',
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

  const addAnecdote = async (day: OutingDay | null) => {
    if (!user) return
    const key = day?.id || 'outing'
    const texte = (anecInput[key] || '').trim()
    if (!texte) return
    setBusy(`anec-${key}`)
    setError('')
    try {
      const { error: insErr } = await supabase.from('anecdotes').insert({
        outing_id: id,
        outing_day_id: day?.id || null,
        member_id: user.id,
        texte,
      })
      if (insErr) throw insErr
      setAnecInput((p) => ({ ...p, [key]: '' }))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur ajout anecdote')
    } finally {
      setBusy(null)
    }
  }

  const addNote = async (day: OutingDay) => {
    const text = (noteInput[day.id] || '').trim()
    if (!text) return
    setBusy(`note-${day.id}`)
    setError('')
    try {
      const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      const current = day.notes_du_jour || ''
      const newNotes = current ? `${current}\n\n[${timestamp}] ${text}` : `[${timestamp}] ${text}`
      const { error: updErr } = await supabase.from('outing_days').update({ notes_du_jour: newNotes }).eq('id', day.id)
      if (updErr) throw updErr
      setNoteInput((p) => ({ ...p, [day.id]: '' }))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur ajout note')
    } finally {
      setBusy(null)
    }
  }

  const addParticipant = async () => {
    if (!addMemberId) return
    setBusy('add-part')
    setError('')
    try {
      const { error: insErr } = await supabase.from('outing_participants').insert({ outing_id: id, member_id: addMemberId })
      if (insErr) throw insErr
      setAddMemberId('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur ajout participant')
    } finally {
      setBusy(null)
    }
  }

  const removeParticipant = async (memberId: string) => {
    setBusy(`rm-part-${memberId}`)
    try {
      await supabase.from('outing_participants').delete().eq('outing_id', id).eq('member_id', memberId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    } finally {
      setBusy(null)
    }
  }

  const canDelete = (ownerId: string) => isAdmin || ownerId === user?.id

  const deleteTrack = async (t: GPXTrack) => {
    setBusy(`del-t-${t.id}`)
    try {
      if (t.fichier_gpx_url) await supabase.storage.from('gpx').remove([t.fichier_gpx_url])
      await supabase.from('gpx_tracks').delete().eq('id', t.id)
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
    } finally {
      setBusy(null)
    }
  }
  const deleteAnecdote = async (a: Anecdote) => {
    setBusy(`del-a-${a.id}`)
    try {
      await supabase.from('anecdotes').delete().eq('id', a.id)
      await load()
    } finally {
      setBusy(null)
    }
  }

  const handleGenerateSummary = async (dayId: string) => {
    setGeneratingSummary(dayId)
    setError('')
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur de génération')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGeneratingSummary(null)
    }
  }

  const handleExportPDF = async () => {
    setExportingPDF(true)
    setError('')
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outingId: id }),
      })
      if (!res.ok) throw new Error('Erreur export PDF')
      const { html, filename } = await res.json()
      const blob = new Blob([html], { type: 'text/html' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'export")
    } finally {
      setExportingPDF(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Chargement...</div>
  if (!outing) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Sortie introuvable</div>

  const hasDays = blocks.some((b) => b.day)
  const allTracks = blocks.flatMap((b) => b.tracks)
  const totalKm = Math.round(allTracks.reduce((s, t) => s + (t.distance_km || 0), 0))
  const totalMin = allTracks.reduce((s, t) => s + (t.duree_minutes || 0), 0)
  const totalIg = blocks.reduce((s, b) => s + b.media.length, 0)
  const totalAnec = blocks.reduce((s, b) => s + b.anecdotes.length, 0)
  const nbDays = blocks.filter((b) => b.day).length
  const availableMembers = allMembers.filter((m) => !participants.some((p) => p.id === m.id))

  const stats = [
    { label: 'Jours', value: nbDays || '—' },
    { label: 'Distance', value: totalKm ? `${totalKm} km` : '—' },
    { label: 'Temps', value: fmtDur(totalMin) },
    { label: 'Participants', value: participants.length },
    { label: 'Lieux', value: placesCount },
    { label: 'Posts Insta', value: totalIg },
    { label: 'Anecdotes', value: totalAnec },
  ]

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#E8D5B0' }}>{outing.titre}</h1>
            <p className="text-slate-400 text-sm mt-1">Jour par jour : GPX, notes, anecdotes, Instagram.</p>
          </div>
          {outing.type === 'roadtrip_multi_jours' && (
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="py-2 px-3 rounded-lg font-semibold text-xs text-white disabled:opacity-50 flex-shrink-0"
              style={{ backgroundColor: '#D9622B' }}
            >
              {exportingPDF ? '⏳' : '📥 Carnet PDF'}
            </button>
          )}
        </div>

        {error && <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>}

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
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Participants</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {participants.length === 0 && <span className="text-sm text-slate-500">Aucun participant</span>}
            {participants.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-sm text-slate-200">
                {p.nom_affiche}
                {isAdmin && (
                  <button onClick={() => removeParticipant(p.id)} disabled={busy === `rm-part-${p.id}`}
                    className="text-red-400 hover:text-red-300" aria-label={`Retirer ${p.nom_affiche}`}>×</button>
                )}
              </span>
            ))}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <select value={addMemberId} onChange={(e) => setAddMemberId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-600">
                <option value="">Ajouter un membre…</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom_affiche} (@{m.pseudo})</option>
                ))}
              </select>
              <button onClick={addParticipant} disabled={!addMemberId || busy === 'add-part'}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#2F4A38' }}>
                Ajouter
              </button>
            </div>
          )}
        </div>

        {isAdmin && !hasDays && outing.type === 'roadtrip_multi_jours' && (
          <button onClick={generateDays} disabled={busy === 'gen'}
            className="w-full mb-4 py-3 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#2F4A38' }}>
            {busy === 'gen' ? 'Génération...' : '📅 Générer les jours à partir des dates'}
          </button>
        )}

        <div className="space-y-4">
          {blocks.map((block) => {
            const key = block.day?.id || 'outing'
            const label = block.day
              ? `Jour ${block.day.numero_jour}${block.day.titre_du_jour ? ` — ${block.day.titre_du_jour}` : ''}`
              : '🌍 Sur toute la sortie'
            const dateStr = block.day?.date
              ? new Date(block.day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              : null

            return (
              <div key={key} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-bold" style={{ color: '#E8D5B0' }}>{label}</h3>
                  {dateStr && <span className="text-xs text-slate-500">{dateStr}</span>}
                </div>

                {/* GPX */}
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    {block.day ? 'Trace GPX du jour' : 'Trace GPX globale'}
                  </p>
                  {block.tracks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-300">🛰️ {t.distance_km} km{t.duree && t.duree !== '00:00' ? ` · ${t.duree}` : ''}</span>
                      {canDelete(t.member_id) && (
                        <button onClick={() => deleteTrack(t)} disabled={busy === `del-t-${t.id}`} className="text-red-400 hover:underline text-xs">Supprimer</button>
                      )}
                    </div>
                  ))}
                  <label className="mt-2 inline-block cursor-pointer text-sm text-orange-400 hover:underline">
                    {busy === `gpx-${key}` ? 'Import...' : '+ Ajouter un GPX'}
                    <input type="file" accept=".gpx" className="hidden" disabled={busy === `gpx-${key}`}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadGPX(f, block.day); e.target.value = '' }} />
                  </label>
                </div>

                {/* Notes (day only) */}
                {block.day && (
                  <div className="mb-3">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Notes du jour</p>
                    {block.day.notes_du_jour && (
                      <p className="text-sm text-slate-300 whitespace-pre-line mb-2 p-2 rounded bg-slate-800/60">{block.day.notes_du_jour}</p>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ajouter une note…" value={noteInput[block.day.id] || ''}
                        onChange={(e) => setNoteInput((p) => ({ ...p, [block.day!.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-600" />
                      <button onClick={() => addNote(block.day!)} disabled={busy === `note-${block.day.id}`}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#D9622B' }}>
                        {busy === `note-${block.day.id}` ? '...' : 'Ajouter'}
                      </button>
                    </div>
                    <button onClick={() => handleGenerateSummary(block.day!.id)} disabled={generatingSummary === block.day.id}
                      className="mt-2 text-xs text-orange-400 hover:underline disabled:opacity-50">
                      {generatingSummary === block.day.id ? 'Génération...' : '✨ Générer un résumé IA'}
                    </button>
                    {block.day.resume_ia && (
                      <p className="mt-2 text-sm italic text-slate-400 p-2 rounded bg-gradient-to-r from-orange-900/10 to-slate-800/40">{block.day.resume_ia}</p>
                    )}
                  </div>
                )}

                {/* Instagram */}
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Liens Instagram</p>
                  {block.media.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm py-1">
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-orange-400 truncate max-w-[70%]">📷 {m.url}</a>
                      {canDelete(m.member_id) && (
                        <button onClick={() => deleteMedia(m)} disabled={busy === `del-m-${m.id}`} className="text-red-400 hover:underline text-xs">Supprimer</button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input type="url" placeholder="https://instagram.com/p/..." value={igInput[key] || ''}
                      onChange={(e) => setIgInput((p) => ({ ...p, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-600" />
                    <button onClick={() => addInstagram(block.day)} disabled={busy === `ig-${key}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#D9622B' }}>
                      {busy === `ig-${key}` ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </div>

                {/* Anecdotes */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Anecdotes</p>
                  {block.anecdotes.map((a) => (
                    <div key={a.id} className="flex items-start justify-between gap-2 text-sm py-1">
                      <span className="text-slate-300">💬 {a.texte}</span>
                      {canDelete(a.member_id) && (
                        <button onClick={() => deleteAnecdote(a)} disabled={busy === `del-a-${a.id}`} className="text-red-400 hover:underline text-xs flex-shrink-0">Supprimer</button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <textarea rows={2} placeholder="Une anecdote de cette étape…" value={anecInput[key] || ''}
                      onChange={(e) => setAnecInput((p) => ({ ...p, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-600" />
                    <button onClick={() => addAnecdote(block.day)} disabled={busy === `anec-${key}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 self-start" style={{ backgroundColor: '#D9622B' }}>
                      {busy === `anec-${key}` ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Link href={`/outings/${id}`} className="block mt-8 text-center text-orange-400 hover:underline text-sm">
          ← Retour à la sortie
        </Link>
      </div>
    </div>
  )
}
