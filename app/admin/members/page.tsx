'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import Link from 'next/link'

export default function AdminMembersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMember, setCurrentMember] = useState<Member | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!memberData || memberData.role !== 'super_admin') {
          router.push('/dashboard')
          return
        }

        setCurrentMember(memberData)

        const { data: allMembers } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false })

        setMembers(allMembers || [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      invité: '⏳',
      en_attente_acceptation_charte: '📋',
      membre_actif: '✅',
      retiré: '❌',
    }
    return badges[status] || '❓'
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      invité: 'bg-slate-800',
      en_attente_acceptation_charte: 'bg-yellow-900/30',
      membre_actif: 'bg-green-900/30',
      retiré: 'bg-red-900/30',
    }
    return colors[status] || 'bg-slate-800'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!currentMember) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-orange-400 hover:underline text-sm">
            ← Retour à l'admin
          </Link>
          <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
            Membres du club
          </h1>
          <p className="text-slate-400">Total: {members.length} membres</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-green-400">
              {members.filter((m) => m.statut === 'membre_actif').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Actifs</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {members.filter((m) => m.statut === 'en_attente_acceptation_charte').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">En attente charte</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-slate-400">
              {members.filter((m) => m.statut === 'invité').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Invités</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-red-400">
              {members.filter((m) => m.statut === 'retiré').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Retirés</p>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className={`p-4 rounded-lg border border-slate-700 ${getStatusColor(m.statut)}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStatusBadge(m.statut)}</span>
                    <h3 className="text-lg font-bold" style={{ color: '#E8D5B0' }}>
                      {m.nom_affiche}
                    </h3>
                    {m.role === 'super_admin' && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#D9622B', color: '#E8D5B0' }}>
                        SUPER ADMIN
                      </span>
                    )}
                    {m.role === 'admin' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-400">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">@{m.pseudo}</p>
                  <div className="text-xs text-slate-500 mt-2">
                    📅 {new Date(m.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
