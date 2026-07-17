'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { OutingDay, Member, Outing } from '@/lib/types'
import Link from 'next/link'

interface OutingDayWithOuting extends OutingDay {
  outings?: { titre: string }
}

export default function AdminItinerariesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [days, setDays] = useState<OutingDayWithOuting[]>([])
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
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

        const { data: daysData } = await supabase
          .from('outing_days')
          .select('*, outings(titre)')
          .order('date', { ascending: false })

        setDays(daysData || [])
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
      const { error } = await supabase.from('outing_days').delete().eq('id', id)

      if (error) throw error

      setDays(days.filter((d) => d.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="mb-6">
        <Link href="/admin" className="text-orange-400 hover:underline text-sm">
          ← Retour à l'admin
        </Link>
        <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
          Itinéraires
        </h1>
        <p className="text-slate-400">Gère les jours des sorties multi-jour</p>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {days.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
            Aucun jour d'itinéraire
          </div>
        ) : (
          days.map((day) => (
            <div key={day.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#E8D5B0' }}>
                    {day.titre_du_jour}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    📅 {new Date(day.date).toLocaleDateString('fr-FR')} • Jour {day.numero_jour}
                  </p>
                  <p className="text-xs text-slate-500">
                    Sortie: {day.outings?.titre || 'inconnue'}
                  </p>
                  {day.hebergement_nom && (
                    <p className="text-xs text-orange-400 mt-1">🏨 {day.hebergement_nom}</p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteConfirm(day.id)}
                  className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm hover:bg-red-900/50 transition"
                >
                  Supprimer
                </button>
              </div>

              {deleteConfirm === day.id && (
                <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <p className="text-sm text-red-400 mb-2">Supprimer ce jour?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(day.id)}
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
