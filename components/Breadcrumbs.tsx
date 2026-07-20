'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Human-readable labels for known path segments
const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  outings: 'Sorties',
  admin: 'Administration',
  overview: "Vue d'ensemble",
  itinerary: 'Itinéraire',
  new: 'Nouveau',
  motorcycles: 'Motos',
  places: 'Lieux',
  itineraries: 'Itinéraires',
  anecdotes: 'Anecdotes',
  media: 'Médias',
  members: 'Membres',
  invitations: 'Invitations',
  charter: 'Charte',
  map: 'Carte',
  'map-regions': 'Carte',
  timeline: 'Carnet de voyage',
  stats: 'Statistiques',
  search: 'Recherche',
  import: 'Importer',
  'note-du-jour': 'Note du jour',
  'emergency-info': 'Infos urgence',
}

// Segments that are dynamic ids (uuid-like or long) get a generic label
function labelFor(segment: string): string {
  if (LABELS[segment]) return LABELS[segment]
  // uuid or long id -> "Détail"
  if (/^[0-9a-f]{8}-/.test(segment) || segment.length > 20) return 'Détail'
  return decodeURIComponent(segment)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Pages where we do not want the top bar (public / auth)
const HIDDEN_PREFIXES = ['/auth', '/invite']

export default function Breadcrumbs() {
  const pathname = usePathname()

  if (!pathname || pathname === '/') return null
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))

  return (
    <nav
      aria-label="Fil d'ariane"
      className="sticky top-0 z-40 w-full border-b bg-slate-950/90 backdrop-blur"
      style={{ borderColor: '#1e293b' }}
    >
      <div className="max-w-5xl mx-auto flex items-center gap-1 px-4 py-3 text-sm overflow-x-auto whitespace-nowrap">
        <Link href="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-orange-400 transition flex-shrink-0">
          🏍️ <span className="sr-only">Accueil</span>
        </Link>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={c.href} className="flex items-center gap-1 flex-shrink-0">
              <span className="text-slate-600">/</span>
              {isLast ? (
                <span className="font-semibold" style={{ color: '#E8D5B0' }}>{c.label}</span>
              ) : (
                <Link href={c.href} className="text-slate-400 hover:text-orange-400 transition">
                  {c.label}
                </Link>
              )}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
