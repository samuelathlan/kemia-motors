'use client'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
      {/* Logo badge - simplified SVG */}
      <div className="mb-8 w-32 h-32 rounded-full bg-black border-4 border-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-2 rounded-full bg-orange-700 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg">KEMIA</div>
            <div className="text-yellow-50 text-xs">MOTORS</div>
          </div>
        </div>
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
            href="/login"
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
  )
}
