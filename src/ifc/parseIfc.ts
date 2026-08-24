import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { IfcAPI, FlatMesh, PlacedGeometry } from 'web-ifc'
import { IFCPROJECT, IFCUNITASSIGNMENT, IFCRELDEFINESBYTYPE, IFCRELASSIGNSTOGROUP } from 'web-ifc'
import { classifyDiscipline } from './disciplineMap'
import { classifyConstructionPhase } from './constructionPhase'
import { classifyMepSystem } from './mepSystem'
import { groupKeyToString } from './groupKey'
import type {
  IfcElementInfo,
  IfcElementProperties,
  IfcGroupMesh,
  IfcParseProgress,
  IfcSpatialNode,
  IfcStorey,
  ParsedIfcModel,
} from './types'

const SPATIAL_CLASSES = new Set(['IFCPROJECT', 'IFCSITE', 'IFCBUILDING', 'IFCBUILDINGSTOREY'])

const SI_PREFIX_SCALE: Record<string, number> = {
  EXA: 1e18,
  PETA: 1e15,
  TERA: 1e12,
  GIGA: 1e9,
  MEGA: 1e6,
  KILO: 1e3,
  HECTO: 1e2,
  DECA: 1e1,
  DECI: 1e-1,
  CENTI: 1e-2,
  MILLI: 1e-3,
  MICRO: 1e-6,
  NANO: 1e-9,
}

export class InvalidIfcFileError extends Error {}

/** Kiểm tra nhanh header STEP ("ISO-10303-21") trước khi tốn công parse - phản hồi lỗi tức thì
 * nếu người dùng lỡ chọn nhầm file không phải IFC. */
export function assertLooksLikeIfc(bytes: Uint8Array, fileName: string): void {
  const head = new TextDecoder('ascii').decode(bytes.subarray(0, 200))
  if (!head.includes('ISO-10303-21')) {
    throw new InvalidIfcFileError(
      `"${fileName}" không có định dạng IFC hợp lệ (thiếu header ISO-10303-21). Hãy xuất lại file .ifc từ Revit (File → Export → IFC).`,
    )
  }
}

function unwrap(raw: unknown): string | number | boolean | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return raw
  if (typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    return (raw as { value: string | number | boolean }).value
  }
  return undefined
}

/** Đọc IfcUnitAssignment của dự án để quy đổi toạ độ hình học về mét - file Revit xuất IFC
 * theo mẫu mét thường khai đơn vị dài là millimét, nếu không quy đổi mô hình sẽ to gấp 1000
 * lần dự kiến trong scene (vỡ camera/clipping). Mặc định trả 1 (giả định đã là mét) nếu
 * không đọc được, để không làm hỏng hoàn toàn việc hiển thị. */
async function detectLengthScaleToMeters(api: IfcAPI, modelID: number): Promise<number> {
  try {
    const unitLines = api.GetLineIDsWithType(modelID, IFCUNITASSIGNMENT)
    if (unitLines.size() === 0) return 1
    const assignment = api.GetLine(modelID, unitLines.get(0), true)
    const units: unknown[] = Array.isArray(assignment?.Units) ? assignment.Units : []
    for (const unit of units) {
      const u = unit as Record<string, unknown>
      if (unwrap(u.UnitType) !== 'LENGTHUNIT') continue
      const prefix = unwrap(u.Prefix)
      if (typeof prefix === 'string' && prefix in SI_PREFIX_SCALE) return SI_PREFIX_SCALE[prefix]
      return 1 // IfcSIUnit không Prefix = mét (đơn vị SI gốc), hoặc IfcConversionBasedUnit lạ -> giả định mét
    }
  } catch {
    // Bỏ qua - dùng giá trị mặc định bên dưới.
  }
  return 1
}

/**
 * Đọc IfcRelDefinesByType để dựng chỉ mục expressID cấu kiện -> tên family/type Revit gốc
 * (RelatingType.Name, vd "CBC_S_PILE UST:400mm-P1"). QUAN TRỌNG - phát hiện qua file dự án
 * thật: nhiều đồ án Revit->IFC xuất TẤT CẢ cọc, đài móng VÀ sàn thật xuống chung 1 lớp
 * IfcSlab, lớp IFC không đủ để phân biệt - chỉ tên type mới cho biết đâu là cọc/đài móng
 * (xem classifyConstructionPhase). Không dùng properties.getRelatedProperties() (API nội bộ,
 * không có trong kiểu khai báo) - quét trực tiếp theo type ổn định hơn giữa các version, cùng
 * cách detectNativeSchedule() trong ifc4d.ts đang làm.
 */
