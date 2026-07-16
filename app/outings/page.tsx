'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getOutings } from '@/lib/outings/service'
import Link from 'next/link'
import type { Outing, Member } from '@/lib/types'

export default function OutingsPage() {
  const [outings, setOutings] = useState<(Outing & { creator: Member | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOutings = async () => {
      try {
        const data = await getOutings()

        // Fetch creator info for each outing
        const outingsWithCreator = await Promise.all(
          data.map(async (outing) => {
            const { data: creator } = await supabase
              .from('members')
              .select('*')
              .eq('id', outing.cree_par)
              .single()
            return { ...outing, creator: creator || null }
          })
        )

        setOutings(outingsWithCreator)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchOutings()
  }, [])

  if (loading) {
    return <div className="min-h-screen p-4">Chargement...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
        Sorties du Club
      </h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {outings.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Aucune sortie programmée</p>
        ) : (
          outings.map((outing) => (
            <Link
              key={outing.id}
              href={`/outings/${outing.id}`}
              className="block p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-bold text-lg">{outing.titre}</h2>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: '#2F4A38',
                    color: '#E8D5B0',
                  }}
                >
                  {outing.type === 'roadtrip_multi_jours' ? 'Roadtrip' : 'Sortie'}
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-3">{outing.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {new Date(outing.date_debut).toLocaleDateString('fr-FR')}
                </span>
                <span>par {outing.creator?.nom_affiche || 'Inconnu'}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
