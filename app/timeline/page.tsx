'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import type { Outing, VisitedPlace, Anecdote } from '@/lib/types'

type TimelineItem = {
  id: string
  type: 'outing' | 'place' | 'anecdote'
  date: string | null
  title: string
  description?: string | null
  data: any
}

export default function TimelinePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sorties' | 'lieux' | 'anecdotes'>('all')

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const timeline: TimelineItem[] = []

        // Get all outings
        const { data: outings, error: outingsErr } = await supabase
          .from('outings')
          .select('*')
          .order('date_debut', { ascending: false })

        if (!outingsErr && outings) {
          outings.forEach((outing: Outing) => {
            timeline.push({
              id: outing.id,
              type: 'outing',
              date: outing.date_debut,
              title: outing.titre,
              description: outing.description,
              data: outing,
            })
          })
        }

        // Get all visited places
        const { data: places, error: placesErr } = await supabase
          .from('visited_places')
          .select('*')
          .order('date_visite', { ascending: false })

        if (!placesErr && places) {
          places.forEach((place: VisitedPlace) => {
            if (place.date_visite) {
              timeline.push({
                id: place.id,
                type: 'place',
                date: place.date_visite,
                title: place.nom,
                description: place.description,
                data: place,
              })
            }
          })
        }

        // Get all anecdotes
        const { data: anecdotes, error: anecdotesErr } = await supabase
          .from('anecdotes')
          .select('*')
          .order('created_at', { ascending: false })

        if (!anecdotesErr && anecdotes) {
          anecdotes.forEach((anecdote: Anecdote) => {
            timeline.push({
              id: anecdote.id,
              type: 'anecdote',
              date: anecdote.created_at,
              title: 'Anecdote',
              description: anecdote.texte,
              data: anecdote,
            })
          })
        }

        // Sort by date (filter out items without dates)
        const itemsWithDates = timeline.filter((item) => item.date)
        itemsWithDates.sort((a, b) =>
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        )
        setItems(itemsWithDates)
      } catch (err) {
        console.error('Error fetching timeline:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [user])

  const filtered = items.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'sorties') return item.type === 'outing'
    if (filter === 'lieux') return item.type === 'place'
    if (filter === 'anecdotes') return item.type === 'anecdote'
    return true
  })

  if (loading) {
    return <div className="min-h-screen p-4">Chargement...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
        Carnet de voyage
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {(['all', 'sorties', 'lieux', 'anecdotes'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              filter === f
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 border border-slate-700 hover:border-orange-600'
            }`}
          >
            {f === 'all' && 'Tous'}
            {f === 'sorties' && 'Sorties'}
            {f === 'lieux' && 'Lieux'}
            {f === 'anecdotes' && 'Anecdotes'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: '#D9622B' }}
        />

        {/* Items */}
        <div className="space-y-6 ml-12">
          {filtered.map((item) => (
            <div key={item.id} className="relative">
              {/* Dot */}
              <div
                className="absolute -left-8 top-2 w-5 h-5 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: '#D9622B' }}
              />

              {/* Card */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      {item.type === 'outing' && '🏍️ Sortie'}
                      {item.type === 'place' && '📍 Lieu'}
                      {item.type === 'anecdote' && '💭 Anecdote'}
                    </p>
                    <h3 className="text-lg font-bold" style={{ color: '#E8D5B0' }}>
                      {item.title}
                    </h3>
                  </div>
                  {item.date && (
                    <p className="text-xs text-slate-500">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                )}

                {item.type === 'place' && (
                  <p className="text-xs text-slate-500 mt-2">
                    {item.data.region && `${item.data.region}, `}
                    {item.data.pays}
                  </p>
                )}

                {item.type === 'outing' && (
                  <a
                    href={`/outings/${item.id}`}
                    className="inline-block mt-2 text-xs text-orange-400 hover:underline"
                  >
                    Voir les détails →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
          Aucun événement à afficher
        </div>
      )}
    </div>
  )
}
