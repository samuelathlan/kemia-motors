'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Motorcycle, Member } from '@/lib/types'
import Link from 'next/link'

interface MotorcycleWithMember extends Motorcycle {
  members?: { nom_affiche: string; pseudo: string }
}

export default function AdminMotorcyclesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [motorcycles, setMotorcycles] = useState<MotorcycleWithMember[]>([])
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

        const { data: bikesData } = await supabase
          .from('motorcycles')
          .select('*, members(nom_affiche, pseudo)')
          .order('created_at', { ascending: false })

        setMotorcycles(bikesData || [])
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
      const { error } = await supabase.from('motorcycles').delete().eq('id', id)

      if (error) throw error

      setMotorcycles(motorcycles.filter((m) => m.id !== id))
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
          Motos du club
        </h1>
        <p className="text-slate-400">Gère les motos des membres</p>
      </div>

      {/* Motorcycles List */}
      <div className="space-y-3">
        {motorcycles.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
            Aucune moto enregistrée
          </div>
        ) : (
          motorcycles.map((moto) => (
            <div key={moto.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#E8D5B0' }}>
                    {moto.surnom ? `${moto.surnom}` : `${moto.marque} ${moto.modele}`}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {moto.marque} {moto.modele} ({moto.annee})
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📍 {moto.members?.nom_affiche || 'inconnu'}</span>
                    <span>🛣️ {moto.kilometrage_total} km</span>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(moto.id)}
                  className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm hover:bg-red-900/50 transition"
                >
                  Supprimer
                </button>
              </div>

              {deleteConfirm === moto.id && (
                <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <p className="text-sm text-red-400 mb-2">Supprimer cette moto?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(moto.id)}
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
