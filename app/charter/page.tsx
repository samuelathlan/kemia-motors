'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { ClubCharter, Member } from '@/lib/types'

export default function CharterPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<ClubCharter[]>([])
  const [member, setMember] = useState<Member | null>(null)
  const [acceptances, setAcceptances] = useState<Record<string, boolean>>({})
  const [loading_data, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch member
        const { data: memberData, error: memberErr } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (memberErr) throw memberErr
        setMember(memberData)

        // Fetch charter articles
        const { data: charterData, error: charterErr } = await supabase
          .from('club_charter')
          .select('*')
          .order('ordre_affichage', { ascending: true })

        if (charterErr) throw charterErr
        setArticles(charterData)

        // Fetch member's acceptances
        const { data: acceptanceData, error: acceptanceErr } = await supabase
          .from('charter_acceptances')
          .select('*')
          .eq('member_id', user.id)

        if (acceptanceErr) throw acceptanceErr

        const acceptanceMap: Record<string, boolean> = {}
        acceptanceData.forEach((a) => {
          acceptanceMap[a.article_id] = a.accepted_at !== null
        })
        setAcceptances(acceptanceMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, loading, router])

  const handleToggleAcceptance = (articleId: string) => {
    setAcceptances((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !member) return

    // Check all articles are accepted
    const allAccepted = articles.every((a) => acceptances[a.id])
    if (!allAccepted) {
      setError('Vous devez accepter tous les articles de la charte')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Upsert acceptances
      const acceptanceData = articles.map((article) => ({
        article_id: article.id,
        member_id: user.id,
        version_acceptee: article.version,
        accepted_at: new Date().toISOString(),
      }))

      const { error: upsertErr } = await supabase
        .from('charter_acceptances')
        .upsert(acceptanceData, { onConflict: 'article_id,member_id' })

      if (upsertErr) throw upsertErr

      // Update member status
      const { error: updateErr } = await supabase
        .from('members')
        .update({
          statut: 'membre_actif',
          date_acceptation_charte: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateErr) throw updateErr

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loading_data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement de la charte...</p>
      </div>
    )
  }

  const allAccepted = articles.length > 0 && articles.every((a) => acceptances[a.id])

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
          Charte du Club
        </h1>
        <p className="text-slate-400">
          {member?.statut === 'membre_actif'
            ? 'Charte acceptée ✓'
            : 'Acceptez notre charte pour rejoindre le club'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Articles */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 rounded-lg border border-slate-700 bg-slate-900/50"
          >
            <div className="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                id={article.id}
                checked={acceptances[article.id] || false}
                onChange={() => handleToggleAcceptance(article.id)}
                disabled={member?.statut === 'membre_actif'}
                className="mt-1 w-5 h-5 accent-orange-600 cursor-pointer"
              />
              <div className="flex-1">
                <label
                  htmlFor={article.id}
                  className="font-semibold cursor-pointer hover:text-orange-400 transition"
                >
                  {article.titre_article}
                </label>
                <p className="text-sm text-slate-400 mt-2">
                  {article.texte_complet}
                </p>
              </div>
            </div>
          </div>
        ))}

        {member?.statut !== 'membre_actif' && (
          <button
            type="submit"
            disabled={!allAccepted || submitting}
            className="btn-primary w-full mt-6"
          >
            {submitting ? 'Validation en cours...' : 'Confirmer mon acceptation'}
          </button>
        )}
      </form>
    </div>
  )
}
