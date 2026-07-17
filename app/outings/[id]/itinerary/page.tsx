'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import { getOutingDays, getAnecdotesForDay, getPlacesForDay } from '@/lib/outings/days-service'
import type { Outing, OutingDay, Anecdote, VisitedPlace, Member } from '@/lib/types'

export default function ItineraryPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const [outing, setOuting] = useState<Outing | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [days, setDays] = useState<OutingDay[]>([])
  const [dayDetails, setDayDetails] = useState<Map<string, { anecdotes: Anecdote[]; places: VisitedPlace[] }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get outing
        const { data: outingData, error: outingErr } = await supabase
          .from('outings')
          .select('*')
          .eq('id', id)
          .single()

        if (outingErr) throw outingErr
        setOuting(outingData)

        // Get current member
        if (user) {
          const { data: memberData } = await supabase
            .from('members')
            .select('*')
            .eq('id', user.id)
            .single()
          setMember(memberData)
        }

        // Get days if multi-day
        if (outingData?.type === 'roadtrip_multi_jours') {
          const outingDays = await getOutingDays(id)
          setDays(outingDays)

          // Fetch details for each day
          const details = new Map()
          for (const day of outingDays) {
            const anecdotes = await getAnecdotesForDay(day.id)
            const places = await getPlacesForDay(day.id)
            details.set(day.id, { anecdotes, places })
          }
          setDayDetails(details)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleGenerateSummary = async (dayId: string) => {
    if (!process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      // Skip in production without API key
      setError('Résumés IA non disponibles (clé API non configurée)')
      return
    }

    setGeneratingSummary(dayId)
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur de génération')
      }

      // Refresh day data
      const { data: updatedDay } = await supabase
        .from('outing_days')
        .select('*')
        .eq('id', dayId)
        .single()

      setDays((prev) =>
        prev.map((d) => (d.id === dayId ? updatedDay : d))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGeneratingSummary(null)
    }
  }

  const handleExportPDF = async () => {
    if (!outing) return

    setExportingPDF(true)
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outingId: id }),
      })

      if (!res.ok) throw new Error('Erreur export PDF')

      const { html, filename } = await res.json()

      // Trigger download
      const blob = new Blob([html], { type: 'text/html' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
    } finally {
      setExportingPDF(false)
    }
  }

  if (loading) return <div className="min-h-screen p-4">Chargement...</div>
  if (!outing) return <div className="min-h-screen p-4">Sortie non trouvée</div>

  if (outing.type === 'sortie_simple') {
    return (
      <div className="min-h-screen p-4">
        <p className="text-slate-400">Cet itinéraire n'existe que pour les roadtrips multi-jours</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
            Itinéraire
          </h1>
          <p className="text-slate-400">{outing.titre}</p>
        </div>
        {outing.type === 'roadtrip_multi_jours' && (
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition text-white"
            style={{
              backgroundColor: exportingPDF ? '#475569' : '#D9622B',
            }}
          >
            {exportingPDF ? '⏳ Export...' : '📥 Carnet PDF'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {days.map((day, idx) => {
          const details = dayDetails.get(day.id)
          return (
            <div
              key={day.id}
              className="p-6 rounded-lg bg-slate-900 border border-slate-700"
            >
              {/* Day header */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold" style={{ color: '#D9622B' }}>
                  Jour {day.numero_jour}
                </h2>
                {day.titre_du_jour && <p className="text-slate-300 mt-1">{day.titre_du_jour}</p>}
                {day.date && (
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                )}
              </div>

              {/* Accommodation */}
              {day.hebergement_nom && (
                <div className="mb-4 p-3 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400 mb-1">🏨 Hébergement</p>
                  <p className="font-semibold">{day.hebergement_nom}</p>
                  {day.hebergement_url && (
                    <a
                      href={day.hebergement_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-400 hover:underline mt-1 block"
                    >
                      Voir la réservation →
                    </a>
                  )}
                </div>
              )}

              {/* Notes */}
              {day.notes_du_jour && (
                <div className="mb-4 p-3 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400 mb-1">📝 Notes du jour</p>
                  <p className="text-sm leading-relaxed">{day.notes_du_jour}</p>
                </div>
              )}

              {/* Places visited */}
              {details?.places && details.places.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">📍 Lieux visités</p>
                  <div className="space-y-2">
                    {details.places.map((place) => (
                      <div key={place.id} className="p-2 rounded bg-slate-800">
                        <p className="font-semibold text-sm">{place.nom}</p>
                        {place.description && (
                          <p className="text-xs text-slate-400 mt-1">{place.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anecdotes */}
              {details?.anecdotes && details.anecdotes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">💭 Anecdotes</p>
                  <div className="space-y-2">
                    {details.anecdotes.map((anecdote) => (
                      <div key={anecdote.id} className="p-2 rounded bg-slate-800">
                        <p className="text-sm leading-relaxed">{anecdote.texte}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div className="border-t border-slate-700 pt-4">
                {day.resume_ia ? (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-orange-900/20 to-slate-800">
                    <p className="text-xs text-slate-400 mb-2">✨ Résumé IA</p>
                    <p className="text-sm leading-relaxed italic">{day.resume_ia}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Généré le {new Date(day.resume_genere_at!).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ) : null}

                <button
                  onClick={() => handleGenerateSummary(day.id)}
                  disabled={generatingSummary === day.id}
                  className="w-full py-2 px-4 rounded-lg font-semibold text-sm transition"
                  style={{
                    backgroundColor: generatingSummary === day.id ? '#475569' : '#D9622B',
                    color: 'white',
                  }}
                >
                  {generatingSummary === day.id ? '⏳ Génération...' : '✨ Résumé IA'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {days.length === 0 && (
        <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
          Aucun jour planifié pour cette sortie
        </div>
      )}
    </div>
  )
}
