'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { VisitedPlace } from '@/lib/types'

type RegionStats = {
  [key: string]: number
}

export default function MapRegionsPage() {
  const [countries, setCountries] = useState<string[]>([])
  const [regions, setRegions] = useState<RegionStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: places, error } = await supabase
          .from('visited_places')
          .select('pays, region')

        if (error) throw error

        const countrySet = new Set<string>()
        const regionMap: RegionStats = {}

        places?.forEach((place: any) => {
          if (place.pays) countrySet.add(place.pays)
          const key = place.region ? `${place.region}, ${place.pays}` : place.pays
          regionMap[key] = (regionMap[key] || 0) + 1
        })

        setCountries(Array.from(countrySet).sort())
        setRegions(regionMap)
      } catch (err) {
        console.error('Error fetching regions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen p-4">Chargement...</div>

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
        Pays & régions
      </h1>
      <p className="text-slate-400 mb-8">Où avons-nous roulé?</p>

      {/* Countries visited */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
          Pays visités
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {countries.map((country) => (
            <div
              key={country}
              className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center"
            >
              <p className="font-semibold text-sm">{country}</p>
              <p className="text-xs text-slate-400 mt-1">
                {Object.entries(regions)
                  .filter(([k]) => k.endsWith(country))
                  .reduce((sum, [, v]) => sum + v, 0)}{' '}
                lieu(x)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Regions breakdown */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
          Régions détaillées
        </h2>
        <div className="space-y-2">
          {Object.entries(regions)
            .sort(([, a], [, b]) => b - a)
            .map(([region, count]) => (
              <div key={region} className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{region}</p>
                  <p className="text-sm font-bold" style={{ color: '#D9622B' }}>
                    {count} lieu{count > 1 ? 'x' : ''}
                  </p>
                </div>
                <div className="w-full bg-slate-800 rounded h-2">
                  <div
                    className="h-full rounded transition"
                    style={{
                      backgroundColor: '#D9622B',
                      width: `${Math.min((count / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {countries.length === 0 && (
        <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
          Aucun pays visité pour le moment
        </div>
      )}
    </div>
  )
}
