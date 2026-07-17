'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

type SearchResult = {
  id: string
  type: 'outing' | 'place' | 'anecdote'
  title: string
  description?: string | null
  url?: string
  date?: string | null
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const searchTerm = `%${query}%`

        // Search outings
        const { data: outings } = await supabase
          .from('outings')
          .select('id, titre, description, date_debut')
          .or(`titre.ilike.${searchTerm},description.ilike.${searchTerm}`)

        // Search places
        const { data: places } = await supabase
          .from('visited_places')
          .select('id, nom, description, date_visite')
          .or(`nom.ilike.${searchTerm},description.ilike.${searchTerm}`)

        // Search anecdotes
        const { data: anecdotes } = await supabase
          .from('anecdotes')
          .select('id, texte, created_at, outing_day_id')
          .textSearch('texte', query)

        const results: SearchResult[] = [
          ...(outings?.map((o) => ({
            id: o.id,
            type: 'outing' as const,
            title: o.titre,
            description: o.description,
            url: `/outings/${o.id}`,
            date: o.date_debut,
          })) || []),
          ...(places?.map((p) => ({
            id: p.id,
            type: 'place' as const,
            title: p.nom,
            description: p.description,
            date: p.date_visite,
          })) || []),
          ...(anecdotes?.map((a) => ({
            id: a.id,
            type: 'anecdote' as const,
            title: 'Anecdote',
            description: a.texte,
            date: a.created_at,
          })) || []),
        ]

        setResults(results)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
        Rechercher
      </h1>

      {/* Search input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Sorties, lieux, anecdotes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
          autoFocus
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-slate-400 text-center py-8">Recherche...</div>
      )}

      {/* Results */}
      {!loading && query && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    {result.type === 'outing' && '🏍️ Sortie'}
                    {result.type === 'place' && '📍 Lieu'}
                    {result.type === 'anecdote' && '💭 Anecdote'}
                  </p>
                  <h3 className="font-semibold" style={{ color: '#E8D5B0' }}>
                    {result.title}
                  </h3>
                  {result.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>

              {result.date && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(result.date).toLocaleDateString('fr-FR')}
                </p>
              )}

              {result.url && (
                <Link
                  href={result.url}
                  className="inline-block mt-2 text-xs text-orange-400 hover:underline"
                >
                  Voir les détails →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <div className="text-slate-400 text-center py-8">
          Aucun résultat pour "{query}"
        </div>
      )}

      {/* No query */}
      {!query && (
        <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
          Commence à taper pour rechercher
        </div>
      )}
    </div>
  )
}
