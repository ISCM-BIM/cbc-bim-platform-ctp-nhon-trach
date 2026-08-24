import { PROJECT_START, TOTAL_PROJECT_DAYS } from '../../data/constants'
import { daysBetween } from '../../utils/random'

export function datePercent(date: Date): number {
  const d = daysBetween(PROJECT_START, date)
  return Math.min(100, Math.max(0, (d / TOTAL_PROJECT_DAYS) * 100))
}

export function rangePercent(start: Date, end: Date): { left: number; width: number } {
  const left = datePercent(start)
  const right = datePercent(end)
  return { left, width: Math.max(0.4, right - left) }
}
