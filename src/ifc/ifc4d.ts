import type { IfcAPI } from 'web-ifc'
import { IFCTASK, IFCRELASSIGNSTOPROCESS } from 'web-ifc'
import type { IfcGroupMesh, IfcStorey, IfcGroupKey, Ifc4dGroupSchedule, Ifc4dPlan } from './types'
import { groupKeyToString } from './groupKey'
import { PHASE_LABEL } from './constructionPhase'
import { MEP_SYSTEM_LABEL } from './mepSystem'
import { realDayRangeForGroup } from './realScheduleMapping'

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44

// Quy đổi ngày (offset từ PROJECT_START, xem data/constants.ts) <-> "tháng" dùng cho toàn bộ
// thanh trượt 4D - xuất ra để useIfcModel.ts dùng ĐÚNG 1 công thức duy nhất khi tính khung
// minMonth/maxMonth từ TOTAL_CONSTRUCTION_DAYS, tránh 2 nơi định nghĩa 30.44 rồi lệch nhau.
export const DAYS_PER_MONTH = 30.44

function unwrap(raw: unknown): string | number | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  if (typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    return (raw as { value: string | number }).value
  }
  return undefined
}

function parseIfcDate(raw: unknown): Date | null {
  const v = unwrap(raw)
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Dò dữ liệu 4D gốc trong file (IfcTask + IfcTaskTime + IfcRelAssignsToProcess) - hiếm gặp vì
 * file Revit xuất kiến trúc/kết cấu/MEP thông thường không có, chỉ xuất hiện khi ai đó đã làm
 * 4D bằng công cụ khác (Navisworks/Synchro...) rồi export lại. Trả về null nếu không đủ dữ
 * liệu tin cậy (phần lớn trường hợp) để rơi về heuristic.
 */
export async function detectNativeSchedule(
  api: IfcAPI,
  modelID: number,
  groups: IfcGroupMesh[],
): Promise<Ifc4dPlan | null> {
  try {
    const taskLines = api.GetLineIDsWithType(modelID, IFCTASK)
    if (taskLines.size() === 0) return null

    // expressID cấu kiện -> khoảng ngày sớm nhất/muộn nhất tìm được từ các task liên quan.
    // Quét trực tiếp toàn bộ IfcRelAssignsToProcess (RelatingProcess = task, RelatedObjects =
    // cấu kiện tham gia) - không dùng properties.getRelatedProperties() vì đó là API nội bộ
    // (private trong khai báo kiểu), quét trực tiếp theo type ổn định hơn giữa các version.
    const elementRanges = new Map<number, { start: Date; finish: Date }>()
    const relLines = api.GetLineIDsWithType(modelID, IFCRELASSIGNSTOPROCESS)
    for (let i = 0; i < relLines.size(); i++) {
      const rel = await api.properties.getItemProperties(modelID, relLines.get(i), false)
      const processRef = rel?.RelatingProcess?.value
      if (processRef == null) continue
      const task = await api.properties.getItemProperties(modelID, processRef, false)
      const taskTimeRef = task?.TaskTime?.value
      if (taskTimeRef == null) continue
      const taskTime = await api.properties.getItemProperties(modelID, taskTimeRef, false)
      const start = parseIfcDate(taskTime?.ScheduleStart) ?? parseIfcDate(taskTime?.EarlyStart)
      const finish = parseIfcDate(taskTime?.ScheduleFinish) ?? parseIfcDate(taskTime?.EarlyFinish)
      if (!start || !finish) continue

      const relatedObjects: { value: number }[] = Array.isArray(rel?.RelatedObjects) ? rel.RelatedObjects : []
      for (const obj of relatedObjects) {
        const existing = elementRanges.get(obj.value)
        elementRanges.set(obj.value, {
          start: existing && existing.start < start ? existing.start : start,
          finish: existing && existing.finish > finish ? existing.finish : finish,
        })
      }
    }

    if (elementRanges.size === 0) return null

    // Gộp về mức group (tầng x bộ môn): mỗi group lấy khoảng bao trùm mọi cấu kiện thành
    // viên có dữ liệu 4D. Yêu cầu tối thiểu 50% số group có dữ liệu mới coi là "đáng tin cậy"
    // - nếu không, phần còn lại quá rời rạc, rơi về heuristic cho toàn bộ sẽ nhất quán hơn.
    let resolvedGroups = 0
    const groupRanges = new Map<string, { start: Date; finish: Date }>()
    for (const group of groups) {
      const key = groupKeyToString(group.key)
      let start: Date | null = null
      let finish: Date | null = null
      for (const expressID of group.elementExpressIDs) {
        const range = elementRanges.get(expressID)
        if (!range) continue
        if (!start || range.start < start) start = range.start
        if (!finish || range.finish > finish) finish = range.finish
      }
      if (start && finish) {
        groupRanges.set(key, { start, finish })
        resolvedGroups++
      }
    }

    if (resolvedGroups < groups.length * 0.5) return null

    let minDate = Infinity
    let maxDate = -Infinity
    for (const r of groupRanges.values()) {
      minDate = Math.min(minDate, r.start.getTime())
      maxDate = Math.max(maxDate, r.finish.getTime())
    }
    if (!Number.isFinite(minDate) || !Number.isFinite(maxDate) || minDate >= maxDate) return null

    const toMonth = (t: number) => 1 + (t - minDate) / MS_PER_MONTH
    const maxMonth = Math.max(2, toMonth(maxDate))

    const schedules: Ifc4dGroupSchedule[] = groups.map((group) => {
      const key = groupKeyToString(group.key)
      const range = groupRanges.get(key)
      return {
        key: group.key,
        label: groupLabel(group, []),
        startMonth: range ? round2(toMonth(range.start.getTime())) : round2(maxMonth),
        endMonth: range ? round2(toMonth(range.finish.getTime())) : round2(maxMonth),
      }
    })

    return { source: 'native', minMonth: 1, maxMonth: round2(maxMonth), schedules }
  } catch {
    return null
  }
}

function groupLabel(group: IfcGroupMesh, storeys: IfcStorey[]): string {
  const storey = storeys.find((s) => s.expressID === group.key.storeyExpressID)
  const storeyName = group.key.storeyExpressID === null ? 'Toàn công trình' : storey?.name ?? 'Không rõ tầng'
  // "Khác" không thêm gì mới (đã ngụ ý bởi tên bộ môn) - chỉ hiện nhãn giai đoạn khi có ý
  // nghĩa phân biệt thật (móng/khung/sàn-mái/bao che/hoàn thiện). Nhóm MEP hiện nhãn hệ thống
  // thay vì giai đoạn (MEP không chia giai đoạn - luôn 'khac', xem constructionPhase.ts).
  const phaseSuffix = group.key.phase === 'khac' ? '' : ` · ${PHASE_LABEL[group.key.phase]}`
  const mepSuffix = group.key.discipline === 'MEP' && group.key.mepSystem ? ` · ${MEP_SYSTEM_LABEL[group.key.mepSystem]}` : ''
  return `${storeyName} · ${group.key.discipline}${phaseSuffix}${mepSuffix}`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function bucketKey(key: IfcGroupKey): string {
  if (key.discipline === 'MEP') return `mep:${key.mepSystem ?? 'khac'}`
  if (key.discipline === 'Hạ tầng') return 'hatang'
  return `phase:${key.phase}`
}

/**
 * Gắn thanh trượt 4D vào ĐÚNG tiến độ thi công thật khi file IFC không có dữ liệu 4D gốc (trường
 * hợp phổ biến nhất - xem detectNativeSchedule): mỗi nhóm cấu kiện (tầng × bộ môn × giai đoạn /
 * hệ MEP) được gắn vào khoảng ngày thật của đúng hạng mục tương ứng trong data/schedule.ts (274
 * dòng trích từ file MS Project gốc, xem realScheduleMapping.ts cho bảng đối chiếu) - THAY vì
 * trải đều 1-9 tháng không gắn với ngày thật nào như bản heuristic cũ.
 *
 * Trong nội bộ 1 hạng mục thật (vd "4.2.3 Phần khung bê tông cốt thép" áp dụng cho CẢ TOÀ NHÀ,
 * tiến độ thật không tách riêng theo tầng), vẫn xếp các tầng theo thứ tự thấp -> cao và trải đều
 * trong đúng khoảng ngày thật đó - đây là phần còn lại mang tính suy luận (tiến độ thật không ghi
 * "tầng nào trước, tầng nào sau" trong cùng 1 dòng công tác), nhưng khung THỜI GIAN tổng thể của
 * cả nhóm giờ đã bám đúng ngày thật, không còn là suy diễn thuần tuý như trước.
 */
export function buildSchedulePlan(groups: IfcGroupMesh[], storeys: IfcStorey[], minMonth = 1, maxMonth = 9): Ifc4dPlan {
  const storeyOrder = new Map(storeys.map((s) => [s.expressID, s.order]))

  const withRange = groups.map((group) => ({
    group,
    bucket: bucketKey(group.key),
    range: realDayRangeForGroup(group.key),
  }))

  const bucketCounts = new Map<string, number>()
  for (const w of withRange) bucketCounts.set(w.bucket, (bucketCounts.get(w.bucket) ?? 0) + 1)

  // Sắp cả danh sách theo (ngày bắt đầu thật của bucket, rồi tầng thấp -> cao trong nội bộ bucket
  // đó) - thứ tự này chỉ quyết định chỉ số i/count dùng để trải đều bên dưới, không ảnh hưởng gì
  // khác.
  const sorted = [...withRange].sort((a, b) => {
    if (a.bucket !== b.bucket) return a.range.startDay - b.range.startDay
    const rankA = a.group.key.storeyExpressID !== null ? storeyOrder.get(a.group.key.storeyExpressID) ?? 0 : -1
    const rankB = b.group.key.storeyExpressID !== null ? storeyOrder.get(b.group.key.storeyExpressID) ?? 0 : -1
    return rankA - rankB
  })

  const bucketIndex = new Map<string, number>()
  const dayToMonth = (day: number) => 1 + day / DAYS_PER_MONTH

  const schedules: Ifc4dGroupSchedule[] = sorted.map(({ group, bucket, range }) => {
    const count = bucketCounts.get(bucket)!
    const idx = bucketIndex.get(bucket) ?? 0
    bucketIndex.set(bucket, idx + 1)
    // Trải đều trên 85% đầu của khung ngày THẬT của riêng hạng mục này - để lại khoảng cuối như
    // một biên "hoàn thiện" thay vì tầng cuối cùng chỉ xuất hiện đúng lúc hạng mục đó kết thúc.
    const t = count <= 1 ? 0 : idx / (count - 1)
    const spanDays = Math.max(1, range.endDay - range.startDay)
    const startMonth = clampMonth(dayToMonth(range.startDay + t * spanDays * 0.85), minMonth, maxMonth)
    return {
      key: group.key,
      label: groupLabel(group, storeys),
      startMonth: round2(startMonth),
      endMonth: round2(maxMonth),
    }
  })

  return { source: 'schedule', minMonth, maxMonth, schedules }
}

function clampMonth(m: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, m))
}

