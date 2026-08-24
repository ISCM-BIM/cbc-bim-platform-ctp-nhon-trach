import type { ClashStatus, Discipline } from '../types'
import { clashes } from '../data/clashes'
import { fieldChanges } from '../data/fieldChanges'
import { quantityItems, QUANTITY_GROUPS } from '../data/quantities'
import {
  BLOCKS,
  BLOCK_PROGRESS,
  CHART_PALETTE,
  CURRENT_DATE,
  OVERALL_ACTUAL_PROGRESS,
  OVERALL_PLANNED_PROGRESS,
  PROJECT_START,
  PROJECT_VALUE,
  TOTAL_PROJECT_DAYS,
  ELAPSED_DAYS,
} from '../data/constants'
import { addDays, clamp } from './random'
import { formatDateShort } from './format'

// Chỉ liệt kê các cặp bộ môn THỰC SỰ xuất hiện trong dữ liệu xung đột (tối đa bằng số màu
// trong CHART_PALETTE), sắp theo alphabet để cố định - gán màu theo tên (định danh), không
// theo thứ hạng giá trị, để màu không đổi giữa các lần render hay khi dữ liệu thay đổi.
const ALL_DISCIPLINE_PAIR_NAMES: string[] = Array.from(
  new Set(clashes.map((c) => [c.disciplineA, c.disciplineB].sort().join(' – '))),
).sort()

export function disciplinePairColor(name: string): string {
  const idx = ALL_DISCIPLINE_PAIR_NAMES.indexOf(name)
  return CHART_PALETTE[(idx >= 0 ? idx : 0) % CHART_PALETTE.length]
}

export function getOpenClashCount(): number {
  return clashes.filter((c) => c.status === 'Mới' || c.status === 'Đang xử lý').length
}

export function getResolvedClashCount(): number {
  return clashes.filter((c) => c.status === 'Đã xử lý').length
}

export function getPreventedCost(): number {
  return clashes
    .filter((c) => c.status === 'Đã xử lý' && (c.severity === 'A' || c.severity === 'B'))
    .reduce((sum, c) => sum + c.estimatedCost, 0)
}

export function getFieldChangesRecent(days = 30): number {
  const from = addDays(CURRENT_DATE, -days)
  return fieldChanges.filter((f) => f.date >= from && f.date <= CURRENT_DATE).length
}

export function getClashCountByStatus(): Record<ClashStatus, number> {
  const result: Record<ClashStatus, number> = {
    Mới: 0,
    'Đang xử lý': 0,
    'Đã xử lý': 0,
    'Bỏ qua': 0,
  }
  clashes.forEach((c) => {
    result[c.status] += 1
  })
  return result
}

export function getClashCountBySeverity(): Record<'A' | 'B' | 'C', number> {
  return {
    A: clashes.filter((c) => c.severity === 'A').length,
    B: clashes.filter((c) => c.severity === 'B').length,
    C: clashes.filter((c) => c.severity === 'C').length,
  }
}

export interface NamedValue {
  name: string
  value: number
}

export function getClashByDisciplinePair(): NamedValue[] {
  const map = new Map<string, number>()
  clashes.forEach((c) => {
    const pair = [c.disciplineA, c.disciplineB].sort().join(' – ')
    map.set(pair, (map.get(pair) ?? 0) + 1)
  })
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getClashByDiscipline(): Record<Discipline, number> {
  const result: Record<Discipline, number> = {
    'Kiến trúc': 0,
    'Kết cấu': 0,
    MEP: 0,
    'Hạ tầng': 0,
  }
  clashes.forEach((c) => {
    result[c.disciplineA] += 1
    if (c.disciplineB !== c.disciplineA) result[c.disciplineB] += 1
  })
  return result
}

export function getClashWeeklyTrend(weeks = 12): Array<{ label: string; phat_hien: number; xu_ly: number }> {
  const out: Array<{ label: string; phat_hien: number; xu_ly: number }> = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = addDays(CURRENT_DATE, -7 * i)
    const weekStart = addDays(weekEnd, -6)
    const detected = clashes.filter((c) => c.detectedDate >= weekStart && c.detectedDate <= weekEnd).length
    const resolved = clashes.filter(
      (c) => c.resolvedDate && c.resolvedDate >= weekStart && c.resolvedDate <= weekEnd,
    ).length
    out.push({ label: formatDateShort(weekEnd), phat_hien: detected, xu_ly: resolved })
  }
  return out
}

