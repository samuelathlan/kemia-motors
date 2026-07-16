'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Fetch member data
    const fetchMember = async () => {
      try {
        const { data, error: err } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (err) throw err
        setMember(data)

        // Check if charter accepted
        if (data.statut === 'en_attente_acceptation_charte') {
          router.push('/charter')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      }
    }

    fetchMember()
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
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#E8D5B0' }}>
          {member.nom_affiche}
        </h1>
        <p className="text-slate-400">@{member.pseudo}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">KM</p>
          <p className="text-xl font-bold">--</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">Sorties</p>
          <p className="text-xl font-bold">--</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #D9622B' }}>
          <p className="text-xs text-slate-400 mb-1">Lieux</p>
          <p className="text-xl font-bold">--</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-3">
        <a
          href="/outings"
          className="block p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-600 transition"
        >
          <p className="font-semibold">Sorties</p>
          <p className="text-sm text-slate-400">Voir les sorties du club</p>
        </a>
        <a
          href="/map"
          className="block p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-600 transition"
        >
          <p className="font-semibold">Carte du Club</p>
          <p className="text-sm text-slate-400">Tous les lieux visités</p>
        </a>
        <a
          href="/motorcycles"
          className="block p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-600 transition"
        >
          <p className="font-semibold">Motos</p>
          <p className="text-sm text-slate-400">Les motos du club</p>
        </a>
        <a
          href="/charter"
          className="block p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-600 transition"
        >
          <p className="font-semibold">Charte du Club</p>
          <p className="text-sm text-slate-400">Nos valeurs</p>
        </a>
      </div>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="w-full py-3 rounded-lg border border-slate-700 text-center hover:bg-slate-800 transition"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}