/** Áp bảng tinh chỉnh thủ công (khoá bằng groupKeyToString) lên một plan có sẵn - dùng cho
 * panel tinh chỉnh 4D (vai trò Quản lý BIM) và cho việc nhập lại file JSON đã lưu trước đó. */
export function applyManualOverrides(
  plan: Ifc4dPlan,
  overrides: Map<string, { startMonth: number; endMonth: number }>,
): Ifc4dPlan {
  if (overrides.size === 0) return plan
  const schedules = plan.schedules.map((s) => {
    const override = overrides.get(groupKeyToString(s.key))
    return override ? { ...s, startMonth: override.startMonth, endMonth: override.endMonth } : s
  })
  return { ...plan, source: 'manual', schedules }
}

export interface CurrentActivity {
  storeyName: string
  activityLabel: string
}

/**
 * Mô tả ngắn gọn "đang thi công gì" tại đúng thời điểm `month` trên thanh trượt - lấy nhóm có
 * startMonth LỚN NHẤT nhưng vẫn <= month (nhóm "mới xuất hiện gần đây nhất" tính đến thời điểm
 * này), dùng đúng thông tin group đó suy ra tầng + hạng mục. Cố tình KHÔNG hiện chi tiết hệ MEP
 * cụ thể (vd "Cấp gió tươi/FCU-AHU") - model thật có thể có hàng trăm nhóm, nhiều nhóm MEP nối
 * đuôi nhau trong khoảng thời gian rất ngắn nên hiện chi tiết sẽ nhảy liên tục, khó đọc; chỉ hiện
 * "Hệ thống MEP" chung cho dễ theo dõi. Kết cấu/Kiến trúc vẫn hiện đúng giai đoạn (số lượng giai
 * đoạn ít, không bị vấn đề tương tự) vì đây mới là thông tin người xem thường quan tâm nhất.
 */
