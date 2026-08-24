import * as THREE from 'three'
import type { ParsedIfcModel, IfcGroupMesh } from '../../../ifc/types'

// Tâm hình học của 1 cấu kiện cụ thể trong 1 group đã gộp - cùng cách tra cứu group.geometry.
// groups + elementExpressIDs với resolveExpressId/extractElementHighlight trong
// IfcModelView.tsx, nhưng lấy trung bình toạ độ đỉnh thay vì tách hình học riêng.
function elementCentroid(group: IfcGroupMesh, expressID: number): THREE.Vector3 | null {
  const position = group.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
  const index = group.geometry.index
  if (!position || !index) return null
  const ranges = group.geometry.groups.filter((g) => group.elementExpressIDs[g.materialIndex ?? 0] === expressID)
  if (ranges.length === 0) return null

  const sum = new THREE.Vector3()
  let count = 0
  for (const r of ranges) {
    const end = r.start + r.count
    for (let i = r.start; i < end; i++) {
      const vi = index.array[i]
      sum.x += position.getX(vi)
      sum.y += position.getY(vi)
      sum.z += position.getZ(vi)
      count++
    }
  }
  if (count === 0) return null
  return sum.divideScalar(count)
}

const COLUMN_CLASSES = new Set(['IFCCOLUMN', 'IFCCOLUMNSTANDARDCASE'])

/**
 * Chọn ra `count` cấu kiện CỘT THẬT trong mô hình đã tải, trả về toạ độ tâm hình học của
 * chúng - dùng làm vị trí đặt điểm đánh dấu va chạm thật (file "TH- VA CHAM.xlsx" CBC cung
 * cấp không kèm toạ độ/trục cụ thể cho từng va chạm, tất cả đều mô tả dạng "X va chạm CỘT"),
 * nên đặt điểm đánh dấu lên đúng cấu kiện cột thật của mô hình - không phải toạ độ chính xác
 * 1-1 khớp với từng va chạm trong ảnh gốc, nhưng vẫn nằm trên kết cấu thật thay vì bịa số.
 * Chọn dàn đều theo danh sách expressID (đã sắp) để các điểm không dồn vào 1 chỗ.
 */
export function pickColumnPositions(model: ParsedIfcModel, count: number): THREE.Vector3[] {
  const columnIDs: number[] = []
  for (const [expressID, info] of model.elements) {
    if (COLUMN_CLASSES.has(info.ifcClass.toUpperCase())) columnIDs.push(expressID)
  }
  if (columnIDs.length === 0 || count <= 0) return []
  columnIDs.sort((a, b) => a - b)

  const positions: THREE.Vector3[] = []
  const step = Math.max(1, Math.floor(columnIDs.length / count))
  for (let i = 0; i < count && i * step < columnIDs.length; i++) {
    const expressID = columnIDs[i * step]
    for (const group of model.groups) {
      if (!group.elementExpressIDs.includes(expressID)) continue
      const centroid = elementCentroid(group, expressID)
      if (centroid) positions.push(centroid)
      break
    }
  }
  return positions
}
