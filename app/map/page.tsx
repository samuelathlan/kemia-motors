'use client'

import { useEffect, useState } from 'react'
import { getAllPlaces, getAllTracks } from '@/lib/map/service'
import type { VisitedPlace, GPXTrack } from '@/lib/types'

export default function MapPage() {
  const [places, setPlaces] = useState<VisitedPlace[]>([])
  const [tracks, setTracks] = useState<GPXTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesData, tracksData] = await Promise.all([
          getAllPlaces(),
          getAllTracks(),
        ])
        setPlaces(placesData)
        setTracks(tracksData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="min-h-screen p-4">Chargement de la carte...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
        Carte du Club
      </h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Map placeholder */}
      <div
        className="w-full h-96 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center mb-8"
        style={{ backgroundColor: '#0f1419' }}
      >
        <p className="text-slate-400">Carte interactive Leaflet (à construire)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Lieux</p>
          <p className="text-xl font-bold">{places.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Traces</p>
          <p className="text-xl font-bold">{tracks.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Pays</p>
          <p className="text-xl font-bold">
            {new Set(places.map((p) => p.pays)).size}
          </p>
        </div>
      </div>

      {/* Places list */}
      {places.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
            Lieux visités
          </h2>
          <div className="space-y-3">
            {places.slice(0, 10).map((place) => (
              <div
                key={place.id}
                className="p-4 rounded-lg bg-slate-900 border border-slate-700"
              >
                <h3 className="font-semibold">{place.nom}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {place.region && `${place.region}, `}
                  {place.pays}
                </p>
              </div>
            ))}
            {places.length > 10 && (
              <p className="text-center text-slate-400 text-sm py-4">
                +{places.length - 10} lieux
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