async function buildTypeNameIndex(api: IfcAPI, modelID: number): Promise<Map<number, string>> {
  const result = new Map<number, string>()
  try {
    const relLines = api.GetLineIDsWithType(modelID, IFCRELDEFINESBYTYPE)
    for (let i = 0; i < relLines.size(); i++) {
      const rel = await api.properties.getItemProperties(modelID, relLines.get(i), false)
      const typeRef = (rel?.RelatingType as { value?: number } | undefined)?.value
      if (typeRef == null) continue
      const typeLine = await api.properties.getItemProperties(modelID, typeRef, false)
      const typeName = unwrap(typeLine?.Name)
      if (typeof typeName !== 'string' || !typeName) continue

      const relatedObjects: { value: number }[] = Array.isArray(rel?.RelatedObjects) ? rel.RelatedObjects : []
      for (const obj of relatedObjects) result.set(obj.value, typeName)
    }
  } catch {
    // Bỏ qua - phân loại giai đoạn sẽ rơi về đúng bảng PHASE_BY_CLASS theo lớp IFC.
  }
  return result
}

/**
 * Đọc IfcRelAssignsToGroup để dựng chỉ mục expressID cấu kiện -> ObjectType của IfcSystem thật
 * mà cấu kiện được gán vào (vd "M-Cấp Gió FCU/AHU-SAD", "M-Cấp Chiller-Chiller Supply (CHWS)") -
 * đây là tín hiệu CHÍNH để phân loại hệ thống MEP (xem mepSystem.ts), do kỹ sư MEP tự đặt tên
 * khi dựng hệ trong Revit nên đáng tin hơn nhiều so với đoán từ lớp IFC hay tên family. Cùng
 * kiểu quét trực tiếp theo type (không dùng properties.getRelatedProperties() nội bộ) như
 * buildTypeNameIndex bên dưới.
 */
async function buildMepSystemIndex(api: IfcAPI, modelID: number): Promise<Map<number, string>> {
  const result = new Map<number, string>()
  try {
    const relLines = api.GetLineIDsWithType(modelID, IFCRELASSIGNSTOGROUP)
    for (let i = 0; i < relLines.size(); i++) {
      const rel = await api.properties.getItemProperties(modelID, relLines.get(i), false)
      const groupRef = (rel?.RelatingGroup as { value?: number } | undefined)?.value
      if (groupRef == null) continue
      const groupLine = await api.properties.getItemProperties(modelID, groupRef, false)
      const objectType = unwrap(groupLine?.ObjectType)
      if (typeof objectType !== 'string' || !objectType) continue

      const relatedObjects: { value: number }[] = Array.isArray(rel?.RelatedObjects) ? rel.RelatedObjects : []
      for (const obj of relatedObjects) result.set(obj.value, objectType)
    }
  } catch {
    // Bỏ qua - phân loại hệ MEP sẽ rơi về tên family/type hoặc nhóm "Khác".
  }
  return result
}

type RawSpatialNode = { expressID: number; type: string; children?: unknown[]; Name?: unknown }

/**
 * Đi cây trả về bởi properties.getSpatialStructure(). QUAN TRỌNG - đã sửa 1 lỗi thực tế phát
 * hiện qua file thật nhiều cấu kiện (xem bộ nhớ/commit liên quan): cây này không chỉ mang
 * phân cấp KHÔNG GIAN (Project→Site→Building→Storey qua IFCRELAGGREGATES/
 * IFCRELCONTAINEDINSPATIALSTRUCTURE) mà một cấu kiện THẬT cũng có thể có "children" riêng
 * qua IFCRELAGGREGATES ở cấp cấu kiện - vd một hệ vách kính (IfcCurtainWall) thường được
 * phân rã thành các thanh đứng/tấm kính con (IfcMember/IfcPlate...). Bản trước chỉ coi
 * children là "container không gian" khi type nằm trong SPATIAL_CLASSES, còn lại luôn dừng
 * lại coi là lá - khiến các cấu kiện con kiểu này (hàng nghìn trong 1 file thật) không bao
 * giờ được ghé thăm, "mồ côi" không tra được tầng/bộ môn dù StreamAllMeshes vẫn trả về hình
 * học của chúng bình thường (rơi vào nhóm "Toàn công trình" mặc định).
 *
 * Quy tắc đúng: CHỈ 4 lớp không gian (SPATIAL_CLASSES) mới là "container thuần" (không tự
 * đăng ký là cấu kiện). Mọi lớp khác luôn được đăng ký là 1 cấu kiện THẬT (dù có children hay
 * không), đồng thời vẫn tiếp tục đi xuống children của chính nó (nếu có) để không bỏ sót cấu
 * kiện con lồng bên trong.
 */
