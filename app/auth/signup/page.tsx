'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code')

  const [pseudo, setPseudo] = useState('')
  const [nomAffiche, setNomAffiche] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!inviteCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#E8D5B0' }}>
            Kemia Motors
          </h1>
          <p className="text-red-400 mb-4">
            Lien d'invitation invalide ou expiré
          </p>
          <a href="/auth/login" className="btn-primary inline-block">
            Retour à la connexion
          </a>
        </div>
      </div>
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (!authData.user) throw new Error('Échec de création du compte')

      // Create member profile
      const { error: insertError } = await supabase
        .from('members')
        .insert({
          id: authData.user.id,
          pseudo,
          nom_affiche: nomAffiche,
          statut: 'en_attente_acceptation_charte',
          date_inscription: new Date().toISOString(),
        })

      if (insertError) throw insertError

      // Redirect to charter acceptance
      router.push('/charter')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
            Kemia Motors
          </h1>
          <p style={{ color: '#D9622B' }}>Inscription</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none"
              placeholder="captain_max"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Nom affiché</label>
            <input
              type="text"
              value={nomAffiche}
              onChange={(e) => setNomAffiche(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none"
              placeholder="Max"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none"
              placeholder="email@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-orange-600 focus:outline-none"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Déjà inscrit ?{' '}
            <a href="/auth/login" className="text-orange-600 hover:text-orange-500">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SignupContent />
    </Suspense>
  )
}
