'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import Link from 'next/link'

export default function NewPlacePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    latitude: '',
    longitude: '',
    date_visite: '',
    type_lieu: 'historique',
    pays: '',
    region: '',
    lien_google_maps: '',
    lien_instagram: '',
    lien_google_drive: '',
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

    setSaving(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('visited_places').insert({
        nom: formData.nom,
        description: formData.description || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        date_visite: formData.date_visite || null,
        type_lieu: formData.type_lieu,
        pays: formData.pays,
        region: formData.region || null,
        lien_google_maps: formData.lien_google_maps || null,
        lien_instagram: formData.lien_instagram || null,
        lien_google_drive: formData.lien_google_drive || null,
      })

      if (insertError) throw insertError

      router.push('/admin/places')
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
          <Link href="/admin/places" className="text-orange-400 hover:underline text-sm">
            ← Retour aux lieux
          </Link>
          <h1 className="text-3xl font-bold mt-3" style={{ color: '#E8D5B0' }}>
            Nouveau lieu
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
              Nom du lieu
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="Ex: Mont Blanc, Strasbourg"
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
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="Description du lieu..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
                placeholder="45.875"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
                placeholder="6.644"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Pays
              </label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
                placeholder="France"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Région (optionnelle)
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
                placeholder="Haute-Savoie"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Type de lieu
              </label>
              <select
                name="type_lieu"
                value={formData.type_lieu}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
              >
                <option value="historique">Historique</option>
                <option value="culinaire">Culinaire</option>
                <option value="nature">Nature</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
                Date de visite (optionnelle)
              </label>
              <input
                type="date"
                name="date_visite"
                value={formData.date_visite}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Lien Google Maps (optionnel)
            </label>
            <input
              type="url"
              name="lien_google_maps"
              value={formData.lien_google_maps}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Lien Instagram (optionnel)
            </label>
            <input
              type="url"
              name="lien_instagram"
              value={formData.lien_instagram}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
              Lien Google Drive (optionnel)
            </label>
            <input
              type="url"
              name="lien_google_drive"
              value={formData.lien_google_drive}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-600"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#D9622B' }}
            >
              {saving ? 'Création...' : 'Créer le lieu'}
            </button>
            <Link
              href="/admin/places"
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