function walkSpatialTree(
  raw: RawSpatialNode,
  currentStoreyID: number | null,
  storeys: IfcStorey[],
  elements: Map<number, IfcElementInfo>,
  typeNames: Map<number, string>,
  systemObjectTypes: Map<number, string>,
): IfcSpatialNode {
  // Quan trọng: GetNameFromTypeCode() trả tên lớp IFC nguyên dạng EXPRESS ("IfcSite",
  // "IfcWall"...), CHỈ node gốc IfcProject do web-ifc tự tạo là viết hoa toàn bộ
  // ("IFCPROJECT" - xem newIfcProject() trong properties helper). Phải chuẩn hoá về chữ hoa
  // trước khi so khớp SPATIAL_CLASSES/classifyDiscipline, nếu không cây sẽ luôn dừng ngay ở
  // cấp con đầu tiên (đã phát hiện qua smoke test thực tế).
  const ifcClass = raw.type.toUpperCase()
  const isSpatialContainer = SPATIAL_CLASSES.has(ifcClass)
  const isStorey = ifcClass === 'IFCBUILDINGSTOREY'
  const storeyForChildren = isStorey ? raw.expressID : currentStoreyID

  if (isStorey) {
    // Đặt tên tạm rỗng - tên hiển thị thật (kèm số thứ tự tầng thấp->cao) được gán sau khi đã
    // sắp theo cao độ, xem enrichStoreys() bên dưới (nếu không, số thứ tự dự phòng sẽ theo
    // đúng thứ tự xuất hiện trong file chứ không theo cao độ thật, gây nhầm lẫn tên tầng).
    storeys.push({ expressID: raw.expressID, name: (unwrap(raw.Name) as string) || '', elevation: null, order: storeys.length })
  } else if (!isSpatialContainer) {
    const discipline = classifyDiscipline(ifcClass)
    elements.set(raw.expressID, {
      expressID: raw.expressID,
      ifcClass,
      storeyExpressID: currentStoreyID,
      discipline,
      phase: classifyConstructionPhase(ifcClass, typeNames.get(raw.expressID)),
      // Chỉ phân loại hệ MEP cho đúng bộ môn MEP - null cho các bộ môn khác vì khái niệm "hệ
      // thống" không áp dụng (vd một bức tường không thuộc "hệ" nào).
      mepSystem: discipline === 'MEP' ? classifyMepSystem(systemObjectTypes.get(raw.expressID), typeNames.get(raw.expressID)) : null,
    })
  }

  const children = Array.isArray(raw.children) ? raw.children : []
  const childNodes = children.map((child) =>
    walkSpatialTree(child as RawSpatialNode, storeyForChildren, storeys, elements, typeNames, systemObjectTypes),
  )

  return {
    expressID: raw.expressID,
    ifcClass,
    name: (unwrap(raw.Name) as string) || '',
    children: childNodes,
  }
}

async function assignStoreyElevations(api: IfcAPI, modelID: number, storeys: IfcStorey[], lengthScale: number) {
  for (const storey of storeys) {
    try {
      const line = api.GetLine(modelID, storey.expressID, false)
      const elevation = unwrap(line?.Elevation)
      if (typeof elevation === 'number') storey.elevation = elevation * lengthScale
      // Name rỗng khá thường gặp ở file Revit xuất qua ODA - thử LongName trước khi phải
      // dùng số thứ tự dự phòng (xem assignFallbackStoreyNames).
      if (!storey.name) {
        const longName = unwrap(line?.LongName)
        if (typeof longName === 'string' && longName.trim()) storey.name = longName.trim()
      }
    } catch {
      // Giữ nguyên - sẽ đặt tên dự phòng theo đúng thứ tự cao độ ở bước sau.
    }
  }
}

