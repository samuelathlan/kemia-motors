'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Profil', icon: '👤' },
  { href: '/outings', label: 'Sorties', icon: '🏍️' },
  { href: '/map-regions', label: 'Carte', icon: '🗺️' },
  { href: '/timeline', label: 'Carnet', icon: '📖' },
  { href: '/search', label: 'Chercher', icon: '🔍' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800">
      <div className="grid grid-cols-5 gap-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-3 px-2 text-center transition border-t-2 ${
                isActive
                  ? 'border-orange-600 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs font-semibold">{item.label}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
