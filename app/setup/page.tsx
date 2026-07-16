'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du setup')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8D5B0' }}>
            Kemia Motors
          </h1>
          <p style={{ color: '#D9622B' }}>Configuration initiale</p>
        </div>

        <div className="p-6 rounded-lg bg-slate-900 border border-slate-700">
          {!result && !error && (
            <>
              <h2 className="font-bold mb-4">Initialiser Supabase</h2>
              <p className="text-sm text-slate-400 mb-6">
                Ce bouton va :
              </p>
              <ul className="text-sm text-slate-400 mb-6 space-y-2">
                <li>✅ Exécuter les migrations SQL</li>
                <li>✅ Créer les buckets Storage</li>
                <li>✅ Configurer la base de données</li>
              </ul>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? '⏳ Configuration en cours...' : '🚀 Lancer le setup'}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Cela prendra quelques secondes...
              </p>
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-900/20 border border-green-700">
                <p className="text-green-400 font-semibold">✨ Setup réussi !</p>
                <p className="text-sm text-green-300 mt-2">
                  {result.message}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800">
                <p className="text-sm font-mono text-slate-300">
                  • Migrations : {result.stats.migrations} ✅<br />
                  • Buckets Storage : {result.stats.buckets} ✅
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-400">Prochaines étapes :</p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Ajouter <code className="bg-slate-800 px-1 rounded">GOOGLE_API_KEY</code> dans <code className="bg-slate-800 px-1 rounded">.env.local</code></li>
                  <li>Redémarrer <code className="bg-slate-800 px-1 rounded">npm run dev</code></li>
                  <li>Aller sur <a href="/" className="text-orange-400 hover:underline">l'accueil</a></li>
                </ol>
              </div>

              <a href="/" className="btn-primary w-full inline-block text-center">
                Aller à l'accueil
              </a>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-700">
                <p className="text-red-400 font-semibold">❌ Erreur</p>
                <p className="text-sm text-red-300 mt-2">{error}</p>
              </div>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="btn-secondary w-full"
              >
                Réessayer
              </button>

              <p className="text-xs text-slate-500">
                💡 Si ça ne fonctionne pas, exécute les migrations manuellement dans Supabase SQL Editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
