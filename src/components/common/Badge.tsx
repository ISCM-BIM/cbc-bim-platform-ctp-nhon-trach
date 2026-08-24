import type { ReactNode } from 'react'

export type BadgeTone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: 'bg-brand/15 text-brand ring-brand/30',
  info: 'bg-status-info/15 text-status-info ring-status-info/30',
  success: 'bg-status-success/15 text-status-success ring-status-success/30',
  warning: 'bg-status-warning/15 text-status-warning ring-status-warning/30',
  danger: 'bg-status-danger/15 text-status-danger ring-status-danger/30',
  neutral: 'bg-surface-container-high text-on-surface-variant ring-outline-variant',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
