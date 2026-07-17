'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member, Outing, VisitedPlace } from '@/lib/types'
import Image from 'next/image'
import Tooltip from '@/components/Tooltip'

type DashboardStats = {
  memberKm: number
  memberOutings: number
  memberPlaces: number
  clubKm: number
  clubOutings: number
  clubMembers: number
  nextOuting: Outing | null
  lastPlace: VisitedPlace | null
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    memberKm: 0,
    memberOutings: 0,
    memberPlaces: 0,
    clubKm: 0,
    clubOutings: 0,
    clubMembers: 0,
    nextOuting: null,
    lastPlace: null,
  })
  const [error, setError] = useState('')
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch member data
        const { data: memberData, error: memberErr } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (memberErr) throw memberErr
        setMember(memberData)

        // Check if charter accepted
        if (memberData.statut === 'en_attente_acceptation_charte') {
          router.push('/charter')
          return
        }

        // Fetch stats
        const { data: memberOutings } = await supabase
          .from('outing_participants')
          .select('id')
          .eq('member_id', user.id)

        const { data: memberTracks } = await supabase
          .from('gpx_tracks')
          .select('distance_km')
          .eq('member_id', user.id)

        const { data: allOutings } = await supabase
          .from('outings')
          .select('*')
          .order('date_debut', { ascending: false })

        const { data: allMembers } = await supabase
          .from('members')
          .select('id')
          .eq('statut', 'membre_actif')

        const { data: allPlaces } = await supabase
          .from('visited_places')
          .select('*')
          .order('date_visite', { ascending: false })

        const { data: allTracks } = await supabase
          .from('gpx_tracks')
          .select('distance_km')

        const memberKm = memberTracks?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0
        const clubKm = allTracks?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0
        const nextOuting = allOutings?.find((o) => new Date(o.date_debut) > new Date()) || null

        setStats({
          memberKm: Math.round(memberKm),
          memberOutings: memberOutings?.length || 0,
          memberPlaces: allPlaces?.filter((p) => p.outing_id).length || 0,
          clubKm: Math.round(clubKm),
          clubOutings: allOutings?.length || 0,
          clubMembers: allMembers?.length || 0,
          nextOuting,
          lastPlace: allPlaces?.[0] || null,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoadingStats(false)
      }
    }

    fetchData()
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profil non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Hero Section */}
      <div
        className="relative p-6 pt-8 pb-12 text-white"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '2px solid #D9622B',
        }}
      >
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-orange-400 uppercase tracking-widest mb-2">Bienvenue</p>
              <h1 className="text-4xl font-bold mb-1" style={{ color: '#E8D5B0' }}>
                {member.nom_affiche}
              </h1>
              <p className="text-slate-400">@{member.pseudo}</p>
            </div>
            {member.role === 'super_admin' && (
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#D9622B', color: '#E8D5B0' }}
              >
                ADMIN
              </div>
            )}
          </div>

          {/* Personal Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">KM</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.memberKm}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Sorties</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.memberOutings}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Lieux</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.memberPlaces}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Actions rapides</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/outings"
              className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition text-center"
            >
              <Tooltip text="Voir toutes les sorties du club">
                <p className="text-2xl mb-2">🏍️</p>
              </Tooltip>
              <p className="font-semibold text-sm">Sorties</p>
            </a>
            <a
              href="/note-du-jour"
              className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition text-center"
            >
              <Tooltip text="Ajouter une note rapide">
                <p className="text-2xl mb-2">📝</p>
              </Tooltip>
              <p className="font-semibold text-sm">Note du jour</p>
            </a>
            <a
              href="/import"
              className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition text-center"
            >
              <Tooltip text="Importer GPX/KML">
                <p className="text-2xl mb-2">📤</p>
              </Tooltip>
              <p className="font-semibold text-sm">Importer</p>
            </a>
            <a
              href="/map-regions"
              className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition text-center"
            >
              <Tooltip text="Voir la carte">
                <p className="text-2xl mb-2">🗺️</p>
              </Tooltip>
              <p className="font-semibold text-sm">Carte</p>
            </a>
          </div>
        </div>

        {/* Next Outing Highlight */}
        {stats.nextOuting && (
          <div
            className="p-5 rounded-lg border-l-4"
            style={{ backgroundColor: '#1a1a1a', borderLeftColor: '#D9622B' }}
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Prochaine sortie</p>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#E8D5B0' }}>
              {stats.nextOuting.titre}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>📅</span>
              <span>
                {new Date(stats.nextOuting.date_debut).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            <a
              href={`/outings/${stats.nextOuting.id}`}
              className="mt-3 inline-block text-sm text-orange-400 hover:underline"
            >
              Voir les détails →
            </a>
          </div>
        )}

        {/* Club Stats Section */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Statistiques du club</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Total KM</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.clubKm}</p>
              <p className="text-xs text-slate-500 mt-1">km parcourus</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Sorties</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.clubOutings}</p>
              <p className="text-xs text-slate-500 mt-1">du club</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Membres</p>
              <p className="text-2xl font-bold">{loadingStats ? '...' : stats.clubMembers}</p>
              <p className="text-xs text-slate-500 mt-1">actifs</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Dernière visite</p>
              <p className="text-2xl font-bold">📍</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{stats.lastPlace?.nom || 'Bientôt'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Explorer</p>
          <div className="space-y-3">
            <a
              href="/timeline"
              className="block p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <p className="font-semibold mb-1">📖 Carnet de voyage</p>
              <p className="text-xs text-slate-400">Toute l'histoire du club</p>
            </a>
            <a
              href="/stats"
              className="block p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <p className="font-semibold mb-1">📊 Statistiques</p>
              <p className="text-xs text-slate-400">Progression et records</p>
            </a>
            <a
              href="/charter"
              className="block p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <p className="font-semibold mb-1">📜 Charte</p>
              <p className="text-xs text-slate-400">Les valeurs du club</p>
            </a>
            <a
              href="/search"
              className="block p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition"
            >
              <p className="font-semibold mb-1">🔍 Rechercher</p>
              <p className="text-xs text-slate-400">Sorties, lieux, anecdotes</p>
            </a>
          </div>
        </div>

        {/* Admin Panel Link (if admin) */}
        {(member.role === 'admin' || member.role === 'super_admin') && (
          <a
            href="/admin"
            className="block w-full py-3 px-4 rounded-lg border border-orange-600 text-orange-400 text-center hover:bg-orange-600/10 transition mb-4"
          >
            ⚙️ Panneau d'administration
          </a>
        )}

        {/* Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="w-full py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}
