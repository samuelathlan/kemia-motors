'use client'

type StatCardProps = {
  label: string
  value: string | number
  subtitle?: string
  icon?: string
  variant?: 'primary' | 'secondary'
}

export function StatCard({ label, value, subtitle, icon, variant = 'primary' }: StatCardProps) {
  const isPrimary = variant === 'primary'

  return (
    <div
      className={`p-4 rounded-lg border ${
        isPrimary ? 'border-slate-700 bg-slate-800/50' : 'border-slate-800 bg-slate-900'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${isPrimary ? '' : 'text-slate-300'}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  )
}
