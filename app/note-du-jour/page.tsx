'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import type { Outing, OutingDay } from '@/lib/types'

export default function NoteDuJourPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [outings, setOutings] = useState<Outing[]>([])
  const [selectedOuting, setSelectedOuting] = useState<string>('')
  const [days, setDays] = useState<OutingDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchOutings = async () => {
      try {
        const { data, error: err } = await supabase
          .from('outings')
          .select('*')
          .order('date_debut', { ascending: false })

        if (err) throw err
        setOutings(data || [])

        // Auto-select current/latest outing
        if (data && data.length > 0) {
          setSelectedOuting(data[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchOutings()
  }, [])

  // Load days when outing is selected
  useEffect(() => {
    if (!selectedOuting) return

    const fetchDays = async () => {
      const { data, error: err } = await supabase
        .from('outing_days')
        .select('*')
        .eq('outing_id', selectedOuting)
        .order('numero_jour', { ascending: true })

      if (err) {
        setError(err.message)
        return
      }

      setDays(data || [])
      if (data && data.length > 0) {
        setSelectedDay(data[0].id)
      }
    }

    fetchDays()
  }, [selectedOuting])

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Veuillez écrire une note')
      return
    }

    if (!selectedDay) {
      setError('Sélectionnez un jour')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: day } = await supabase
        .from('outing_days')
        .select('notes_du_jour')
        .eq('id', selectedDay)
        .single()

      const currentNotes = day?.notes_du_jour || ''
      const timestamp = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const newNotes = currentNotes ? `${currentNotes}\n\n[${timestamp}] ${text}` : `[${timestamp}] ${text}`

      const { error: updateErr } = await supabase
        .from('outing_days')
        .update({ notes_du_jour: newNotes })
        .eq('id', selectedDay)

      if (updateErr) throw updateErr

      setSuccess(true)
      setText('')
      setTimeout(() => {
        setSuccess(false)
        router.push(`/outings/${selectedOuting}/itinerary`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      {/* Hero */}
      <div
        className="p-6 rounded-lg mb-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '2px solid #D9622B',
        }}
      >
        <p className="text-sm text-orange-400 uppercase tracking-widest mb-2">📝 Note rapide</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
          Note du jour
        </h1>
        <p className="text-slate-400">Capture tes impressions avant qu'elles s'envolent</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 text-red-400 mb-4 text-sm">{error}</div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-900/20 text-green-400 mb-4 text-sm">
          ✓ Note enregistrée! Redirection...
        </div>
      )}

      {/* Outing Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
          Sortie
        </label>
        <select
          value={selectedOuting}
          onChange={(e) => setSelectedOuting(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
        >
          {outings.map((outing) => (
            <option key={outing.id} value={outing.id}>
              {outing.titre}
            </option>
          ))}
        </select>
      </div>

      {/* Day Selection (if multi-day) */}
      {days.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
            Jour
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                Jour {day.numero_jour}
                {day.titre_du_jour ? ` - ${day.titre_du_jour}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: '#E8D5B0' }}>
          Ce qu'on retient du jour
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Les routes étaient magnifiques, on a croisé un petit village sympa..."
          maxLength={500}
          rows={6}
          className="w-full p-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2">{text.length}/500 caractères</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="flex-1 py-3 rounded-lg font-semibold transition text-white"
          style={{
            backgroundColor: saving || !text.trim() ? '#475569' : '#D9622B',
          }}
        >
          {saving ? '⏳ Enregistrement...' : '💾 Ajouter à la note'}
        </button>
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="flex-1 py-3 rounded-lg font-semibold border border-slate-700 hover:bg-slate-800 transition"
        >
          Annuler
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 rounded-lg bg-slate-900 border border-slate-800">
        <p className="text-xs text-slate-400 mb-2">💡 La note sera ajoutée aux notes du jour</p>
        <p className="text-xs text-slate-500">
          Tu peux voir la note complète dans l'itinéraire du jour, et même générer un résumé IA à partir de celle-ci.
        </p>
      </div>
    </div>
  )
}
