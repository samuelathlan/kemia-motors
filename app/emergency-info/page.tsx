'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface EmergencyInfo {
  id: string
  member_id: string
  contact_urgence_nom: string | null
  contact_urgence_telephone: string | null
  info_assurance: string | null
  lien_tribusante: string | null
  created_at: string
  updated_at: string
}

export default function EmergencyInfoPage() {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    contact_urgence_nom: '',
    contact_urgence_telephone: '',
    info_assurance: '',
    lien_tribusante: ''
  })

  useEffect(() => {
    loadEmergencyInfo()
  }, [])

  async function loadEmergencyInfo() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error: err } = await supabase
        .from('member_emergency_info')
        .select()
        .eq('member_id', user.id)
        .single()

      if (err && err.code !== 'PGRST116') throw err

      if (data) {
        setEmergencyInfo(data)
        setFormData({
          contact_urgence_nom: data.contact_urgence_nom || '',
          contact_urgence_telephone: data.contact_urgence_telephone || '',
          info_assurance: data.info_assurance || '',
          lien_tribusante: data.lien_tribusante || ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      if (emergencyInfo) {
        const { error: err } = await supabase
          .from('member_emergency_info')
          .update(formData)
          .eq('id', emergencyInfo.id)

        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('member_emergency_info')
          .insert({
            member_id: user.id,
            ...formData
          })

        if (err) throw err
      }

      setSuccess('Informations d\'urgence sauvegardées')
      setEditing(false)
      await loadEmergencyInfo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Chargement...</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-orange-600 hover:text-orange-500">
          ← Retour au dashboard
        </Link>
      </div>

      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
          Fiche d'Urgence
        </h1>
        <p className="text-slate-400 mb-6">
          Informations de contact et d'assurance en cas d'urgence
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 text-red-400 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-900/20 text-green-400 mb-4">
            {success}
          </div>
        )}

        {!editing ? (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded p-4">
              <h2 className="font-semibold mb-2" style={{ color: '#D9622B' }}>
                Contact d'Urgence
              </h2>
              <p className="text-slate-300">
                {formData.contact_urgence_nom || 'Non renseigné'}
              </p>
              <p className="text-slate-300">
                {formData.contact_urgence_telephone || 'Non renseigné'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded p-4">
              <h2 className="font-semibold mb-2" style={{ color: '#D9622B' }}>
                Assurance Moto
              </h2>
              <p className="text-slate-300">
                {formData.info_assurance || 'Non renseignée'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded p-4">
              <h2 className="font-semibold mb-2" style={{ color: '#D9622B' }}>
                Tribusante / Assistance
              </h2>
              <p className="text-slate-300">
                {formData.lien_tribusante ? (
                  <a href={formData.lien_tribusante} className="text-orange-600 hover:text-orange-500">
                    Accès à Tribusante
                  </a>
                ) : (
                  'Non renseignée'
                )}
              </p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="btn-primary w-full"
            >
              Modifier
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Nom du contact d'urgence</label>
              <input
                type="text"
                value={formData.contact_urgence_nom}
                onChange={(e) =>
                  setFormData({...formData, contact_urgence_nom: e.target.value})
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none text-white"
                placeholder="ex: Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Téléphone d'urgence</label>
              <input
                type="tel"
                value={formData.contact_urgence_telephone}
                onChange={(e) =>
                  setFormData({...formData, contact_urgence_telephone: e.target.value})
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none text-white"
                placeholder="ex: +33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Informations d'assurance</label>
              <textarea
                value={formData.info_assurance}
                onChange={(e) =>
                  setFormData({...formData, info_assurance: e.target.value})
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none text-white"
                placeholder="ex: Numéro de contrat, assureur, etc."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Lien Tribusante / Assistance</label>
              <input
                type="url"
                value={formData.lien_tribusante}
                onChange={(e) =>
                  setFormData({...formData, lien_tribusante: e.target.value})
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none text-white"
                placeholder="https://tribusante.com/..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