/** Đặt tên dự phòng "Tầng N" cho storey không có Name/LongName thật - PHẢI gọi sau khi đã sắp
 * `storeys` theo cao độ, để số thứ tự khớp đúng thực tế thấp->cao (nếu đặt tên ngay lúc đi
 * cây, thứ tự sẽ theo thứ tự xuất hiện trong file - có thể hoàn toàn khác thứ tự cao độ, gây
 * nhầm lẫn nghiêm trọng vd "Tầng 11" lại là tầng thấp nhất công trình). */
function assignFallbackStoreyNames(storeys: IfcStorey[]): void {
  storeys.forEach((s, i) => {
    if (!s.name) s.name = `Tầng ${i + 1}`
  })
}

function decodeGeometry(api: IfcAPI, modelID: number, placed: PlacedGeometry): THREE.BufferGeometry | null {
  const ifcGeometry = api.GetGeometry(modelID, placed.geometryExpressID)
  const vertexData = api.GetVertexArray(ifcGeometry.GetVertexData(), ifcGeometry.GetVertexDataSize())
  const indexData = api.GetIndexArray(ifcGeometry.GetIndexData(), ifcGeometry.GetIndexDataSize())
  ifcGeometry.delete()
  if (vertexData.length === 0 || indexData.length === 0) return null

  // web-ifc trả buffer đỉnh xen kẽ [x,y,z,nx,ny,nz] (stride 6) cho mỗi đỉnh.
  const vertexCount = vertexData.length / 6
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = vertexData[i * 6]
    positions[i * 3 + 1] = vertexData[i * 6 + 1]
    positions[i * 3 + 2] = vertexData[i * 6 + 2]
    normals[i * 3] = vertexData[i * 6 + 3]
    normals[i * 3 + 1] = vertexData[i * 6 + 4]
    normals[i * 3 + 2] = vertexData[i * 6 + 5]
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setIndex(new THREE.BufferAttribute(indexData, 1))

  // flatTransformation: ma trận 4x4 dạng cột (column-major), tương thích trực tiếp với
  // THREE.Matrix4.fromArray - đúng quy ước mà web-ifc thiết kế để dùng chung với three.js.
  // QUAN TRỌNG: ma trận này đã tự bao gồm hệ số quy đổi đơn vị dự án -> mét (đã kiểm chứng
  // bằng smoke test thực tế: hệ số tỉ lệ trong ma trận khớp đúng với Prefix MILLI khai trong
  // IfcUnitAssignment) - KHÔNG được nhân thêm lengthScale ở đây nữa, chỉ dùng lengthScale cho
  // các thuộc tính vô hướng đọc trực tiếp (Elevation...) vốn không đi qua bộ máy hình học.
  geometry.applyMatrix4(new THREE.Matrix4().fromArray(placed.flatTransformation))

  return geometry
}

interface Bucket {
  storeyExpressID: number | null
  discipline: IfcElementInfo['discipline']
  phase: IfcElementInfo['phase']
  mepSystem: IfcElementInfo['mepSystem']
  geoms: THREE.BufferGeometry[]
  expressIDs: number[]
}

function buildGroups(
  api: IfcAPI,
  modelID: number,
  elements: Map<number, IfcElementInfo>,
  onProgress?: (p: IfcParseProgress) => void,
): { groups: IfcGroupMesh[]; triangleCount: number } {
  const buckets = new Map<string, Bucket>()

  api.StreamAllMeshes(modelID, (flatMesh: FlatMesh, index: number, total: number) => {
    if (index % 200 === 0) {
      onProgress?.({ stage: 'geometry', ratio: total > 0 ? index / total : undefined, detail: `${index}/${total} cấu kiện` })
    }
    const info = elements.get(flatMesh.expressID)
    const discipline = info?.discipline ?? classifyDiscipline('')
    const phase = info?.phase ?? classifyConstructionPhase('')
    const mepSystem = info?.mepSystem ?? null
    const storeyExpressID = info?.storeyExpressID ?? null
    const key = groupKeyToString({ storeyExpressID, discipline, phase, mepSystem })
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { storeyExpressID, discipline, phase, mepSystem, geoms: [], expressIDs: [] }
      buckets.set(key, bucket)
    }

    const geoms = flatMesh.geometries
    for (let i = 0; i < geoms.size(); i++) {
      const placed = geoms.get(i)
      const geometry = decodeGeometry(api, modelID, placed)
      if (geometry) {
        bucket.geoms.push(geometry)
        bucket.expressIDs.push(flatMesh.expressID)
      }
    }
  })

  const groups: IfcGroupMesh[] = []
  let triangleCount = 0
  for (const bucket of buckets.values()) {
    if (bucket.geoms.length === 0) continue
    const merged = bucket.geoms.length === 1 ? bucket.geoms[0] : mergeGeometries(bucket.geoms, true)
    if (!merged) continue
    if (bucket.geoms.length === 1 && !merged.groups.length) {
      merged.addGroup(0, merged.index ? merged.index.count : 0, 0)
    }
    triangleCount += (merged.index?.count ?? 0) / 3
    groups.push({
      key: { storeyExpressID: bucket.storeyExpressID, discipline: bucket.discipline, phase: bucket.phase, mepSystem: bucket.mepSystem },
      geometry: merged,
      elementExpressIDs: bucket.expressIDs,
    })
  }
  return { groups, triangleCount }
}

