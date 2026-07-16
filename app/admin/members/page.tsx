'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'

export default function AdminMembersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    if (!user) return

    const checkAdminAndFetch = async () => {
      try {
        // Check if user is admin
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!member || !['admin', 'super_admin'].includes(member.role)) {
          router.push('/dashboard')
          return
        }

        setCurrentMember(member)

        // Fetch all members
        const { data: allMembers, error: err } = await supabase
          .from('members')
          .select('*')
          .order('date_inscription', { ascending: false })

        if (err) throw err
        setMembers(allMembers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetch()
  }, [user, router])

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!inviteEmail) {
      setError('Entrez un email')
      return
    }

    try {
      // Generate a simple invite code (in production, you'd use a secure method)
      const inviteCode = Math.random().toString(36).substring(2, 15)
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?code=${inviteCode}`

      // In production, you'd save this code to a database and send an email
      setInviteLink(inviteUrl)
      setInviteEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    }
  }

  if (loading) {
    return <div className="min-h-screen p-4">Chargement...</div>
  }

  if (!currentMember) {
    return <div className="min-h-screen p-4">Accès non autorisé</div>
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
        Gestion des Membres
      </h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Generate Invite */}
      <div className="mb-8 p-4 rounded-lg bg-slate-900 border border-slate-700">
        <h2 className="font-bold mb-4" style={{ color: '#D9622B' }}>
          Générer un lien d'invitation
        </h2>

        <form onSubmit={handleGenerateInvite} className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-orange-600 focus:outline-none"
          />
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Générer un lien
          </button>
        </form>

        {inviteLink && (
          <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-700">
            <p className="text-sm text-green-400 mb-2">Lien d'invitation généré :</p>
            <code className="text-xs text-slate-300 break-all bg-slate-800 p-2 rounded block mb-2">
              {inviteLink}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
              }}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Copier le lien
            </button>
          </div>
        )}
      </div>

      {/* Members List */}
      <div>
        <h2 className="font-bold mb-4" style={{ color: '#D9622B' }}>
          Tous les membres ({members.length})
        </h2>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-lg bg-slate-900 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{member.nom_affiche}</p>
                  <p className="text-sm text-slate-400">@{member.pseudo}</p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: member.statut === 'membre_actif' ? '#2F4A38' : '#4a3728',
                      color: '#E8D5B0',
                    }}
                  >
                    {member.statut}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
