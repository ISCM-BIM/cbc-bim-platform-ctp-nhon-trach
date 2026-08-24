import type { IfcGroupKey } from './types'
import type { ConstructionPhase } from './constructionPhase'
import type { MepSystemCategory } from './mepSystem'
import { scheduleItems } from '../data/schedule'
import { PROJECT_START } from '../data/constants'
import { daysBetween } from '../utils/random'

// Gắn từng nhóm cấu kiện IFC (tầng × bộ môn × giai đoạn / hệ MEP) vào ĐÚNG khoảng ngày thật của
// đúng hạng mục tương ứng trong tiến độ thi công thật (data/schedule.ts, 232 dòng trích từ file
// MS Project gốc) - thay cho cách trải đều 1-N tháng không gắn với ngày thật nào.
//
// QUAN TRỌNG: model IFC hiện tại (`NT-CTP_NT3-CD-A-R6_7-R24_detached.ifc`) chỉ dựng ĐÚNG 1 trong
// 2 nhà xưởng của gói thầu - **RBF6** (KHÔNG PHẢI cả RBF6+RBF7 - xác nhận trực tiếp từ người
// dùng 2026-08-24, dù tên file có "R6_7" dễ gây hiểu nhầm; "R6_7"/"R24" nhiều khả năng là ký hiệu
// TRỤC LƯỚI của phần model được tách/detached ra, không phải "RBF6-7"). Vì vậy toàn bộ bảng ánh
// xạ dưới đây trỏ vào đúng nhánh WBS "4.3" (RBF6) trong schedule.ts, KHÔNG dùng nhánh "4.4"
// (RBF7) hay các mục dùng chung cho cả 2 nhà (4.1 San lấp/4.2 Công tác cọc - cọc ép chung 1 đợt
// cho cả RBF6+RBF7 trước khi từng nhà xưởng bắt đầu phần ngầm riêng, xem schedule.ts). Nếu sau
// này đổi sang model dựng RBF7 hoặc cả 2 nhà, bảng này cần cập nhật lại tương ứng.
//
// Quy tắc chọn mã WBS cho mỗi giai đoạn (đối chiếu tên hạng mục thật trong schedule.ts, không
// suy đoán):
// - coc khớp "4.2" (Công tác cọc - DÙNG CHUNG cho cả RBF6+RBF7, chạy trước khi 4.3 bắt đầu).
// - mong khớp trực tiếp "4.3.1 Phần ngầm (Móng + Cổ cột + Đà kiềng)".
// - khung/san_mai gộp chung "4.3.3 Kết cấu bên trên" + "4.3.4 Kết cấu thép" - tiến độ thật không
//   tách riêng "chỉ cột/dầm" khỏi "chỉ sàn/mái" thành 2 mã WBS khác nhau ở cấp đủ chi tiết cho
//   toàn bộ zone, nên dùng chung khung ngày như nhau cho 2 giai đoạn này (giống cách dự án trước
//   cũng cho 2 giai đoạn này chung/chồng lấn khung ngày).
// - bao_che khớp các dòng lắp dựng tôn mái/vách + tường gạch - đây là công trình khung thép mái/
//   vách tôn (không phải panel/gạch bao che như dự án trước), "tường gạch" (4.3.5.1) chỉ là
//   tường ngăn/bao che phụ.
// - hoan_thien dùng khung rộng "4.3.5 Công tác hoàn thiện".
// - khac (fallback an toàn) dùng cả nhánh "4.3" (RBF6).
const PHASE_WBS: Record<ConstructionPhase, string[]> = {
  coc: ['4.2'],
  mong: ['4.3.1'],
  khung: ['4.3.3', '4.3.4'],
  san_mai: ['4.3.3', '4.3.4'],
  bao_che: ['4.3.4.3', '4.3.4.4', '4.3.5.1'],
  hoan_thien: ['4.3.5'],
  khac: ['4.3'],
}

