'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import type { Outing, OutingDay, GPXTrack, MediaLink } from '@/lib/types'
import Link from 'next/link'

type DayView = {
  day: OutingDay
  km: number
  minutes: number
  instagram: MediaLink[]
}

type OutingView = {
  outing: Outing
  totalKm: number
  totalMinutes: number
  instagramCount: number
  days: DayView[]
  looseInstagram: MediaLink[]
  looseKm: number
}

function fmtDuration(min: number): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`
}

export default function OverviewPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [views, setViews] = useState<OutingView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    const run = async () => {
      try {
        const [{ data: outings }, { data: days }, { data: tracks }, { data: media }] = await Promise.all([
          supabase.from('outings').select('*').order('date_debut', { ascending: false }),
          supabase.from('outing_days').select('*').order('numero_jour', { ascending: true }),
          supabase.from('gpx_tracks').select('*'),
          supabase.from('media_links').select('*').eq('plateforme', 'instagram'),
        ])

        const allTracks = (tracks || []) as GPXTrack[]
        const allMedia = (media || []) as MediaLink[]
        const allDays = (days || []) as OutingDay[]

        const built: OutingView[] = (outings || []).map((o: Outing) => {
          const oDays = allDays.filter((d) => d.outing_id === o.id)
          const dayViews: DayView[] = oDays.map((d) => {
            const dt = allTracks.filter((t) => t.outing_day_id === d.id)
            return {
              day: d,
              km: dt.reduce((s, t) => s + (t.distance_km || 0), 0),
              minutes: dt.reduce((s, t) => s + (t.duree_minutes || 0), 0),
              instagram: allMedia.filter((m) => m.outing_day_id === d.id),
            }
          })
          const oTracks = allTracks.filter((t) => t.outing_id === o.id)
          const oMedia = allMedia.filter((m) => m.outing_id === o.id)
          const looseInstagram = oMedia.filter((m) => !m.outing_day_id)
          const looseKm = oTracks.filter((t) => !t.outing_day_id).reduce((s, t) => s + (t.distance_km || 0), 0)
          return {
            outing: o,
            totalKm: Math.round(oTracks.reduce((s, t) => s + (t.distance_km || 0), 0)),
            totalMinutes: oTracks.reduce((s, t) => s + (t.duree_minutes || 0), 0),
            instagramCount: oMedia.length,
            days: dayViews,
            looseInstagram,
            looseKm: Math.round(looseKm),
          }
        })

        setViews(built)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user, authLoading, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Chargement...</div>

  const grandKm = views.reduce((s, v) => s + v.totalKm, 0)
  const grandOutings = views.length
  const grandInsta = views.reduce((s, v) => s + v.instagramCount, 0)
  const grandMinutes = views.reduce((s, v) => s + v.totalMinutes, 0)

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-orange-400 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-3xl font-bold mt-2" style={{ color: '#E8D5B0' }}>Vue d&apos;ensemble</h1>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>
        )}

        {/* Grand totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Sorties', value: grandOutings },
            { label: 'Total KM', value: grandKm },
            { label: 'Temps de route', value: fmtDuration(grandMinutes) },
            { label: 'Posts Insta', value: grandInsta },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-lg border border-slate-700 bg-slate-900/40 text-center">
              <p className="text-2xl font-bold" style={{ color: '#D9622B' }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-outing */}
        <div className="space-y-3">
          {views.map((v) => {
            const isOpen = open[v.outing.id]
            return (
              <div key={v.outing.id} className="rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden">
                <button
                  onClick={() => setOpen((p) => ({ ...p, [v.outing.id]: !p[v.outing.id] }))}
                  className="w-full text-left p-4 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate" style={{ color: '#E8D5B0' }}>{v.outing.titre}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(v.outing.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {v.outing.date_fin ? ` → ${new Date(v.outing.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right flex-shrink-0">
                      <div>
                        <p className="text-sm font-bold text-slate-200">{v.totalKm} km</p>
                        <p className="text-[10px] text-slate-500">{fmtDuration(v.totalMinutes)}</p>
                      </div>
                      <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    {v.days.length > 0 && <span>📅 {v.days.length} jours</span>}
                    {v.instagramCount > 0 && <span>📷 {v.instagramCount} posts</span>}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-800">
                    {v.days.map((dv) => (
                      <div key={dv.day.id} className="pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-300">
                            Jour {dv.day.numero_jour}
                            {dv.day.titre_du_jour ? ` — ${dv.day.titre_du_jour}` : ''}
                          </p>
                          <p className="text-xs text-slate-400">
                            {dv.km > 0 ? `${Math.round(dv.km)} km` : '—'}
                            {dv.minutes > 0 ? ` · ${fmtDuration(dv.minutes)}` : ''}
                          </p>
                        </div>
                        {dv.instagram.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {dv.instagram.map((m) => (
                              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-orange-400 hover:underline">📷 post</a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {(v.looseInstagram.length > 0 || v.looseKm > 0) && (
                      <div className="pt-3">
                        <p className="text-sm font-semibold text-slate-300">Général</p>
                        {v.looseKm > 0 && <p className="text-xs text-slate-400">{v.looseKm} km</p>}
                        {v.looseInstagram.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {v.looseInstagram.map((m) => (
                              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-orange-400 hover:underline">📷 post</a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {v.days.length === 0 && v.looseInstagram.length === 0 && v.looseKm === 0 && (
                      <p className="pt-3 text-xs text-slate-500">Aucune donnée pour cette sortie.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {views.length === 0 && <p className="text-slate-500 text-center py-8">Aucune sortie pour le moment.</p>}
        </div>
      </div>
    </div>
  )
}
