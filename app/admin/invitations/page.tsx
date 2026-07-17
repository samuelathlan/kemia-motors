'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import Link from 'next/link'

interface InvitationCode {
  id: string
  code: string
  created_by: string
  used_by: string | null
  created_at: string
  expires_at: string | null
  accepted_at: string | null
  created_by_member?: { nom_affiche: string; pseudo: string }
  used_by_member?: { nom_affiche: string; pseudo: string }
}

export default function AdminInvitationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [invitations, setInvitations] = useState<InvitationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

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
        await fetchInvitations()
      } catch (err) {
        console.error('Error:', err)
        setError('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const fetchInvitations = async () => {
    try {
      const { data } = await supabase
        .from('invitation_codes')
        .select('*, created_by_member:members!created_by(nom_affiche, pseudo), used_by_member:members!used_by(nom_affiche, pseudo)')
        .order('created_at', { ascending: false })

      setInvitations(data || [])
    } catch (err) {
      console.error('Error fetching invitations:', err)
    }
  }

  const generateInvitation = async () => {
    if (!user) return

    setGenerating(true)
    setError('')

    try {
      // Generate a secure random code
      const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const { error: insertError } = await supabase.from('invitation_codes').insert({
        code,
        created_by: user.id,
        used_by: null,
        created_at: new Date().toISOString(),
        expires_at: null,
        accepted_at: null,
      })

      if (insertError) throw insertError

      await fetchInvitations()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kemia-motors.vercel.app'}/auth/signup?code=${code}`
    navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusBadge = (invitation: InvitationCode) => {
    if (invitation.accepted_at) {
      return <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">✅ Acceptée</span>
    }
    if (invitation.used_by) {
      return <span className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400">⏳ Utilisée</span>
    }
    return <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400">📨 Disponible</span>
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
            Invitations
          </h1>
          <p className="text-slate-400">Gère la cooptation des nouveaux membres</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800 text-red-400">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-8 p-5 rounded-lg bg-slate-900 border border-slate-700">
          <h2 className="text-lg font-bold mb-3" style={{ color: '#E8D5B0' }}>
            Générer une invitation
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Crée un nouveau lien d'invitation à partager avec un candidat
          </p>
          <button
            onClick={generateInvitation}
            disabled={generating}
            className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#D9622B' }}
          >
            {generating ? '⏳ Génération...' : '✨ Générer une invitation'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-blue-400">{invitations.filter((i) => !i.used_by).length}</p>
            <p className="text-xs text-slate-400 mt-1">Disponibles</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-yellow-400">{invitations.filter((i) => i.used_by && !i.accepted_at).length}</p>
            <p className="text-xs text-slate-400 mt-1">En attente</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
            <p className="text-2xl font-bold text-green-400">{invitations.filter((i) => i.accepted_at).length}</p>
            <p className="text-xs text-slate-400 mt-1">Acceptées</p>
          </div>
        </div>

        {/* Invitations List */}
        <div className="space-y-3">
          {invitations.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-900 text-slate-400 text-center">
              Aucune invitation générée
            </div>
          ) : (
            invitations.map((inv) => {
              const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kemia-motors.vercel.app'}/auth/signup?code=${inv.code}`
              return (
                <div key={inv.id} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-orange-400">
                          {inv.code}
                        </code>
                        {getStatusBadge(inv)}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Créée par {inv.created_by_member?.nom_affiche || 'inconnu'} • {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {inv.accepted_at && (
                        <p className="text-xs text-green-400">
                          ✅ Acceptée par {inv.used_by_member?.nom_affiche} • {new Date(inv.accepted_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {inv.used_by && !inv.accepted_at && (
                        <p className="text-xs text-yellow-400">
                          ⏳ Utilisée par {inv.used_by_member?.nom_affiche} • En attente de signature charte
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(inv.code)}
                      className="px-3 py-2 rounded-lg bg-blue-900/30 text-blue-400 text-sm hover:bg-blue-900/50 transition"
                    >
                      {copied === inv.code ? '✓ Copié' : '📋 Copier'}
                    </button>
                  </div>

                  {/* Show invitation URL */}
                  {!inv.accepted_at && (
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-2">Lien d'invitation:</p>
                      <code className="text-xs text-slate-300 break-all block">{inviteUrl}</code>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
