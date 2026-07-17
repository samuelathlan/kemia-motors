import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      className="w-full p-6 border-t"
      style={{
        borderColor: '#D9622B',
        backgroundColor: '#0f172a',
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/kemia-logo.svg"
            alt="Kemia Motors"
            width={40}
            height={40}
            className="drop-shadow-lg"
          />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/auth/login" className="text-slate-300 hover:text-orange-400 transition">
            Connexion
          </Link>

          <Link href="/invite" className="text-slate-300 hover:text-orange-400 transition">
            Vous êtes invité?
          </Link>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/kemiamotors/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-orange-400 transition text-xl"
            title="Kemia Motors Instagram"
          >
            📷
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500">© 2026 Kemia Motors</div>
      </div>
    </footer>
  )
}