/**
 * Đọc và dựng một file .ifc thành dữ liệu hiển thị được (cây không gian, mesh đã gộp theo
 * tầng x bộ môn, index tra cứu thuộc tính). Chạy hoàn toàn phía client - không gửi file đi
 * đâu cả, đúng triết lý "không backend" của toàn platform.
 */
export async function parseIfcFile(
  api: IfcAPI,
  file: File,
  onProgress?: (p: IfcParseProgress) => void,
): Promise<ParsedIfcModel> {
  onProgress?.({ stage: 'reading' })
  const bytes = new Uint8Array(await file.arrayBuffer())
  assertLooksLikeIfc(bytes, file.name)

  onProgress?.({ stage: 'opening' })
  const modelID = api.OpenModel(bytes, { COORDINATE_TO_ORIGIN: true })

  try {
    const lengthScale = await detectLengthScaleToMeters(api, modelID)

    onProgress?.({ stage: 'structure' })
    const projectLines = api.GetLineIDsWithType(modelID, IFCPROJECT)
    if (projectLines.size() === 0) {
      throw new InvalidIfcFileError(`"${file.name}" không tìm thấy IFCPROJECT - file có thể bị hỏng hoặc không đúng chuẩn IFC.`)
    }
    const rawTree = await api.properties.getSpatialStructure(modelID, false)

    // Đọc trước tên family/type Revit gốc (bắt buộc để phân biệt cọc/đài móng/sàn thật khi
    // file gộp chung 1 lớp IFC - xem ghi chú tại buildTypeNameIndex) và ObjectType của hệ thống
    // MEP thật (để phân loại cấp gió/hồi gió/nước lạnh/... - xem buildMepSystemIndex).
    onProgress?.({ stage: 'structure', detail: 'Đọc family/type cấu kiện...' })
    const typeNames = await buildTypeNameIndex(api, modelID)
    const systemObjectTypes = await buildMepSystemIndex(api, modelID)

    const storeys: IfcStorey[] = []
    const elements = new Map<number, IfcElementInfo>()
    const spatialTree = walkSpatialTree(rawTree as never, null, storeys, elements, typeNames, systemObjectTypes)
    await assignStoreyElevations(api, modelID, storeys, lengthScale)

    // Sắp thấp -> cao theo cao độ thật; storey không đọc được cao độ giữ nguyên thứ tự xuất
    // hiện trong cây (đã là thứ tự Site->Building->Storey hợp lý trong đa số file).
    const withElevation = storeys.filter((s) => s.elevation !== null)
    const knownScale = withElevation.length >= 2
    if (knownScale) {
      storeys.sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0))
    }
    storeys.forEach((s, i) => {
      s.order = i
    })
    assignFallbackStoreyNames(storeys)

    const { groups, triangleCount } = buildGroups(api, modelID, elements, onProgress)

    onProgress?.({ stage: 'done', ratio: 1 })

    return {
      modelID,
      fileName: file.name,
      fileSizeBytes: file.size,
      spatialTree,
      storeys,
      elements,
      groups,
      elementCount: elements.size,
      triangleCount: Math.round(triangleCount),
    }
  } catch (err) {
    api.CloseModel(modelID)
    throw err
  }
}

export function closeIfcModel(api: IfcAPI, modelID: number): void {
  try {
    api.CloseModel(modelID)
  } catch {
    // Model có thể đã đóng - bỏ qua.
  }
}

