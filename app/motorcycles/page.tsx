'use client'

import { useEffect, useState } from 'react'
import { getMotorcycles, getPhotoURL } from '@/lib/motorcycles/service'
import { supabase } from '@/lib/supabase/client'
import type { Motorcycle, MotorcyclePhoto } from '@/lib/types'

export default function MotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState<
    (Motorcycle & { motorcycle_photos: MotorcyclePhoto[]; member: any })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        const data = await getMotorcycles()

        // Fetch member info for each motorcycle
        const motos = await Promise.all(
          data.map(async (moto) => {
            const { data: member } = await supabase
              .from('members')
              .select('pseudo, nom_affiche, avatar_storage_path')
              .eq('id', moto.member_id)
              .single()

            return { ...moto, member: member || null }
          })
        )

        setMotorcycles(motos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchMotorcycles()
  }, [])

  if (loading) {
    return <div className="min-h-screen p-4">Chargement des motos...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
        Les Motos du Club
      </h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {motorcycles.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Aucune moto enregistrée</p>
      ) : (
        <div className="space-y-6">
          {motorcycles.map((moto) => (
            <div
              key={moto.id}
              className="p-4 rounded-lg bg-slate-900 border border-slate-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {moto.marque} {moto.modele}
                  </h2>
                  {moto.surnom && (
                    <p className="text-sm" style={{ color: '#D9622B' }}>
                      « {moto.surnom} »
                    </p>
                  )}
                </div>
                <span className="text-sm text-slate-400">{moto.annee}</span>
              </div>

              {/* Owner */}
              <p className="text-sm text-slate-400 mb-4">
                Propriétaire : {moto.member?.nom_affiche || 'Inconnu'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded bg-slate-800/50">
                  <p className="text-xs text-slate-400">KM Total</p>
                  <p className="font-semibold">{moto.kilometrage_total} km</p>
                </div>
              </div>

              {/* Photos */}
              {moto.motorcycle_photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-2">Photos ({moto.motorcycle_photos.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {moto.motorcycle_photos.slice(0, 4).map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded overflow-hidden bg-slate-800"
                      >
                        <img
                          src={getPhotoURL(photo.storage_path)}
                          alt={`${moto.marque} ${moto.modele}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ''
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                    {moto.motorcycle_photos.length > 4 && (
                      <div className="relative aspect-square rounded overflow-hidden bg-slate-800 flex items-center justify-center">
                        <p className="text-sm text-slate-400">
                          +{moto.motorcycle_photos.length - 4}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
