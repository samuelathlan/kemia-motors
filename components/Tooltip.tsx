'use client'

import { useState } from 'react'

export default function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-slate-800 text-slate-200 whitespace-nowrap z-10 pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  )
}
