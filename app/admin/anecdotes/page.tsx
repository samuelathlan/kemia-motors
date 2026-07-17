'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Anecdote, Member } from '@/lib/types'
import Link from 'next/link'

interface AnecdoteWithMember extends Anecdote {
  members?: { nom_affiche: string; pseudo: string }
}

export default function AdminAnecdotesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [anecdotes, setAnecdotes] = useState<AnecdoteWithMember[]>([])
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

        const { data: anecdotesData } = await supabase
          .from('anecdotes')
          .select('*, members(nom_affiche, pseudo)')
          .order('created_at', { ascending: false })

        setAnecdotes(anecdotesData || [])
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
      const { error } = await supabase.from('anecdotes').delete().eq('id', id)

      if (error) throw error

      setAnecdotes(anecdotes.filter((a) => a.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#E8D5B0' }}>
            Anecdotes
          </h1>
          <p className="text-slate-400">Modère les anecdotes du club</p>
        </div>
      </div>

      {/* Anecdotes List */}
      <div className="space-y-3">
        {anecdotes.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
            Aucune anecdote pour l'instant
          </div>
        ) : (
          anecdotes.map((anecdote) => (
            <div key={anecdote.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-2">
                    Par <span className="text-orange-400">@{anecdote.members?.pseudo || 'inconnu'}</span>
                  </p>
                  <p className="text-slate-200 mb-3 line-clamp-3">{anecdote.texte}</p>
                  <div className="text-xs text-slate-500">
                    {new Date(anecdote.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(anecdote.id)}
                    className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm hover:bg-red-900/50 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {deleteConfirm === anecdote.id && (
                <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <p className="text-sm text-red-400 mb-2">Supprimer cette anecdote?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(anecdote.id)}
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
