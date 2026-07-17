'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

type HomeStats = {
  totalKm: number
  totalOutings: number
  totalPlaces: number
  totalMembers: number
}

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats>({
    totalKm: 0,
    totalOutings: 0,
    totalPlaces: 0,
    totalMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: outings } = await supabase.from('outings').select('id')
        const { data: places } = await supabase.from('visited_places').select('id')
        const { data: members } = await supabase
          .from('members')
          .select('id')
          .eq('statut', 'membre_actif')
        const { data: tracks } = await supabase.from('gpx_tracks').select('distance_km')

        const totalKm = tracks?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0

        setStats({
          totalKm: Math.round(totalKm),
          totalOutings: outings?.length || 0,
          totalPlaces: places?.length || 0,
          totalMembers: members?.length || 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        {/* Hero */}
        <div
          className="relative p-6 pt-12 pb-16 text-white text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2F4A38 100%)',
          borderBottom: '3px solid #D9622B',
        }}
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/kemia-logo.svg"
            alt="Kemia Motors"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
        </div>

        <h1 className="text-5xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
          Kemia Motors
        </h1>
        <p className="text-2xl mb-4" style={{ color: '#D9622B' }}>
          Ride & Share
        </p>
        <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
          Un club moto centré sur les sorties, la bonne bouffe, l'Histoire et les visites de lieux chargés d'histoire.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-lg font-semibold transition"
            style={{ backgroundColor: '#D9622B', color: '#E8D5B0' }}
          >
            Se connecter
          </Link>
          <Link
            href="/invite"
            className="px-6 py-3 rounded-lg font-semibold border border-slate-400 hover:bg-slate-800 transition"
          >
            Rejoindre le club
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 pb-12">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#E8D5B0' }}>
          Notre aventure
        </h2>

        {loading ? (
          <div className="text-center text-slate-400">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <p className="text-3xl font-bold" style={{ color: '#D9622B' }}>
                {stats.totalKm.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400 mt-2">km parcourus</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <p className="text-3xl font-bold" style={{ color: '#D9622B' }}>
                {stats.totalOutings}
              </p>
              <p className="text-sm text-slate-400 mt-2">sorties</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <p className="text-3xl font-bold" style={{ color: '#D9622B' }}>
                {stats.totalPlaces}
              </p>
              <p className="text-sm text-slate-400 mt-2">lieux visités</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <p className="text-3xl font-bold" style={{ color: '#D9622B' }}>
                {stats.totalMembers}
              </p>
              <p className="text-sm text-slate-400 mt-2">motards</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-6" style={{ color: '#E8D5B0' }}>
            À la découverte de...
          </h3>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <p className="text-lg font-bold mb-2" style={{ color: '#D9622B' }}>
              🗺️ La Carte du Club
            </p>
            <p className="text-slate-400 mb-3">
              Explore tous les lieux visités par les motards du club. Des routes de montagne aux villages historiques.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <p className="text-lg font-bold mb-2" style={{ color: '#D9622B' }}>
              📖 Le Carnet de Voyage
            </p>
            <p className="text-slate-400 mb-3">
              Lis les histoires, anecdotes et bons souvenirs de chaque sortie. Chaque lieu raconte une histoire.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <p className="text-lg font-bold mb-2" style={{ color: '#D9622B' }}>
              📊 Les Statistiques
            </p>
            <p className="text-slate-400 mb-3">
              Vois la progression du club mois après mois. Records, tendances, et milestones.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <p className="text-lg font-bold mb-2" style={{ color: '#D9622B' }}>
              🤝 La Charte du Club
            </p>
            <p className="text-slate-400 mb-3">
              Nos valeurs fondamentales: esprit, sécurité, respect, et partage. Ce qui nous unit.
            </p>
          </div>
        </div>
      </div>

        {/* CTA Section */}
        <div
          className="p-6 text-center"
          style={{
            borderTop: '2px solid #D9622B',
            background: 'linear-gradient(to bottom, transparent, rgba(31, 41, 55, 0.5))',
          }}
        >
          <p className="text-slate-400 mb-4">Prêt à rouler avec nous?</p>
          <Link
            href="/invite"
            className="inline-block px-8 py-3 rounded-lg font-semibold transition"
            style={{ backgroundColor: '#D9622B', color: '#E8D5B0' }}
          >
            Rejoindre Kemia Motors
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
