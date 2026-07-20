'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import {
  getMotorcycles,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  uploadMotorcyclePhoto,
  deleteMotorcyclePhoto,
  getPhotoURL,
} from '@/lib/motorcycles/service'
import { supabase } from '@/lib/supabase/client'
import type { Motorcycle, MotorcyclePhoto } from '@/lib/types'

type MotoWithPhotos = Motorcycle & { motorcycle_photos: MotorcyclePhoto[]; member?: { pseudo: string; nom_affiche: string } | null }

const EMPTY = { marque: '', modele: '', annee: new Date().getFullYear(), surnom: '', kilometrage_total: 0 }

export default function MotorcyclesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [motos, setMotos] = useState<MotoWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    const data = await getMotorcycles()
    const withMember = await Promise.all(
      data.map(async (m) => {
        const { data: mem } = await supabase.from('members').select('pseudo, nom_affiche').eq('id', m.member_id).maybeSingle()
        return { ...m, member: mem }
      })
    )
    setMotos(withMember)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    load()
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, load])

  const addMoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setBusy('add')
    setError('')
    try {
      await createMotorcycle(user.id, {
        member_id: user.id,
        marque: form.marque,
        modele: form.modele,
        annee: Number(form.annee),
        surnom: form.surnom || null,
        kilometrage_total: Number(form.kilometrage_total) || 0,
      })
      setForm({ ...EMPTY })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur ajout moto')
    } finally {
      setBusy(null)
    }
  }

  const saveKm = async (m: MotoWithPhotos, km: number) => {
    setBusy(`km-${m.id}`)
    try {
      await updateMotorcycle(m.id, { kilometrage_total: km })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setBusy(null)
    }
  }

  const removeMoto = async (m: MotoWithPhotos) => {
    setBusy(`del-${m.id}`)
    try {
      for (const p of m.motorcycle_photos) {
        await deleteMotorcyclePhoto(m.id, p.id, p.storage_path).catch(() => {})
      }
      await deleteMotorcycle(m.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    } finally {
      setBusy(null)
    }
  }

  const addPhoto = async (m: MotoWithPhotos, file: File) => {
    setBusy(`photo-${m.id}`)
    setError('')
    try {
      await uploadMotorcyclePhoto(m.id, file)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload photo')
    } finally {
      setBusy(null)
    }
  }

  const removePhoto = async (m: MotoWithPhotos, photo: MotorcyclePhoto) => {
    setBusy(`delphoto-${photo.id}`)
    try {
      await deleteMotorcyclePhoto(m.id, photo.id, photo.storage_path)
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950">Chargement...</div>

  const myMotos = motos.filter((m) => m.member_id === user?.id)
  const otherMotos = motos.filter((m) => m.member_id !== user?.id)

  const renderMoto = (m: MotoWithPhotos, mine: boolean) => (
    <div key={m.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold">{m.marque} {m.modele}</h3>
          {m.surnom && <p className="text-sm" style={{ color: '#D9622B' }}>« {m.surnom} »</p>}
          {!mine && <p className="text-xs text-slate-400 mt-1">📍 {m.member?.nom_affiche || 'Inconnu'}</p>}
        </div>
        <span className="text-sm text-slate-400">{m.annee}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {mine ? (
          <>
            <input
              type="number"
              defaultValue={m.kilometrage_total}
              onBlur={(e) => { const v = Number(e.target.value); if (v !== m.kilometrage_total) saveKm(m, v) }}
              className="w-28 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
            />
            <span className="text-xs text-slate-400">km {busy === `km-${m.id}` ? '…' : ''}</span>
          </>
        ) : (
          <p className="text-sm text-slate-300">{m.kilometrage_total} km</p>
        )}
      </div>

      {/* Photos */}
      <div className="grid grid-cols-3 gap-2">
        {m.motorcycle_photos.map((p) => (
          <div key={p.id} className="relative aspect-square rounded overflow-hidden bg-slate-800 group">
            <img src={getPhotoURL(p.storage_path)} alt={`${m.marque} ${m.modele}`} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            {mine && (
              <button onClick={() => removePhoto(m, p)} disabled={busy === `delphoto-${p.id}`}
                className="absolute top-1 right-1 bg-black/60 text-red-400 rounded-full w-6 h-6 text-xs">×</button>
            )}
          </div>
        ))}
        {mine && (
          <label className="aspect-square rounded border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer text-slate-500 hover:border-orange-600 text-sm">
            {busy === `photo-${m.id}` ? '…' : '+ Photo'}
            <input type="file" accept="image/*" className="hidden" disabled={busy === `photo-${m.id}`}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(m, f); e.target.value = '' }} />
          </label>
        )}
      </div>

      {mine && (
        <button onClick={() => removeMoto(m)} disabled={busy === `del-${m.id}`}
          className="mt-3 text-xs text-red-400 hover:underline">Supprimer cette moto</button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>Les Motos du Club</h1>

        {error && <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 mb-6 text-sm">{error}</div>}

        {/* My motos */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold" style={{ color: '#D9622B' }}>Mes motos</h2>
            <button onClick={() => setShowForm((s) => !s)} className="text-sm text-orange-400 hover:underline">
              {showForm ? 'Annuler' : '+ Ajouter une moto'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addMoto} className="mb-4 p-4 rounded-lg border border-slate-700 bg-slate-900/40 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Marque" value={form.marque}
                  onChange={(e) => setForm({ ...form, marque: e.target.value })}
                  className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" />
                <input required placeholder="Modèle" value={form.modele}
                  onChange={(e) => setForm({ ...form, modele: e.target.value })}
                  className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" />
                <input type="number" placeholder="Année" value={form.annee}
                  onChange={(e) => setForm({ ...form, annee: Number(e.target.value) })}
                  className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" />
                <input type="number" placeholder="Kilométrage" value={form.kilometrage_total}
                  onChange={(e) => setForm({ ...form, kilometrage_total: Number(e.target.value) })}
                  className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" />
              </div>
              <input placeholder="Surnom (optionnel)" value={form.surnom}
                onChange={(e) => setForm({ ...form, surnom: e.target.value })}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" />
              <button type="submit" disabled={busy === 'add'}
                className="w-full py-2 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#D9622B' }}>
                {busy === 'add' ? 'Ajout...' : 'Ajouter ma moto'}
              </button>
            </form>
          )}

          {myMotos.length === 0 && !showForm && <p className="text-slate-500 text-sm">Tu n&apos;as pas encore ajouté de moto.</p>}
          <div className="space-y-4">{myMotos.map((m) => renderMoto(m, true))}</div>
        </div>

        {/* Club motos */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-slate-300">Les motos des autres membres</h2>
          {otherMotos.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune autre moto pour le moment.</p>
          ) : (
            <div className="space-y-4">{otherMotos.map((m) => renderMoto(m, false))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