export function describeCurrentActivity(plan: Ifc4dPlan, month: number, storeys: IfcStorey[]): CurrentActivity | null {
  let best: Ifc4dGroupSchedule | null = null
  for (const s of plan.schedules) {
    if (s.startMonth > month) continue
    if (!best || s.startMonth > best.startMonth) best = s
  }
  if (!best) return null

  const storey = storeys.find((st) => st.expressID === best!.key.storeyExpressID)
  const storeyName = best.key.storeyExpressID === null ? 'Toàn công trình' : (storey?.name ?? 'Không rõ tầng')

  let activityLabel: string
  if (best.key.discipline === 'MEP') {
    activityLabel = 'Hệ thống MEP'
  } else if (best.key.phase !== 'khac') {
    activityLabel = PHASE_LABEL[best.key.phase]
  } else {
    activityLabel = best.key.discipline
  }

  return { storeyName, activityLabel }
}

/**
 * Dựng chỉ mục tra cứu O(1) (khoá chuỗi -> lịch nhóm) từ 1 plan - PHẢI dựng 1 LẦN (useMemo theo
 * plan) rồi tra bằng .get() trong vòng lặp render, KHÔNG được gọi .find() riêng cho từng nhóm
 * trong IfcModelView như bản trước: model thật có thể có hàng trăm nhóm (tầng x bộ môn x giai
 * đoạn x hệ MEP), tra tuyến tính cho MỖI nhóm ở MỖI lần render (đặc biệt lúc bấm Play - chạy lại
 * mỗi khung hình) là O(số nhóm²) mỗi lần vẽ, gây giật khi model có nhiều nhóm - đã đo thực tế
 * thấy góp phần đáng kể vào độ giật trên model 508MB/nhiều nhóm MEP.
 */
export function buildScheduleIndex(plan: Ifc4dPlan): Map<string, Ifc4dGroupSchedule> {
  const index = new Map<string, Ifc4dGroupSchedule>()
  for (const s of plan.schedules) index.set(groupKeyToString(s.key), s)
  return index
}