export interface ModelBounds {
  /** Tâm/bán kính "đã lọc nhiễu" - dùng để canh camera mặc định, bỏ qua vài cấu kiện lớn bất
   * thường (bãi/ranh đất, lưới trục kéo dài toàn site...) để công trình thật không bị thu nhỏ
   * thành 1 chấm. */
  center: [number, number, number]
  radius: number
  /** Bán kính đầy đủ (không lọc) - dùng làm giới hạn zoom-out tối đa, để người dùng vẫn kéo
   * ra xem được các cấu kiện lớn bất thường đó nếu muốn. */
  fullRadius: number
  /** Cao độ đặt mặt nền/lưới - LUÔN ngay dưới điểm thấp nhất (đã lọc nhiễu) của công trình,
   * KHÔNG suy ra từ center.y - radius (xem ghi chú tại chỗ tính bên dưới về lỗi thực tế đã
   * gặp với công trình rộng/dẹt). */
  groundY: number
}

function percentile(sorted: Float64Array, p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))
  return sorted[idx]
}

/** Bounding box của toàn model (đã ở đơn vị mét) - dùng để canh camera/OrbitControls tự động
 * khớp kích thước thật của file vừa tải lên. File IFC thật ngoài đời thường lẫn vài cấu kiện
 * quy mô toàn site (bãi/ranh đất, lưới trục, hàng rào/lan can kéo dài hàng trăm mét...) - nếu
 * tính bounding box gộp thô (hoặc thậm chí lọc theo TỪNG cấu kiện) sẽ vẫn bị vài cấu kiện dạng
 * "dài mảnh" này kéo giãn ra rất xa, khiến camera zoom ra quá xa và công trình thật chỉ còn là
 * 1 chấm nhỏ giữa khung hình - đã kiểm chứng bằng dữ liệu thật: lọc theo kích thước từng cấu
 * kiện không đủ, vì có cấu kiện dài 300-400m cũng "hợp lệ" theo tiêu chí đó.
 *
 * Giải pháp bền hơn: xét theo TỪNG ĐỈNH hình học (không phải từng cấu kiện) và lấy khoảng phân
 * vị (percentile) trên mỗi trục - phần công trình thật luôn có mật độ đỉnh dày đặc (hàng trăm
 * nghìn đỉnh dồn trong một khối nhỏ), còn cấu kiện dài mảnh dù toạ độ trải rộng nhưng số đỉnh
 * rất ít nên chỉ chiếm một phần nhỏ ở phần đuôi phân bố - bị cắt bởi percentile một cách tự
 * nhiên mà không cần đoán ngưỡng "cấu kiện lớn cỡ nào thì coi là bất thường". */
