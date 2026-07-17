'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { VisitedPlace, Member } from '@/lib/types'
import Link from 'next/link'

export default function AdminPlacesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [places, setPlaces] = useState<VisitedPlace[]>([])
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

        const { data: placesData } = await supabase
          .from('visited_places')
          .select('*')
          .order('date_visite', { ascending: false })

        setPlaces(placesData || [])
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
      const { error } = await supabase.from('visited_places').delete().eq('id', id)

      if (error) throw error

      setPlaces(places.filter((p) => p.id !== id))
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
            Lieux visités
          </h1>
          <p className="text-slate-400">Gère les lieux du club</p>
        </div>
        <Link
          href="/admin/places/new"
          className="px-4 py-2 rounded-lg font-semibold text-white transition"
          style={{ backgroundColor: '#D9622B' }}
        >
          + Nouveau lieu
        </Link>
      </div>

      {/* Places List */}
      <div className="space-y-3">
        {places.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
            Aucun lieu. Ajoute-en un!
          </div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#E8D5B0' }}>
                    {place.nom}
                  </h3>
                  {place.description && (
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{place.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📍</span>
                    <span>
                      {place.region && `${place.region}, `}
                      {place.pays}
                    </span>
                    {place.type_lieu && (
                      <>
                        <span className="ml-2 px-2 py-1 rounded-full bg-slate-800">
                          {place.type_lieu}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/places/${place.id}`}
                    className="px-3 py-2 rounded-lg bg-blue-900/30 text-blue-400 text-sm hover:bg-blue-900/50 transition"
                  >
                    Éditer
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(place.id)}
                    className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm hover:bg-red-900/50 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {deleteConfirm === place.id && (
                <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <p className="text-sm text-red-400 mb-2">Supprimer ce lieu?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(place.id)}
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
