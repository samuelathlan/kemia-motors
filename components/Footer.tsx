import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      className="w-full py-4 px-4 border-t md:py-5 md:px-6"
      style={{
        borderColor: '#D9622B',
        backgroundColor: '#0f172a',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition flex-shrink-0">
            <Image
              src="/kemia-logo.svg"
              alt="Kemia Motors"
              width={32}
              height={32}
              className="drop-shadow-lg"
            />
          </Link>

          {/* Links */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-slate-400 hover:text-orange-400 transition text-xs whitespace-nowrap">
              Connexion
            </Link>

            <span className="text-slate-600">•</span>

            <Link href="/invite" className="text-slate-400 hover:text-orange-400 transition text-xs whitespace-nowrap">
              Invité?
            </Link>

            <span className="text-slate-600">•</span>

            <a
              href="https://www.instagram.com/kemiamotors/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-orange-400 transition text-lg"
              title="Kemia Motors Instagram"
            >
              📷
            </a>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition flex-shrink-0">
            <Image
              src="/kemia-logo.svg"
              alt="Kemia Motors"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
          </Link>

          {/* Center: Links */}
          <div className="flex items-center gap-8">
            <Link href="/auth/login" className="text-slate-400 hover:text-orange-400 transition text-sm">
              Connexion
            </Link>

            <Link href="/invite" className="text-slate-400 hover:text-orange-400 transition text-sm">
              Vous êtes invité?
            </Link>

            <a
              href="https://www.instagram.com/kemiamotors/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-orange-400 transition text-lg"
              title="Kemia Motors Instagram"
            >
              📷
            </a>
          </div>

          {/* Right: Copyright */}
          <div className="text-xs text-slate-500 flex-shrink-0">© 2026 Kemia Motors</div>
        </div>

        {/* Mobile Copyright */}
        <div className="md:hidden text-center text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
          © 2026 Kemia Motors
        </div>
      </div>
    </footer>
  )
}
