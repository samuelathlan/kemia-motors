'use client'

import Image from 'next/image'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Official Kemia Motors Logo */}
        <div className="mb-8 w-40 h-40 flex items-center justify-center">
          <Image
            src="/kemia-logo.svg"
            alt="Kemia Motors - Ride & Share"
            width={160}
            height={160}
            priority
            className="drop-shadow-lg"
          />
        </div>

        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
            Kemia Motors
          </h1>
          <p className="text-xl mb-6" style={{ color: '#D9622B' }}>
            Ride & Share
          </p>
          <p className="text-slate-300 mb-8">
            Club moto • Sorties • Histoire • Visites
          </p>

          <div className="space-y-3">
            <a
              href="/auth/login"
              className="btn-primary block w-full"
            >
              Connexion
            </a>
            <a
              href="/invite"
              className="btn-secondary block w-full"
            >
              Vous êtes invité ?
            </a>
          </div>

          <p className="text-slate-500 text-sm mt-8">
            Application en développement • Phase 1 en cours
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
