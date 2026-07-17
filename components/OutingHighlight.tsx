'use client'

import type { Outing } from '@/lib/types'
import Link from 'next/link'

type OutingHighlightProps = {
  outing: Outing
  label: string
  icon: string
}

export function OutingHighlight({ outing, label, icon }: OutingHighlightProps) {
  const date = new Date(outing.date_debut)
  const isMultiDay = new Date(outing.date_fin) > date

  return (
    <div
      className="p-5 rounded-lg border-l-4"
      style={{ backgroundColor: '#1a1a1a', borderLeftColor: '#D9622B' }}
    >
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{icon} {label}</p>
      <h3 className="text-lg font-bold mb-3" style={{ color: '#E8D5B0' }}>
        {outing.titre}
      </h3>
      {outing.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{outing.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>📅</span>
          <span>
            {date.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </span>
          {isMultiDay && (
            <>
              <span>→</span>
              <span>
                {new Date(outing.date_fin).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </>
          )}
        </div>
        {outing.type === 'roadtrip_multi_jours' && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30" style={{ color: '#D9622B' }}>
            Roadtrip
          </span>
        )}
      </div>
      <Link href={`/outings/${outing.id}`} className="mt-3 inline-block text-sm text-orange-400 hover:underline">
        Voir plus →
      </Link>
    </div>
  )
}
