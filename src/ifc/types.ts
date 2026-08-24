import type * as THREE from 'three'
import type { Discipline } from '../types'
import type { ConstructionPhase } from './constructionPhase'
import type { MepSystemCategory } from './mepSystem'

// Cây không gian IFC (IfcProject -> IfcSite -> IfcBuilding -> IfcBuildingStorey -> cấu kiện),
// rút gọn từ Node trả về bởi web-ifc properties.getSpatialStructure - chỉ giữ phần cần cho
// hiển thị (không giữ nguyên toàn bộ thuộc tính thô).
export interface IfcSpatialNode {
  expressID: number
  ifcClass: string
  name: string
  children: IfcSpatialNode[]
}

export interface IfcStorey {
  expressID: number
  name: string
  /** Cao độ (m), đã quy đổi theo đơn vị dự án. null nếu không đọc được (dùng thứ tự cây làm dự phòng). */
  elevation: number | null
  /** Thứ tự thấp -> cao sau khi sắp xếp theo elevation (dự phòng: thứ tự xuất hiện trong cây). */
  order: number
}

export interface IfcElementInfo {
  expressID: number
  ifcClass: string
  storeyExpressID: number | null
  discipline: Discipline
  /** Giai đoạn thi công trong nội bộ 1 bộ môn (móng/khung/sàn-mái/bao che/hoàn thiện) - dùng
   * để chia nhỏ nhóm hiển thị/4D hơn là chỉ (tầng x bộ môn), xem constructionPhase.ts. */
  phase: ConstructionPhase
  /** Hệ thống MEP thật (cấp gió/hồi gió/nước lạnh/lò hơi/khí nén/cấp thoát nước/điện...) - chỉ
   * có ý nghĩa khi discipline === 'MEP', null cho mọi bộ môn khác. Xem mepSystem.ts. */
  mepSystem: MepSystemCategory | null
}

export interface IfcGroupKey {
  storeyExpressID: number | null
  discipline: Discipline
  phase: ConstructionPhase
  mepSystem: MepSystemCategory | null
}

// Một mesh đã gộp hình học của TẤT CẢ cấu kiện cùng (tầng x bộ môn x giai đoạn) - đơn vị
// hiển thị VÀ đơn vị áp dụng mốc 4D (mỗi group nhận đúng 1 khoảng tháng trên thanh trượt).
// Màu sắc/legend vẫn chỉ theo bộ môn (4 màu) - phase chỉ ảnh hưởng cách gộp/thứ tự 4D, không
// thêm màu/khái niệm mới ra UI.
export interface IfcGroupMesh {
  key: IfcGroupKey
  geometry: THREE.BufferGeometry
  /** Song song với geometry.groups: elementExpressIDs[group.materialIndex] = expressID chủ sở hữu. */
  elementExpressIDs: number[]
}

export interface IfcElementProperties {
  expressID: number
  name: string
  globalId: string
  ifcClass: string
  /** Danh sách Pset đã dẹt phẳng thành cặp tên/giá trị hiển thị được, gộp theo tên Pset. */
  propertySets: { name: string; properties: { name: string; value: string }[] }[]
}

export interface ParsedIfcModel {
  modelID: number
  fileName: string
  fileSizeBytes: number
  spatialTree: IfcSpatialNode
  storeys: IfcStorey[]
  elements: Map<number, IfcElementInfo>
  groups: IfcGroupMesh[]
  elementCount: number
  triangleCount: number
}

export type IfcParseStage = 'fetching' | 'reading' | 'opening' | 'geometry' | 'structure' | 'done'

export interface IfcParseProgress {
  stage: IfcParseStage
  /** 0..1 khi biết được tổng số (vd. StreamAllMeshes có index/total); undefined nếu không rõ. */
  ratio?: number
  detail?: string
}

// ----- 4D (thanh trượt tiến độ) -----

export type Ifc4dSource = 'native' | 'schedule' | 'manual'

export interface Ifc4dGroupSchedule {
  key: IfcGroupKey
  /** Nhãn hiển thị, vd. "Tầng 2 · Kết cấu". */
  label: string
  startMonth: number
  endMonth: number
}

export interface Ifc4dPlan {
  source: Ifc4dSource
  minMonth: number
  maxMonth: number
  schedules: Ifc4dGroupSchedule[]
}