export function getBlockProgressData() {
  return BLOCKS.map((b) => ({
    block: b.name,
    hoan_thanh: BLOCK_PROGRESS[b.id],
    con_lai: 100 - BLOCK_PROGRESS[b.id],
  }))
}

function smoothSegment(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 <= x0) return y1
  const t = clamp((x - x0) / (x1 - x0), 0, 1)
  const s = t * t * (3 - 2 * t)
  return y0 + (y1 - y0) * s
}

export interface SCurvePoint {
  week: number
  label: string
  ke_hoach: number
  thuc_te: number | null
}

export function getSCurveWeeklyData(): SCurvePoint[] {
  const totalWeeks = Math.round(TOTAL_PROJECT_DAYS / 7)
  const currentWeek = Math.round(ELAPSED_DAYS / 7)
  const data: SCurvePoint[] = []
  for (let w = 0; w <= totalWeeks; w++) {
    const planned = Math.round(
      w <= currentWeek
        ? smoothSegment(w, 0, currentWeek, 0, OVERALL_PLANNED_PROGRESS)
        : smoothSegment(w, currentWeek, totalWeeks, OVERALL_PLANNED_PROGRESS, 100),
    )
    const actual =
      w <= currentWeek ? Math.round(smoothSegment(w, 0, currentWeek, 0, OVERALL_ACTUAL_PROGRESS)) : null
    data.push({
      week: w,
      label: formatDateShort(addDays(PROJECT_START, w * 7)),
      ke_hoach: planned,
      thuc_te: actual,
    })
  }
  return data
}

// ----- Khối lượng & Chi phí (5D) -----

export function getContractValue(): number {
  return PROJECT_VALUE
}

export function getExecutedValue(): number {
  return Math.round((PROJECT_VALUE * OVERALL_ACTUAL_PROGRESS) / 100)
}

export function getTotalQuantityVariance(): number {
  return quantityItems.reduce((sum, i) => sum + Math.abs(i.costImpact), 0)
}

export function getFlaggedQuantityCount(): number {
  return quantityItems.filter((i) => i.status !== 'Khớp').length
}

// Tỷ lệ khối lượng trong hồ sơ dự toán hiện đã được đối chiếu bằng bóc tách tự động từ mô
// hình BIM thay vì bóc tay truyền thống - chỉ số phản ánh mức độ trưởng thành quy trình.
export const MODEL_TAKEOFF_COVERAGE = 87

export function getQuantityByGroup(): Array<{ group: string; hop_dong: number; mo_hinh: number }> {
  return QUANTITY_GROUPS.map((g) => {
    const items = quantityItems.filter((i) => i.group === g)
    return {
      group: g,
      hop_dong: items.reduce((s, i) => s + i.contractQty * i.unitPrice, 0),
      mo_hinh: items.reduce((s, i) => s + i.modelQty * i.unitPrice, 0),
    }
  })
}

export function getCostCurveData(): SCurvePoint[] {
  const totalWeeks = Math.round(TOTAL_PROJECT_DAYS / 7)
  const currentWeek = Math.round(ELAPSED_DAYS / 7)
  const executedPercent = OVERALL_ACTUAL_PROGRESS
  const plannedPercent = OVERALL_PLANNED_PROGRESS
  const data: SCurvePoint[] = []
  for (let w = 0; w <= totalWeeks; w++) {
    const planned = Math.round(
      w <= currentWeek
        ? smoothSegment(w, 0, currentWeek, 0, plannedPercent)
        : smoothSegment(w, currentWeek, totalWeeks, plannedPercent, 100),
    )
    const actual = w <= currentWeek ? Math.round(smoothSegment(w, 0, currentWeek, 0, executedPercent)) : null
    data.push({
      week: w,
      label: formatDateShort(addDays(PROJECT_START, w * 7)),
      ke_hoach: Math.round((planned / 100) * PROJECT_VALUE),
      thuc_te: actual === null ? null : Math.round((actual / 100) * PROJECT_VALUE),
    })
  }
  return data
}

export function getTopCostVarianceItems(limit = 10) {
  return [...quantityItems].sort((a, b) => Math.abs(b.costImpact) - Math.abs(a.costImpact)).slice(0, limit)
}