export function computeModelBounds(groups: IfcGroupMesh[]): ModelBounds {
  const fullBox = new THREE.Box3()
  let vertexCount = 0
  for (const g of groups) {
    g.geometry.computeBoundingBox()
    if (g.geometry.boundingBox) fullBox.union(g.geometry.boundingBox)
    vertexCount += g.geometry.getAttribute('position')?.count ?? 0
  }
  if (fullBox.isEmpty() || vertexCount === 0) return { center: [0, 0, 0], radius: 50, fullRadius: 50, groundY: -1 }

  const xs = new Float64Array(vertexCount)
  const ys = new Float64Array(vertexCount)
  const zs = new Float64Array(vertexCount)
  let cursor = 0
  for (const g of groups) {
    const position = g.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!position) continue
    for (let i = 0; i < position.count; i++) {
      xs[cursor] = position.getX(i)
      ys[cursor] = position.getY(i)
      zs[cursor] = position.getZ(i)
      cursor++
    }
  }
  xs.sort()
  ys.sort()
  zs.sort()

  // Giữ 96% khối lượng đỉnh ở giữa (2%..98%) mỗi trục - đủ rộng để không cắt nhầm 1 cánh nhà
  // hợp lệ, đủ chặt để loại các đuôi thưa thớt của cấu kiện dài mảnh lạc vào.
  const lo = 0.02
  const hi = 0.98
  const min = new THREE.Vector3(percentile(xs, lo), percentile(ys, lo), percentile(zs, lo))
  const max = new THREE.Vector3(percentile(xs, hi), percentile(ys, hi), percentile(zs, hi))
  const trimmedBox = new THREE.Box3(min, max)

  const center = new THREE.Vector3()
  trimmedBox.getCenter(center)
  const trimmedSize = new THREE.Vector3()
  trimmedBox.getSize(trimmedSize)
  const fullSize = new THREE.Vector3()
  fullBox.getSize(fullSize)

  // BUG THỰC TẾ #1 đã gặp trên công trình rộng/dẹt (nhà xưởng chân đế lớn, chiều cao thấp so với
  // chiều ngang - vd 45 tầng nhưng chỉ ~22m cao trong khi mặt bằng hàng trăm mét mỗi cạnh):
  // trước đây mặt nền đặt tại `center.y - radius * 0.02`, mà `radius` tính theo ĐƯỜNG CHÉO 3
  // TRỤC (length() của trimmedSize) nên bị chiều ngang chi phối hoàn toàn - offset dưới center
  // quá nhỏ so với chiều cao thật của công trình, khiến mặt nền lơ lửng NGANG GIỮA khối nhà thay
  // vì nằm dưới đáy, trông như 1 mặt phẳng cắt ngang.
  //
  // BUG THỰC TẾ #2 (phát hiện ngay sau khi sửa #1 bằng min.y ĐÃ LỌC PERCENTILE): cọc móng cắm
  // rất sâu xuống đất nhưng số ĐỈNH hình học của cọc (mảnh, tiết diện nhỏ) quá ít so với khối
  // lượng đỉnh của toàn bộ phần thân nhà phía trên - đúng kiểu cấu kiện bị percentile 2% coi là
  // "đuôi thưa" và loại bỏ (y hệt cơ chế đã lọc bỏ lưới trục/ranh đất ở computeModelBounds, chỉ
  // khác là lần này "nhiễu bị lọc nhầm" lại là dữ liệu THẬT cần giữ) - khiến min.y đã lọc nằm
  // CAO HƠN đáy cọc thật, mặt nền (đặt ngay trên min.y đó) che mất phần đáy cọc, trông như cọc
  // "bị cắt". Việc lọc percentile 2%/98% vốn sinh ra để chặn cấu kiện DÀI NGANG (lưới trục, ranh
  // đất kéo dài hàng trăm mét theo X/Z) - không nhắm tới cấu kiện SÂU THEO CHIỀU ĐỨNG như cọc,
  // nên chỉ trục Y mới cần nới lỏng: dùng đáy THẬT chưa lọc (fullBox.min.y) làm nền, X/Z và cạnh
  // trên trục Y vẫn giữ nguyên percentile (vẫn cần chặn lưới trục/ranh đất cho khung camera).
  const groundY = fullBox.min.y - Math.max(trimmedSize.y * 0.02, 0.05)

  return {
    center: [center.x, center.y, center.z],
    radius: Math.max(trimmedSize.length() / 2, 5),
    fullRadius: Math.max(fullSize.length() / 2, 5),
    groundY,
  }
}

/** Lấy thuộc tính chi tiết của một cấu kiện theo yêu cầu (khi người dùng bấm chọn) - không
 * tải trước cho toàn bộ model vì có thể rất chậm với file nhiều nghìn cấu kiện. */
export async function getElementProperties(api: IfcAPI, modelID: number, expressID: number): Promise<IfcElementProperties> {
  const line = await api.properties.getItemProperties(modelID, expressID, false)
  const psets = await api.properties.getPropertySets(modelID, expressID, true)
  // Dùng GetLineType/GetNameFromTypeCode (giống cách properties.getSpatialStructure tự làm
  // nội bộ) thay vì đọc field `type` thô trên kết quả GetLine - đáng tin cậy hơn.
  const typeCode = api.GetLineType(modelID, expressID)

  const propertySets: IfcElementProperties['propertySets'] = []
  for (const pset of psets as Record<string, unknown>[]) {
    const psetName = (unwrap(pset.Name) as string) || 'Pset'
    const rawProps = Array.isArray(pset.HasProperties) ? pset.HasProperties : []
    const properties: { name: string; value: string }[] = []
    for (const p of rawProps as Record<string, unknown>[]) {
      const name = unwrap(p.Name)
      const value = unwrap(p.NominalValue)
      if (name != null && value != null) {
        properties.push({ name: String(name), value: String(value) })
      }
    }
    if (properties.length > 0) propertySets.push({ name: psetName, properties })
  }

  return {
    expressID,
    name: (unwrap(line?.Name) as string) || '(không tên)',
    globalId: (unwrap(line?.GlobalId) as string) || '',
    ifcClass: api.GetNameFromTypeCode(typeCode) || '',
    propertySets,
  }
}
