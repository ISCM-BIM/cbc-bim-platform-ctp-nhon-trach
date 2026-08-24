import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Discipline } from '../../../types'
import { DISCIPLINE_COLORS } from '../../../data/constants'
import type { ParsedIfcModel, Ifc4dPlan, IfcGroupMesh, IfcGroupKey } from '../../../ifc/types'
import { buildScheduleIndex } from '../../../ifc/ifc4d'
import { groupKeyToString } from '../../../ifc/groupKey'
import { PHASE_COLORS, type ConstructionPhase } from '../../../ifc/constructionPhase'
import { MEP_SYSTEM_COLORS, type MepSystemCategory } from '../../../ifc/mepSystem'

// Tra ngược faceIndex (từ sự kiện click raycast của R3F) -> expressID cấu kiện sở hữu tam
// giác đó, dựa vào geometry.groups do BufferGeometryUtils.mergeGeometries(..., true) tạo ra
// (mỗi group ứng với đúng 1 hình học gốc đã gộp vào, materialIndex là chỉ số trong mảng
// elementExpressIDs song song - xem ghi chú chi tiết trong src/ifc/parseIfc.ts).
function resolveExpressId(group: IfcGroupMesh, faceIndex: number): number | null {
  const indexPos = faceIndex * 3
  for (const g of group.geometry.groups) {
    if (indexPos >= g.start && indexPos < g.start + g.count) {
      return group.elementExpressIDs[g.materialIndex ?? 0] ?? null
    }
  }
  return null
}

// Trích riêng phần chỉ số (index) thuộc về 1 expressID cụ thể trong 1 group đã gộp, dùng
// attribute vị trí DÙNG CHUNG (không copy) để vẽ đè lớp highlight khi người dùng chọn 1 cấu
// kiện - một cấu kiện có thể có nhiều PlacedGeometry (đa vật liệu) nên gộp nhiều range lại.
function extractElementHighlight(groups: IfcGroupMesh[], expressID: number): THREE.BufferGeometry | null {
  for (const group of groups) {
    if (!group.elementExpressIDs.includes(expressID)) continue
    const srcIndex = group.geometry.index
    if (!srcIndex) continue
    const ranges = group.geometry.groups.filter((g) => group.elementExpressIDs[g.materialIndex ?? 0] === expressID)
    if (ranges.length === 0) continue
    const total = ranges.reduce((sum, r) => sum + r.count, 0)
    const out = new Uint32Array(total)
    let offset = 0
    for (const r of ranges) {
      for (let i = 0; i < r.count; i++) out[offset + i] = srcIndex.array[r.start + i]
      offset += r.count
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', group.geometry.getAttribute('position'))
    geo.setIndex(new THREE.BufferAttribute(out, 1))
    return geo
  }
  return null
}

interface IfcModelViewProps {
  model: ParsedIfcModel
  plan: Ifc4dPlan
  month: number
  visibleDisciplines: Record<Discipline, boolean>
  visibleStoreys: 'all' | Set<number | null>
  visibleMepSystems: Record<MepSystemCategory, boolean>
  selectedExpressID: number | null
  onSelectElement: (expressID: number | null) => void
  clipPlane: THREE.Plane
  cutEnabled: boolean
}

export function IfcModelView({
  model,
  plan,
  month,
  visibleDisciplines,
  visibleStoreys,
  visibleMepSystems,
  selectedExpressID,
  onSelectElement,
  clipPlane,
  cutEnabled,
}: IfcModelViewProps) {
  // Kết cấu/Kiến trúc tô theo GIAI ĐOẠN THI CÔNG (PHASE_COLORS), MEP tô theo HỆ THỐNG THẬT
  // (MEP_SYSTEM_COLORS - cấp gió/hồi gió/nước lạnh/lò hơi/khí nén/cấp thoát nước/điện...) thay
  // vì theo bộ môn phẳng - đây là 3 bộ môn chiếm gần hết khối lượng cấu kiện thật của dự án nên
  // tô đồng nhất theo bộ môn chỉ ra vài màu phẳng, khó phân biệt các nhóm con quan trọng với
  // nhau. Chỉ còn Hạ tầng tô theo màu bộ môn phẳng (không có khái niệm giai đoạn/hệ riêng).
  const materials = useMemo(() => {
    const clippingPlanes = cutEnabled ? [clipPlane] : []
    const make = (color: string) => new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7, clippingPlanes })
    const byPhase = (Object.keys(PHASE_COLORS) as ConstructionPhase[]).reduce<Record<ConstructionPhase, THREE.Material>>(
      (acc, phase) => {
        acc[phase] = make(PHASE_COLORS[phase])
        return acc
      },
      {} as Record<ConstructionPhase, THREE.Material>,
    )
    const byMepSystem = (Object.keys(MEP_SYSTEM_COLORS) as MepSystemCategory[]).reduce<Record<MepSystemCategory, THREE.Material>>(
      (acc, cat) => {
        acc[cat] = make(MEP_SYSTEM_COLORS[cat])
        return acc
      },
      {} as Record<MepSystemCategory, THREE.Material>,
    )
    const byDiscipline: Partial<Record<Discipline, THREE.Material>> = {
      'Hạ tầng': make(DISCIPLINE_COLORS['Hạ tầng']),
    }
    return { byPhase, byMepSystem, byDiscipline }
  }, [clipPlane, cutEnabled])

  const materialForGroup = (key: IfcGroupKey): THREE.Material => {
    if (key.discipline === 'MEP') return materials.byMepSystem[key.mepSystem ?? 'khac']
    return materials.byDiscipline[key.discipline] ?? materials.byPhase[key.phase]
  }

  // Tra O(1) theo group thay vì .find() tuyến tính cho từng group mỗi lần render (xem
  // buildScheduleIndex) - chỉ dựng lại khi đổi plan (đổi model hoặc tinh chỉnh 4D thủ công),
  // không phải mỗi khung hình lúc kéo/chạy thanh trượt.
  const scheduleIndex = useMemo(() => buildScheduleIndex(plan), [plan])

  const highlightGeometry = useMemo(
    () => (selectedExpressID != null ? extractElementHighlight(model.groups, selectedExpressID) : null),
    [model, selectedExpressID],
  )
  const highlightMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ed1c24',
        emissive: '#ed1c24',
        emissiveIntensity: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [],
  )

  return (
    <group>
      {model.groups.map((group) => {
        const schedule = scheduleIndex.get(groupKeyToString(group.key))
        const isBuilt = month >= (schedule?.startMonth ?? plan.minMonth)
        const disciplineOn = visibleDisciplines[group.key.discipline]
        const storeyOn = visibleStoreys === 'all' || visibleStoreys.has(group.key.storeyExpressID)
        // Bộ lọc hệ MEP chỉ áp dụng cho nhóm thuộc bộ môn MEP - các bộ môn khác luôn qua được.
        const mepSystemOn = group.key.discipline !== 'MEP' || visibleMepSystems[group.key.mepSystem ?? 'khac']
        if (!isBuilt || !disciplineOn || !storeyOn || !mepSystemOn) return null

        return (
          <mesh
            key={groupKeyToString(group.key)}
            geometry={group.geometry}
            material={materialForGroup(group.key)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              if (e.faceIndex == null) return
              onSelectElement(resolveExpressId(group, e.faceIndex))
            }}
          />
        )
      })}
      {highlightGeometry && <mesh geometry={highlightGeometry} material={highlightMaterial} />}
    </group>
  )
}
