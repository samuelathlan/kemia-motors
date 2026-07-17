'use client'

import { useAuth } from '@/lib/auth/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'
import Link from 'next/link'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const checkAdmin = async () => {
      try {
        const { data, error: err } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (err) throw err

        if (data.role !== 'super_admin' && data.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setMember(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (error || !member) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>
  }

  if (member.role !== 'super_admin' && member.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Accès refusé</div>
  }

  const adminSections = [
    {
      title: 'Sorties',
      description: 'Créer, éditer, supprimer des sorties',
      icon: '🏍️',
      href: '/admin/outings',
      badge: 'CRUD',
    },
    {
      title: 'Itinéraires',
      description: 'Gérer les jours et notes des sorties',
      icon: '📅',
      href: '/admin/itineraries',
      badge: 'Éditer',
    },
    {
      title: 'Lieux visités',
      description: 'Créer, éditer, supprimer les lieux',
      icon: '📍',
      href: '/admin/places',
      badge: 'CRUD',
    },
    {
      title: 'Anecdotes',
      description: 'Modérer et éditer les anecdotes',
      icon: '💭',
      href: '/admin/anecdotes',
      badge: 'Modérer',
    },
    {
      title: 'Charte du club',
      description: 'Éditer les articles de la charte',
      icon: '📜',
      href: '/admin/charter',
      badge: 'Éditer',
    },
    {
      title: 'Motos',
      description: 'Gérer les motos du club',
      icon: '🏍️',
      href: '/admin/motorcycles',
      badge: 'Modérer',
    },
    {
      title: 'Membres',
      description: 'Gérer les membres et rôles',
      icon: '👥',
      href: '/admin/members',
      badge: 'Admin',
      superAdminOnly: true,
    },
    {
      title: 'Médias',
      description: 'Gérer les liens et uploads',
      icon: '📸',
      href: '/admin/media',
      badge: 'Modérer',
    },
  ]

  const visibleSections = adminSections.filter(
    (s) => !s.superAdminOnly || member.role === 'super_admin'
  )

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-950">
      {/* Hero */}
      <div
        className="p-6 rounded-lg mb-8 text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '2px solid #D9622B',
        }}
      >
        <div className="mb-2 text-3xl">⚙️</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
          Administration
        </h1>
        <p className="text-slate-400">CMS — Modifie tous les contenus du club</p>
        <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-900/30" style={{ color: '#D9622B' }}>
          {member.role === 'super_admin' ? 'Super Admin' : 'Admin Contenu'}
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {visibleSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="p-5 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-600 transition block"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{section.icon}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30" style={{ color: '#D9622B' }}>
                {section.badge}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#E8D5B0' }}>
              {section.title}
            </h3>
            <p className="text-sm text-slate-400">{section.description}</p>
            <div className="mt-3 text-xs text-orange-400">Accéder →</div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <p className="text-sm text-slate-400 mb-2">💡 CMS du club</p>
        <ul className="text-xs text-slate-500 space-y-1">
          <li>✓ Crée, édite et supprime les sorties et lieux</li>
          <li>✓ Modère les anecdotes et les commentaires</li>
          <li>✓ Mets à jour la charte du club (version)</li>
          {member.role === 'super_admin' && (
            <li>✓ Gère les membres et les rôles (super_admin only)</li>
          )}
        </ul>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="block text-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
