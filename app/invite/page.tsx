'use client'

import Link from 'next/link'

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏍️</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
            Kemia Motors
          </h1>
          <p className="text-xl mb-4" style={{ color: '#D9622B' }}>
            Ride & Share
          </p>
        </div>

        {/* Content */}
        <div className="p-6 rounded-lg bg-slate-900 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#E8D5B0' }}>
            Rejoindre le club
          </h2>

          <div className="space-y-4 text-sm text-slate-300 mb-6">
            <p>
              Kemia Motors est un club moto privé. Pour rejoindre, vous devez être invité par un
              membre existant.
            </p>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#1a1a1a', borderLeft: '3px solid #D9622B' }}
            >
              <p className="font-semibold mb-2">Comment rejoindre?</p>
              <ul className="space-y-2 text-xs">
                <li>✓ Demande à un membre du club un lien d'invitation</li>
                <li>✓ Ouvre le lien (il contient un code d'invitation)</li>
                <li>✓ Crée ton compte et accepte la charte</li>
                <li>✓ Prêt à rouler!</li>
              </ul>
            </div>

            <p className="text-xs text-slate-400">
              Si tu as un lien d'invitation, la page de création de compte s'ouvrira automatiquement
              quand tu cliqueras sur le lien.
            </p>
          </div>

          {/* Info Section */}
          <div className="p-3 rounded-lg bg-slate-800 mb-6">
            <p className="text-xs text-slate-500 mb-2">💡 Tu as un lien d'invitation?</p>
            <p className="text-xs text-orange-400">
              Clique sur le lien reçu pour t'inscrire directement. Pas besoin de revenir ici!
            </p>
          </div>

          {/* Call to Action */}
          <p className="text-center text-sm text-slate-500 mb-4">
            Pas de lien? Contacte un admin du club.
          </p>
        </div>

        {/* Back Button */}
        <Link href="/" className="block text-center text-orange-400 hover:underline text-sm">
          ← Retour à l'accueil
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          © 2026 Kemia Motors • Ride & Share
        </p>
      </div>
    </div>
  )
}
