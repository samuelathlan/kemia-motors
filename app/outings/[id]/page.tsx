'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { getOutingDetails, getRSVP, upsertRSVP } from '@/lib/outings/service'
import type { Outing, VisitedPlace, OutingRSVP } from '@/lib/types'

export default function OutingDetailPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const [outing, setOuting] = useState<Outing | null>(null)
  const [places, setPlaces] = useState<VisitedPlace[]>([])
  const [rsvp, setRsvp] = useState<OutingRSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await getOutingDetails(id)
        setOuting(details.outing)
        setPlaces(details.places)

        if (user) {
          const userRsvp = await getRSVP(id, user.id)
          setRsvp(userRsvp)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleRSVP = async (status: 'oui' | 'non' | 'peut_etre') => {
    if (!user) return

    try {
      const newRsvp = await upsertRSVP(id, user.id, status)
      setRsvp(newRsvp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du RSVP')
    }
  }

  if (loading) {
    return <div className="min-h-screen p-4">Chargement...</div>
  }

  if (!outing) {
    return <div className="min-h-screen p-4">Sortie non trouvée</div>
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
        {outing.titre}
      </h1>
      <p className="text-slate-400 mb-6">{outing.description}</p>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* RSVP Section */}
      <div className="mb-8 p-4 rounded-lg bg-slate-900 border border-slate-700">
        <p className="text-sm text-slate-400 mb-3">Votre statut :</p>
        <div className="grid grid-cols-3 gap-2">
          {(['oui', 'non', 'peut_etre'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleRSVP(status)}
              className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
                rsvp?.statut === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 border border-slate-700 hover:border-orange-600'
              }`}
            >
              {status === 'oui' ? '✅ Oui' : status === 'non' ? '❌ Non' : '❓ Peut-être'}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="mb-8 p-4 rounded-lg bg-slate-900 border border-slate-700">
        <p className="text-sm text-slate-400 mb-2">Dates</p>
        <p className="font-semibold">
          {new Date(outing.date_debut).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {outing.date_fin !== outing.date_debut && (
            <>
              {' → '}
              {new Date(outing.date_fin).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </>
          )}
        </p>
      </div>

      {/* Lieux visités */}
      {places.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
            Lieux visités
          </h2>
          <div className="space-y-3">
            {places.map((place) => (
              <div key={place.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <h3 className="font-semibold">{place.nom}</h3>
                {place.description && (
                  <p className="text-sm text-slate-400 mt-2">{place.description}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {place.region && `${place.region}, `}
                  {place.pays}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map placeholder */}
      <div className="mb-8 p-4 rounded-lg bg-slate-900 border border-slate-700">
        <p className="text-sm text-slate-400">Carte de la sortie (à construire)</p>
      </div>
    </div>
  )
}
