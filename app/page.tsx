'use client'

import Image from 'next/image'
import Footer from '@/components/Footer'

export default function Home() {
  const values = [
    { title: 'Partage', icon: '🤝' },
    { title: 'Paysages', icon: '🏔️' },
    { title: 'Histoire', icon: '📖' },
    { title: 'Bienveillance', icon: '💚' },
    { title: 'Valeurs juives', icon: '✡️' },
    { title: 'Même rythme', icon: '⏳' },
    { title: 'Repas', icon: '🍽️' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 md:space-y-12">

        {/* Hero Section */}
        <div className="w-full max-w-4xl px-2">
          <div className="mb-6 md:mb-12 w-32 h-32 md:w-48 md:h-48 flex items-center justify-center mx-auto">
            <Image
              src="/kemia-logo.svg"
              alt="Kemia Motors"
              width={192}
              height={192}
              priority
              className="drop-shadow-lg w-full h-full"
            />
          </div>

          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                <span style={{ color: '#D9622B' }}>RIDE</span>
                <span className="text-slate-400 mx-1 md:mx-2">•</span>
                <span style={{ color: '#E8D5B0' }}>SHARE</span>
                <span className="text-slate-400 mx-1 md:mx-2">•</span>
                <span style={{ color: '#2F4A38' }}>CARE</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-300 mt-2 md:mt-4">Club de moto feuj</p>
            </div>

            <div className="pt-6 md:pt-8">
              <p className="text-slate-400 text-xs md:text-sm uppercase tracking-widest mb-6 md:mb-8">Nos valeurs</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-8 md:mb-12">
                {values.map((val) => (
                  <div
                    key={val.title}
                    className="p-4 rounded-lg border border-slate-700 bg-slate-900/30 hover:border-orange-600/50 transition"
                  >
                    <p className="text-2xl mb-2">{val.icon}</p>
                    <p className="text-xs text-slate-300 font-medium">{val.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-slate-800 w-full">
              <p className="text-orange-400 text-xs md:text-sm font-semibold mb-6 md:mb-8">
                Entrée sur cooptation uniquement
              </p>

              <div className="space-y-3 max-w-sm mx-auto px-2">
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
                  Vous êtes parrainé ?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
