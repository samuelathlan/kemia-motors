'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { ClubCharter, Member } from '@/lib/types'
import Link from 'next/link'

export default function AdminCharterPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<ClubCharter[]>([])
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    titre_article: '',
    texte_complet: '',
  })

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

        setMember(memberData)

        const { data: charterData } = await supabase
          .from('club_charter')
          .select('*')
          .order('ordre_affichage', { ascending: true })

        setArticles(charterData || [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const handleEdit = (article: ClubCharter) => {
    setEditingId(article.id)
    setEditForm({
      titre_article: article.titre_article,
      texte_complet: article.texte_complet,
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('club_charter')
        .update({
          titre_article: editForm.titre_article,
          texte_complet: editForm.texte_complet,
        })
        .eq('id', id)

      if (error) throw error

      const updated = articles.map((a) =>
        a.id === id
          ? {
              ...a,
              titre_article: editForm.titre_article,
              texte_complet: editForm.texte_complet,
            }
          : a
      )
      setArticles(updated)
      setEditingId(null)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-orange-400 hover:underline text-sm">
            ← Retour à l'admin
          </Link>
          <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
            Charte du Club
          </h1>
          <p className="text-slate-400 mt-1">Modifie les articles de la charte</p>
        </div>

        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="p-5 rounded-lg bg-slate-900 border border-slate-700">
              {editingId === article.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.titre_article}
                    onChange={(e) => setEditForm({ ...editForm, titre_article: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-orange-600"
                    placeholder="Titre"
                  />
                  <textarea
                    value={editForm.texte_complet}
                    onChange={(e) => setEditForm({ ...editForm, texte_complet: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-orange-600"
                    placeholder="Contenu"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(article.id)}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg font-semibold text-white transition disabled:opacity-50"
                      style={{ backgroundColor: '#D9622B' }}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold" style={{ color: '#E8D5B0' }}>
                      {article.titre_article}
                    </h3>
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-3 py-1 rounded-lg bg-blue-900/30 text-blue-400 text-sm hover:bg-blue-900/50 transition"
                    >
                      Éditer
                    </button>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{article.texte_complet}</p>
                  <p className="text-xs text-slate-500 mt-3">v{article.version}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
