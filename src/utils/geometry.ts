import type { BlockId } from '../types'

export interface BlockLayout {
  x0: number
  z0: number
  width: number
  depth: number
}

// Bố cục mặt bằng 4 block theo lưới 2x2, đơn vị mét - dùng chung cho mô hình 3D
// và để tính vị trí marker xung đột. Mỗi block ~125m x 78m (~9.750 m²).
export const BLOCK_LAYOUT: Record<BlockId, BlockLayout> = {
  A: { x0: 0, z0: 0, width: 125, depth: 78 },
  B: { x0: 145, z0: 0, width: 125, depth: 78 },
  C: { x0: 0, z0: 98, width: 125, depth: 78 },
  D: { x0: 145, z0: 98, width: 125, depth: 78 },
}

export const SITE_BOUNDS = { width: 270, depth: 176 }

export function parseElevation(elevation: string): number {
  return parseFloat(elevation.replace('+', '').replace(',', '.'))
}

export function blockCenter(block: BlockId): { x: number; z: number } {
  const b = BLOCK_LAYOUT[block]
  return { x: b.x0 + b.width / 2, z: b.z0 + b.depth / 2 }
}