// Hệ MEP -> đúng dòng công tác MEPF thật khớp. Tiến độ thật của RBF6 CHỈ có 1 dòng MEPF duy
// nhất ("4.3.6 Công tác MEPF / MEPF works", không tách theo từng hệ như dự án trước có tới 18
// dòng con) - nên cả 8 nhóm hệ MEP (mepSystem.ts) đều dùng chung khung ngày của dòng này, không
// suy đoán tách nhỏ hơn khi hồ sơ gốc không có.
const MEPF_WBS = ['4.3.6']
const MEP_SYSTEM_WBS: Record<MepSystemCategory, string[]> = {
  cap_gio: MEPF_WBS,
  hoi_thai_gio: MEPF_WBS,
  nuoc_lanh: MEPF_WBS,
  lo_hoi_nuoc_nong: MEPF_WBS,
  khi_nen: MEPF_WBS,
  cap_thoat_nuoc: MEPF_WBS,
  dien_chieu_sang: MEPF_WBS,
  khac: MEPF_WBS,
}

// Hạ tầng kỹ thuật sân bãi/đường - model kiến trúc RBF6 hiện không có cấu kiện Hạ tầng nào (0
// phần tử phân loại 'Hạ tầng' qua disciplineMap.ts khi khảo sát trực tiếp file), giữ mã này để
// sẵn sàng nếu sau này có model khác gộp cả hạ tầng.
const HA_TANG_WBS = ['4.10']

export interface RealDayRange {
  startDay: number
  endDay: number
}

const rangeCache = new Map<string, RealDayRange>()

function computeRange(wbsCodes: string[]): RealDayRange {
  const items = scheduleItems.filter((s) => wbsCodes.includes(s.wbsCode))
  // Không khớp mã nào (không nên xảy ra - toàn bộ mã ở trên lấy trực tiếp từ schedule.ts) - rơi
  // về khung cả khối RBF6 (4.3) làm phương án an toàn, không được throw giữa lúc dựng mô hình 3D.
  const source = items.length > 0 ? items : scheduleItems.filter((s) => s.wbsCode === '4.3')
  const days = source.map((s) => ({
    start: daysBetween(PROJECT_START, s.plannedStart),
    end: daysBetween(PROJECT_START, s.plannedEnd),
  }))
  return {
    startDay: Math.min(...days.map((d) => d.start)),
    endDay: Math.max(...days.map((d) => d.end)),
  }
}

function rangeFor(cacheKey: string, wbsCodes: string[]): RealDayRange {
  let cached = rangeCache.get(cacheKey)
  if (!cached) {
    cached = computeRange(wbsCodes)
    rangeCache.set(cacheKey, cached)
  }
  return cached
}

/** Khoảng ngày thật (tính từ PROJECT_START) của đúng hạng mục tiến độ tương ứng 1 nhóm cấu kiện
 * IFC - dùng làm khung cho startMonth/endMonth trong buildSchedulePlan (ifc4d.ts). */
export function realDayRangeForGroup(key: IfcGroupKey): RealDayRange {
  if (key.discipline === 'Hạ tầng') return rangeFor('hatang', HA_TANG_WBS)
  if (key.discipline === 'MEP') {
    const system = key.mepSystem ?? 'khac'
    return rangeFor(`mep:${system}`, MEP_SYSTEM_WBS[system])
  }
  return rangeFor(`phase:${key.phase}`, PHASE_WBS[key.phase])
}

/** Khoảng ngày thật của TOÀN BỘ 1 hạng mục cấp cao (vd "4.3" = cả RBF6) - dùng làm khung
 * minMonth/maxMonth cho thanh trượt 4D ở useIfcModel.ts, THAY vì khung "toàn bộ Giai đoạn 2"
 * (349 ngày, gồm cả RBF7/San lấp/Công tác cọc) - model hiện chỉ dựng 1 nhà (RBF6, xem ghi chú
 * đầu file), dùng khung rộng hơn thực tế sẽ tạo 1 đoạn "chết" ở đầu/cuối thanh trượt (RBF6 thật
 * ra chưa/đã xong nhưng thanh trượt vẫn còn khoảng trống không đổi gì). */
export function realDayRangeForWbs(wbsCode: string): RealDayRange {
  return rangeFor(`wbs:${wbsCode}`, [wbsCode])
}
