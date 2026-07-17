'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import Link from 'next/link'

export default function NewOutingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    type: 'sortie_simple',
  })

  useEffect(() => {
    if (!user) return

    const fetchMember = async () => {
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
      } catch (err) {
        console.error('Error:', err)
        setError('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('outings').insert({
        titre: formData.titre,
        description: formData.description,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        type: formData.type,
        cree_par: user.id,
      })

      if (insertError) throw insertError

      router.push('/admin/outings')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/outings" className="text-orange-400 hover:underline text-sm">
            ← Retour aux sorties
          </Link>
          <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
            Nouvelle sortie
          </h1>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Titre
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="Ex: Week-end Alsace"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="Décris la sortie..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Date de début
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Date de fin (optionnelle)
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Type de sortie
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
            >
              <option value="sortie_simple">Sortie simple</option>
              <option value="roadtrip_multi_jours">Roadtrip multi-jours</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#D9622B' }}
            >
              {saving ? 'Création...' : 'Créer la sortie'}
            </button>
            <Link
              href="/admin/outings"
              className="flex-1 py-3 rounded-lg font-semibold text-center border border-slate-700 hover:bg-slate-800 transition"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
