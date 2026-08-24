import type { ReactNode } from 'react'

type Accent = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const ACCENT_CLASSES: Record<Accent, string> = {
  brand: 'bg-brand/15 text-brand',
  info: 'bg-status-info/15 text-status-info',
  success: 'bg-status-success/15 text-status-success',
  warning: 'bg-status-warning/15 text-status-warning',
  danger: 'bg-status-danger/15 text-status-danger',
  neutral: 'bg-surface-container-high text-on-surface-variant',
}

interface KpiCardProps {
  label: string
  value: string
  icon: ReactNode
  accent?: Accent
  sub?: string
}

export function KpiCard({ label, value, icon, accent = 'neutral', sub }: KpiCardProps) {
  return (
    <div className="panel panel-hover animate-countup flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-on-surface-variant">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center ${ACCENT_CLASSES[accent]}`}>{icon}</div>
      </div>
      <div>
        <p className="font-heading text-2xl font-semibold tabular-nums text-on-surface">{value}</p>
        {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  )
}
