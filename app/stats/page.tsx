'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'

type Stats = {
  totalKm: number
  totalOutings: number
  totalPlaces: number
  memberStats: Array<{
    member: Member
    km: number
    outings: number
    places: number
  }>
  monthlyStats: Array<{
    month: string
    outings: number
    km: number
  }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalKm: 0,
    totalOutings: 0,
    totalPlaces: 0,
    memberStats: [],
    monthlyStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total outings
        const { data: outings } = await supabase.from('outings').select('id')
        const totalOutings = outings?.length || 0

        // Total visited places
        const { data: places } = await supabase.from('visited_places').select('id')
        const totalPlaces = places?.length || 0

        // Total KM from GPX tracks
        const { data: tracks } = await supabase.from('gpx_tracks').select('distance_km')
        const totalKm = tracks?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0

        // Per-member stats
        const { data: members } = await supabase
          .from('members')
          .select('*')
          .eq('statut', 'membre_actif')

        const memberStats = await Promise.all(
          (members || []).map(async (member) => {
            const { data: memberOutings } = await supabase
              .from('outing_participants')
              .select('id')
              .eq('member_id', member.id)

            const { data: memberPlaces } = await supabase
              .from('visited_places')
              .select('id')

            const { data: memberTracks } = await supabase
              .from('gpx_tracks')
              .select('distance_km')
              .eq('member_id', member.id)

            const km = memberTracks?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0

            return {
              member,
              km: Math.round(km),
              outings: memberOutings?.length || 0,
              places: memberPlaces?.length || 0,
            }
          })
        )

        // Monthly stats
        const { data: allOutings } = await supabase
          .from('outings')
          .select('date_debut')
          .order('date_debut', { ascending: true })

        const monthlyMap = new Map<string, { outings: number; km: number }>()

        if (allOutings) {
          allOutings.forEach((outing) => {
            const date = new Date(outing.date_debut)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            const current = monthlyMap.get(key) || { outings: 0, km: 0 }
            current.outings += 1
            monthlyMap.set(key, current)
          })
        }

        const monthlyStats = Array.from(monthlyMap.entries())
          .map(([month, data]) => ({
            month,
            ...data,
          }))
          .sort((a, b) => a.month.localeCompare(b.month))

        setStats({
          totalKm: Math.round(totalKm),
          totalOutings,
          totalPlaces,
          memberStats,
          monthlyStats,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="min-h-screen p-4">Chargement...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#E8D5B0' }}>
        Statistiques du club
      </h1>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">KM TOTAL</p>
          <p className="text-2xl font-bold">{stats.totalKm.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">SORTIES</p>
          <p className="text-2xl font-bold">{stats.totalOutings}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">LIEUX</p>
          <p className="text-2xl font-bold">{stats.totalPlaces}</p>
        </div>
      </div>

      {/* Per-member stats */}
      {stats.memberStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
            Par membre
          </h2>
          <div className="space-y-3">
            {stats.memberStats.map((stat) => (
              <div key={stat.member.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <h3 className="font-semibold mb-3">{stat.member.nom_affiche}</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">KM</p>
                    <p className="font-bold">{stat.km}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Sorties</p>
                    <p className="font-bold">{stat.outings}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Lieux</p>
                    <p className="font-bold">{stat.places}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly progression */}
      {stats.monthlyStats.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#D9622B' }}>
            Progression par mois
          </h2>
          <div className="space-y-3">
            {stats.monthlyStats.map((stat) => {
              const date = new Date(stat.month + '-01')
              const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

              return (
                <div key={stat.month} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{monthName}</p>
                    <p className="text-sm text-slate-400">{stat.outings} sortie(s)</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded h-2">
                    <div
                      className="h-full rounded transition"
                      style={{
                        backgroundColor: '#D9622B',
                        width: `${Math.min((stat.outings / 5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
