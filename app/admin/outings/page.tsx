'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Outing, Member } from '@/lib/types'
import Link from 'next/link'

export default function AdminOutingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [outings, setOutings] = useState<Outing[]>([])
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Check admin access
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!memberData || (memberData.role !== 'admin' && memberData.role !== 'super_admin')) {
          router.push('/dashboard')
          return
        }

        setMember(memberData)

        // Fetch outings
        const { data: outingsData } = await supabase
          .from('outings')
          .select('*')
          .order('date_debut', { ascending: false })

        setOutings(outingsData || [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('outings').delete().eq('id', id)

      if (error) throw error

      setOutings(outings.filter((o) => o.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#E8D5B0' }}>
            Sorties
          </h1>
          <p className="text-slate-400">Gère les sorties du club</p>
        </div>
        <Link
          href="/admin/outings/new"
          className="px-4 py-2 rounded-lg font-semibold text-white transition"
          style={{ backgroundColor: '#D9622B' }}
        >
          + Nouvelle sortie
        </Link>
      </div>

      {/* Sorties List */}
      <div className="space-y-3">
        {outings.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
            Aucune sortie. Crée la première!
          </div>
        ) : (
          outings.map((outing) => (
            <div key={outing.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#E8D5B0' }}>
                    {outing.titre}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">{outing.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📅</span>
                    <span>
                      {new Date(outing.date_debut).toLocaleDateString('fr-FR')}
                      {outing.date_fin !== outing.date_debut && ` → ${new Date(outing.date_fin).toLocaleDateString('fr-FR')}`}
                    </span>
                    <span className="ml-2 px-2 py-1 rounded-full bg-slate-800">
                      {outing.type === 'sortie_simple' ? 'Sortie' : 'Roadtrip'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/outings/${outing.id}`}
                    className="px-3 py-2 rounded-lg bg-blue-900/30 text-blue-400 text-sm hover:bg-blue-900/50 transition"
                  >
                    Éditer
                  </Link>
                  <Link
                    href={`/outings/${outing.id}/itinerary`}
                    className="px-3 py-2 rounded-lg bg-orange-900/30 text-orange-400 text-sm hover:bg-orange-900/50 transition"
                  >
                    🗺️ Itinéraire
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(outing.id)}
                    className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm hover:bg-red-900/50 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === outing.id && (
                <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <p className="text-sm text-red-400 mb-2">Supprimer cette sortie?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(outing.id)}
                      className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Oui, supprimer
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 rounded text-sm bg-slate-700 text-white hover:bg-slate-600"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Back */}
      <Link href="/admin" className="block mt-8 text-center text-orange-400 hover:underline">
        ← Retour à l'admin
      </Link>
    </div>
  )
}
