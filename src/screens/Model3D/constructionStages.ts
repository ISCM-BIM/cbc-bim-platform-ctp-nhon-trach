import type { BlockId } from '../../types'

// Độ lệch tiến độ giữa các block (block A thi công trước, D sau cùng) - tính bằng "tháng"
// trên thanh trượt 4D, tương ứng với độ lệch thực tế trong dữ liệu tiến độ (schedule.ts).
export const BLOCK_STAGGER: Record<BlockId, number> = { A: 0, B: 0.6, C: 1.4, D: 2.1 }

export const STAGE_MONTH = {
  foundation: 1.0,
  columns: 2.0,
  trusses: 2.7,
  roof: 3.6,
  walls: 4.4,
  containerDoors: 5.2,
  officeStructure: 4.8,
  officeFinish: 6.6,
  mep: 5.8,
} as const

export type ConstructionStage = keyof typeof STAGE_MONTH

export function stageMonth(block: BlockId, stage: ConstructionStage): number {
  return STAGE_MONTH[stage] + BLOCK_STAGGER[block]
}

// Trải mốc xuất hiện của từng cấu kiện trong một nhóm (VD: từng cột dọc theo chiều dài)
// ra trong khoảng `span` tháng để tạo hiệu ứng "dựng dần" khi kéo thanh trượt.
export function sequencedMonth(baseMonth: number, index: number, count: number, span: number): number {
  if (count <= 1) return baseMonth
  return baseMonth + (index / (count - 1)) * span
}

export const MIN_MONTH = 1
export const MAX_MONTH = 9
